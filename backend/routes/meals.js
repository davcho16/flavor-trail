const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /meals/search
 * 
 * Returns restaurants that offer at least one menu item under the given price.
 * Optional filters: ZIP code, cuisine, minimum rating.
 * Supports pagination via page + limit.
 */
router.get('/search', async (req, res) => {
  const price = parseFloat(req.query.price);
  const zip = req.query.zip?.trim();
  const cuisine = req.query.cuisine?.trim();
  const rating = parseFloat(req.query.rating);

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  const values = [];
  let paramIndex = 1;

  let joins = `
    JOIN Serves s ON r.restaurant_id = s.restaurant_id
    JOIN MenuItem m ON s.menu_item_id = m.menu_item_id
    JOIN Has h ON r.restaurant_id = h.restaurant_id
    JOIN RestaurantReview rr ON h.review_id = rr.review_id
  `;

  let where = `1=1`;

  if (!isNaN(price)) {
    where += ` AND m.item_price <= $${paramIndex}`;
    values.push(price);
    paramIndex++;
  }

  if (zip) {
    where += ` AND r.zip_code = $${paramIndex}`;
    values.push(zip);
    paramIndex++;
  }

  if (cuisine) {
    joins += `
      JOIN Offers o ON r.restaurant_id = o.restaurant_id
      JOIN CuisineType c ON o.cuisine_id = c.cuisine_id
    `;
    where += ` AND c.cuisine_name ILIKE $${paramIndex}`;
    values.push(`%${cuisine}%`);
    paramIndex++;
  }

  if (!isNaN(rating)) {
    where += ` AND rr.rating_score >= $${paramIndex}`;
    values.push(rating);
    paramIndex++;
  }

  const countQuery = `
    SELECT COUNT(DISTINCT r.restaurant_id) AS total
    FROM Restaurant r
    ${joins}
    WHERE ${where};
  `;

  const dataQuery = `
    SELECT
      r.restaurant_id,
      r.restaurant_name,
      r.street_address,
      r.zip_code,
      r.latitude,
      r.longitude,
      rr.rating_score,
      MIN(m.item_price) AS item_price
    FROM Restaurant r
    ${joins}
    WHERE ${where}
    GROUP BY r.restaurant_id, rr.rating_score
    ORDER BY r.restaurant_name
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;

  try {
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

    res.json({ results: dataResult.rows, total });
  } catch (err) {
    console.error('Meal search failed:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
