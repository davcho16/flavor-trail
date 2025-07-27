import React, { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import './MenuModal.css';
import './ViewReservationsModal.css';
import axios from 'axios';

const ViewReservationsModal = ({ isOpen, onClose, restaurant }) => {
  const [nameInput, setNameInput] = useState('');
  const [reservationIdInput, setReservationIdInput] = useState('');
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [editStates, setEditStates] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const handleSearch = async () => {
    setReservations([]);
    setError('');
    setSelectedId(null);

    if (!nameInput.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!reservationIdInput.trim()) {
      setError('Reservation ID is required');
      return;
    }

    if (isNaN(reservationIdInput)) {
      setError('Reservation ID must be a number');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/reservations`, {
        params: {
          user_name: nameInput.trim(),
          restaurant_id: restaurant.id,
          reservation_id: reservationIdInput.trim()
        }
      });

      if (response.data.length === 0) {
        setError('No matching reservation found');
      } else {
        setReservations(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('Error fetching reservations');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/reservations/${id}`);
      setReservations([]);
      setSelectedId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Error cancelling reservation');
    }
  };

  const handleUpdate = async (id) => {
    const changes = editStates[id];
    if (!changes?.newTime || !changes?.newPartySize) {
      setError('Time and party size are required for update');
      return;
    }

    const time = new Date(changes.newTime);
    const mins = time.getMinutes();
    if (mins !== 0 && mins !== 30) {
      setError('Time must be on the hour or half hour (e.g., 6:00, 6:30)');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/reservations/${id}`, {
        reservation_time: changes.newTime,
        party_size: parseInt(changes.newPartySize)
      });
      handleSearch();
    } catch (err) {
      console.error('Failed to update:', err);
      setError('Error updating reservation');
    }
  };

  const updateEditState = (id, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Reservations at {restaurant.name}</h2>

        <div className="whiteboard">
          <label>Enter your name:</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
          />

          <label>Enter Reservation ID:</label>
          <input
            type="text"
            value={reservationIdInput}
            onChange={(e) => setReservationIdInput(e.target.value)}
            placeholder="e.g. 123"
          />

          <button onClick={handleSearch}>Search</button>

          {error && <p className="error-message">{error}</p>}

          {reservations.length > 0 && (
            <ul className="menu-list">
              {reservations.map((r) => (
                <li
                  key={r.reservation_id}
                  className="menu-item"
                  onClick={() => {
                    const alreadyOpen = selectedId === r.reservation_id;
                    setSelectedId(alreadyOpen ? null : r.reservation_id);

                    if (!alreadyOpen && !editStates[r.reservation_id]) {
                      setEditStates((prev) => ({
                        ...prev,
                        [r.reservation_id]: {
                          newTime: new Date(r.reservation_time),
                          newPartySize: r.party_size
                        }
                      }));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="menu-header">
                    <span>ID: #{r.reservation_id}</span>
                    <span>Party: {r.party_size}</span>
                  </div>
                  <p>Time: {new Date(r.reservation_time).toLocaleString()}</p>

                  {selectedId === r.reservation_id && (
                    <div
                      className="edit-section"
                      onClick={(e) => e.stopPropagation()} // prevents click collapse
                    >
                      <label>New Time:</label>
                      <Flatpickr
                        value={editStates[r.reservation_id]?.newTime || ''}
                        options={{
                          enableTime: true,
                          dateFormat: 'Y-m-d H:i',
                          minuteIncrement: 30,
                          minDate: 'today'
                        }}
                        onOpen={(selectedDates, dateStr, instance) => {
                          // prevent toggle collapse
                          setTimeout(() => {
                            const input = instance._input;
                            if (input) {
                              input.addEventListener(
                                'click',
                                (e) => e.stopPropagation(),
                                { once: true }
                              );
                            }
                          });
                        }}
                        onChange={([date]) =>
                          updateEditState(r.reservation_id, 'newTime', date)
                        }
                      />

                      <label>New Party Size:</label>
                      <input
                        type="number"
                        min="1"
                        value={editStates[r.reservation_id]?.newPartySize || ''}
                        onChange={(e) =>
                          updateEditState(r.reservation_id, 'newPartySize', e.target.value)
                        }
                      />
                      <button onClick={() => handleUpdate(r.reservation_id)}>Update</button>
                      <button onClick={() => handleCancel(r.reservation_id)}>Cancel Reservation</button>
                    </div>
                  )}
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
