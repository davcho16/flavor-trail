import React, { useState } from 'react';
import axios from 'axios';
import './MenuModal.css';

const ViewReservationsModal = ({ isOpen, onClose, restaurant }) => {
  const [nameInput, setNameInput] = useState('');
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(''); // Error message

  const handleSearch = async () => {
    if (!nameInput.trim()) {
      setReservations([]);
      setError('Please enter your name');
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/restaurants/${restaurant.id}/reservations?user_name=${encodeURIComponent(nameInput)}`
      );
      if (res.data.length === 0) {
        setError('🔍 Reservation does not exist');
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

          {error && <p style={{ color: '#c0392b', marginTop: '1rem' }}>{error}</p>}

          {reservations.length > 0 && (
            <ul className="menu-list mt-1">
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
