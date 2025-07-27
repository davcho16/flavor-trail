// components/ReservationModal.js
import React, { useState, useEffect } from 'react';
import './MenuModal.css'; // Reuse modal styling
import axios from 'axios';

const ReservationModal = ({ isOpen, onClose, restaurant }) => {
  const [userName, setUserName] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [latestReservation, setLatestReservation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/reservations', {
        user_name: userName,
        reservation_time: reservationTime,
        party_size: partySize,
        restaurant_id: restaurant.id,
      });

      setSuccessMessage('Reservation confirmed!');
      setLatestReservation(response.data);
      setUserName('');
      setReservationTime('');
      setPartySize(1);
    } catch (error) {
      console.error('Reservation failed:', error);
      setSuccessMessage('Reservation failed');
    }
  };

  const handleCancel = async () => {
    if (!latestReservation) return;
    try {
      await axios.delete(`http://localhost:5000/reservations/${latestReservation.reservation_id}`);
      setSuccessMessage('Reservation cancelled!');
      setLatestReservation(null);
    } catch (error) {
      console.error('Cancellation failed:', error);
      setSuccessMessage('Failed to cancel reservation');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage('');
      setLatestReservation(null);
      setUserName('');
      setReservationTime('');
      setPartySize(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Reserve at {restaurant.name}</h2>
        <div className="whiteboard">
          <form onSubmit={handleSubmit}>
            <label>Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <label>Time:</label>
            <input
              type="datetime-local"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              required
            />

            <label>Party Size:</label>
            <input
              type="number"
              value={partySize}
              min="1"
              onChange={(e) => setPartySize(e.target.value)}
              required
            />

            <button type="submit">Confirm</button>
            <button type="button" onClick={onClose}>Close</button>
          </form>

          {successMessage && <p>{successMessage}</p>}

          {latestReservation && (
            <div style={{ marginTop: '1rem' }}>
              <p>Your reservation ID is <strong>{latestReservation.reservation_id}</strong>.</p>
              <button onClick={handleCancel}>Cancel This Reservation</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
