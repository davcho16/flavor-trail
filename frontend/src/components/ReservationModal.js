// ReservationModal.js
// React component that allows users to create and cancel reservations for a selected restaurant.
// Uses a modal interface with form inputs for name, date/time, and party size.
// Sends a POST request to create a reservation and a DELETE request to cancel it.
// Also displays a success or error message based on server response.

import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import './MenuModal.css'; // Shared modal styling
import axios from 'axios';

const ReservationModal = ({ isOpen, onClose, restaurant }) => {
  const [userName, setUserName] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [latestReservation, setLatestReservation] = useState(null);

  // Sends reservation data to the backend to create a new reservation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reservationTime) {
      setSuccessMessage('Please select a time.');
      return;
    }

    const time = new Date(reservationTime);
    const mins = time.getMinutes();
    if (mins !== 0 && mins !== 30) {
      setSuccessMessage('Please select a time ending in :00 or :30 only.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/reservations', {
        user_name: userName,
        reservation_time: reservationTime,
        party_size: partySize,
        restaurant_id: restaurant.id,
      });

      setSuccessMessage('Reservation confirmed');
      setLatestReservation(response.data);
      setUserName('');
      setReservationTime('');
      setPartySize(1);
    } catch (error) {
      console.error('Reservation failed', error);
      if (error.response?.data?.message) {
        setSuccessMessage(error.response.data.message);
      } else {
        setSuccessMessage('No available seating, please pick another timeslot');
      }
    }
  };

  // Cancels the most recent reservation if one was created during this session
  const handleCancel = async () => {
    if (!latestReservation) return;
    try {
      await axios.delete(`http://localhost:5000/reservations/${latestReservation.reservation_id}`);
      setSuccessMessage('Reservation cancelled');
      setLatestReservation(null);
    } catch (error) {
      console.error('Cancellation failed:', error);
      setSuccessMessage('Failed to cancel reservation');
    }
  };

  // Resets modal state when the modal is closed
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
            <Flatpickr
              value={reservationTime}
              options={{
                enableTime: true,
                dateFormat: 'Y-m-d H:i',
                minuteIncrement: 30,
                minDate: 'today'
              }}
              onChange={([date]) => setReservationTime(date)}
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
