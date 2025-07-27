// backend/routes/reservations.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create new reservation
router.post('/', async (req, res) => {
  try {
    const { user_name, reservation_time, party_size, restaurant_id } = req.body;

    if (!user_name || !reservation_time || !party_size || !restaurant_id) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await pool.query(
      `INSERT INTO reservation (user_name, reservation_time, party_size)
       VALUES ($1, $2, $3) RETURNING reservation_id`,
      [user_name, reservation_time, party_size]
    );

    const reservationId = result.rows[0].reservation_id;

    await pool.query(
      `INSERT INTO makesreservation (restaurant_id, reservation_id)
       VALUES ($1, $2)`,
      [restaurant_id, reservationId]
    );

    res.status(201).json({ reservation_id: reservationId });
  } catch (err) {
    console.error('Error inserting reservation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get reservations for a user and restaurant
router.get('/', async (req, res) => {
  const { user_name, restaurant_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT r.*
       FROM reservation r
       JOIN makesreservation mr ON r.reservation_id = mr.reservation_id
       WHERE r.user_name = $1 AND mr.restaurant_id = $2`,
      [user_name, restaurant_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Cancel reservation
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM makesreservation WHERE reservation_id = $1', [id]);
    await pool.query('DELETE FROM reservation WHERE reservation_id = $1', [id]);
    res.status(200).json({ message: 'Reservation deleted' });
  } catch (err) {
    console.error('Error deleting reservation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update reservation
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { reservation_time, party_size } = req.body;

  try {
    await pool.query(
      `UPDATE reservation
       SET reservation_time = $1, party_size = $2
       WHERE reservation_id = $3`,
      [reservation_time, party_size, id]
    );
    res.status(200).json({ message: 'Reservation updated' });
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
