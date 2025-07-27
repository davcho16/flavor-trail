// reservations.js
// Express route handler for managing restaurant reservations.
// Supports creating, reading, updating, and deleting reservations.
// Relies on two tables:
// - `reservation`: holds user info, party size, and time
// - `makesreservation`: join table linking reservations to restaurants

const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper: format datetime string to local (no timezone shift)
function toPostgresLocal(datetimeStr) {
  const date = new Date(datetimeStr);
  const pad = (n) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// Create a new reservation and link it to a restaurant
router.post('/', async (req, res) => {
  try {
    const { user_name, reservation_time, party_size, restaurant_id } = req.body;

    if (!user_name || !reservation_time || !party_size || !restaurant_id) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const time = new Date(reservation_time);
    const mins = time.getMinutes();
    if (mins !== 0 && mins !== 30) {
      return res.status(400).json({ error: 'Time must be on the hour or half hour (e.g., 6:00, 6:30)' });
    }

    const localTimeString = toPostgresLocal(reservation_time);

    const countResult = await pool.query(
      `
      SELECT COUNT(*) FROM reservation r
      JOIN makesreservation mr ON r.reservation_id = mr.reservation_id
      WHERE mr.restaurant_id = $1 AND r.reservation_time = $2
      `,
      [restaurant_id, localTimeString]
    );

    const count = parseInt(countResult.rows[0].count);
    if (count >= 5) {
      return res.status(400).json({ error: 'This time slot is fully booked.' });
    }

    const result = await pool.query(
      `INSERT INTO reservation (user_name, reservation_time, party_size)
       VALUES ($1, $2, $3) RETURNING reservation_id`,
      [user_name, localTimeString, party_size]
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

// Retrieve reservations by user_name and restaurant_id, with optional reservation_id
router.get('/', async (req, res) => {
  const { user_name, restaurant_id, reservation_id } = req.query;

  try {
    let query = `
      SELECT r.*
      FROM reservation r
      JOIN makesreservation mr ON r.reservation_id = mr.reservation_id
      WHERE r.user_name = $1 AND mr.restaurant_id = $2
    `;
    const values = [user_name, restaurant_id];

    if (reservation_id) {
      query += ` AND r.reservation_id = $3`;
      values.push(reservation_id);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a reservation by its ID (used for cancellation)
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

// Update reservation time or party size
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { reservation_time, party_size } = req.body;

  if (!reservation_time || !party_size) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const restaurantResult = await pool.query(
      `SELECT restaurant_id FROM makesreservation WHERE reservation_id = $1`,
      [id]
    );

    if (restaurantResult.rowCount === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const restaurant_id = restaurantResult.rows[0].restaurant_id;

    const currentTimeResult = await pool.query(
      `SELECT reservation_time FROM reservation WHERE reservation_id = $1`,
      [id]
    );
    const currentTime = currentTimeResult.rows[0].reservation_time;

    const time = new Date(reservation_time);
    const mins = time.getMinutes();
    if (mins !== 0 && mins !== 30) {
      return res.status(400).json({ error: 'Time must be on the hour or half hour (e.g., 6:00, 6:30)' });
    }

    const localTimeString = toPostgresLocal(reservation_time);

    if (localTimeString !== currentTime.toISOString().slice(0, 19).replace('T', ' ')) {
      const countResult = await pool.query(
        `
        SELECT COUNT(*) FROM reservation r
        JOIN makesreservation mr ON r.reservation_id = mr.reservation_id
        WHERE mr.restaurant_id = $1 AND r.reservation_time = $2
        `,
        [restaurant_id, localTimeString]
      );

      const count = parseInt(countResult.rows[0].count);
      if (count >= 5) {
        return res.status(400).json({ error: 'This time slot is fully booked.' });
      }
    }

    await pool.query(
      `UPDATE reservation
       SET reservation_time = $1, party_size = $2
       WHERE reservation_id = $3`,
      [localTimeString, party_size, id]
    );

    res.status(200).json({ message: 'Reservation updated' });
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;