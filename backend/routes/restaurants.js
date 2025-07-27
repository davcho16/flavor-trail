// restaurants.js
// Express route handler for retrieving restaurant-related data.
// Includes endpoints for ZIP code lookup, top-rated restaurants, cuisine-specific filtering,
// and viewing a restaurant’s menu items under a given price.

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /restaurants/zip/:zip
 * Returns a list of restaurants located in the specified ZIP code.
 * Limited to 100 results to prevent overload.
 */
router.get('/zip/:zip', async (req, res) => {
  const zip = req.params.zip;
  try {
    const result = await pool.query(
      `SELECT * FROM Restaurant WHERE zip_code = $1 LIMIT 100`,
      [zip]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * GET /restaurants/cuisine/:type
 * Returns restaurants that offer a specific cuisine type (case-insensitive match).
 */
router.get('/cuisine/:type', async (req, res) => {
  const type = req.params.type;
  try {
    const result = await pool.query(
      `SELECT r.*
       FROM Restaurant r
       JOIN Offers o ON r.restaurant_id = o.restaurant_id
       JOIN CuisineType c ON o.cuisine_id = c.cuisine_id
       WHERE LOWER(c.cuisine_name) = LOWER($1)
       LIMIT 100`,
      [type]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * GET /restaurants/:id/menus/under/:price
 * Returns menu items under a specified price for a given restaurant.
 * Used for filtering affordable items in the modal view.
 */
router.get('/:id/menus/under/:price', async (req, res) => {
  const { id, price } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.item_name, m.item_price, m.item_description
       FROM MenuItem m
       JOIN Serves s ON m.menu_item_id = s.menu_item_id
       WHERE s.restaurant_id = $1 AND m.item_price <= $2
       ORDER BY m.item_price ASC`,
      [id, price]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
