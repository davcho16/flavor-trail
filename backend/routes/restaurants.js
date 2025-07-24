// backend/routes/restaurants.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /restaurants/zip/:zip
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

// GET /restaurants/top-rated
router.get('/top-rated', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, rr.rating_score
       FROM Restaurant r
       JOIN Has h ON r.restaurant_id = h.restaurant_id
       JOIN RestaurantReview rr ON h.review_id = rr.review_id
       ORDER BY rr.rating_score DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /restaurants/cuisine/:type
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

module.exports = router;
