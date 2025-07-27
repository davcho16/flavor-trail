// meals.js
// Express route handler for searching restaurants based on flexible filters.
// Supports query parameters for:
// - Maximum menu item price
// - ZIP code
// - Cuisine type (case-insensitive partial match)
// - Minimum restaurant rating
// - Pagination via `page` and `limit`
// Returns both the total number of matched restaurants and the current page of results.

const express = require('express');
const router = express.Router();
const pool = require('../db');

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

  // Required table joins to relate restaurants with menu items and reviews
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

  // First query to count total number of distinct matched restaurants
  const countQuery = `
    SELECT COUNT(DISTINCT r.restaurant_id) AS total
    FROM Restaurant r
    ${joins}
    WHERE ${where};
  `;

  // Second query to return current page of results
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
