// ViewReservationsModal.js
// React component that allows users to search and view their restaurant reservations by name.
// It sends a GET request to the backend API with the user's name and the selected restaurant ID,
// and displays a list of matching reservations (if any) in a modal view.

import React, { useState } from 'react';
import './MenuModal.css'; // Shared modal styling
import './ViewReservationsModal.css'; // Component-specific styling
import axios from 'axios';

const ViewReservationsModal = ({ isOpen, onClose, restaurant }) => {
  const [nameInput, setNameInput] = useState('');
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  // Fetches reservations for the given user name and restaurant
  const handleSearch = async () => {
    if (!nameInput.trim()) {
      setReservations([]);
      setError('Please enter your name');
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/reservations?user_name=${encodeURIComponent(nameInput)}&restaurant_id=${restaurant.id}`
      );

      if (res.data.length === 0) {
        setError('Reservation does not exist');
      } else {
        setReservations(res.data);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setReservations([]);
      setError('Error fetching reservations');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Reservations at {restaurant.name}</h2>

        <div className="whiteboard">
          <label>Enter your name to view reservations:</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your name"
          />
          <button onClick={handleSearch}>Search</button>

          {error && <p className="error-message">{error}</p>}

          {reservations.length > 0 && (
            <ul className="menu-list">
              {reservations.map((r) => (
                <li key={r.reservation_id} className="menu-item">
                  <div className="menu-header">
                    <span>ID: #{r.reservation_id}</span>
                    <span>Party: {r.party_size}</span>
                  </div>
                  <p>Time: {new Date(r.reservation_time).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewReservationsModal;
