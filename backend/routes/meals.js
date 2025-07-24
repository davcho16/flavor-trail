// backend/routes/meals.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /meals/under/:price
router.get('/under/:price', async (req, res) => {
  const maxPrice = parseFloat(req.params.price);

  try {
    const result = await pool.query(
      `
      SELECT r.restaurant_name, m.item_name, m.item_price
      FROM Restaurant r
      JOIN Serves s ON r.restaurant_id = s.restaurant_id
      JOIN MenuItem m ON s.menu_item_id = m.menu_item_id
      WHERE m.item_price <= $1
      ORDER BY r.restaurant_name, m.item_price
      LIMIT 100;
      `,
      [maxPrice]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
