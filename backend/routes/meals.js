const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /meals/search
 * 
 * Returns restaurants that offer at least one menu item under the given price.
 * Supports optional filters for ZIP code and cuisine type.
 * Supports pagination through 'page' and 'limit' query parameters.
 * 
 * Example: /meals/search?price=15&zip=97209&cuisine=Mexican&page=1&limit=10
 */
router.get('/search', async (req, res) => {
  const price = parseFloat(req.query.price);
  const zip = req.query.zip?.trim();
  const cuisine = req.query.cuisine?.trim();

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  const values = [];
  let paramIndex = 1;

  let joins = `
    JOIN Serves s ON r.restaurant_id = s.restaurant_id
    JOIN MenuItem m ON s.menu_item_id = m.menu_item_id
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
    where += ` AND LOWER(c.cuisine_name) = LOWER($${paramIndex})`;
    values.push(cuisine);
    paramIndex++;
  }

  const query = `
    SELECT
      r.restaurant_id,
      r.restaurant_name,
      r.street_address,
      r.zip_code,
      r.latitude,
      r.longitude,
      MIN(m.item_price) AS item_price
    FROM Restaurant r
    ${joins}
    WHERE ${where}
    GROUP BY r.restaurant_id
    ORDER BY r.restaurant_name
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;

  try {
    const result = await pool.query(query, [...values, limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error('Meal search failed:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
