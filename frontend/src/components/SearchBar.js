// SearchBar.js
// React component that provides input fields for filtering restaurants by:
// - Maximum item price
// - ZIP code
// - Cuisine type
// - Minimum rating
// Constructs a query string and sends a GET request to the backend `/meals/search` endpoint.
// The resulting data and query filters are passed to the parent component via the `onSearch` callback.

import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css'; // Layout and button styling for the search form

const SearchBar = ({ onSearch }) => {
  const [price, setPrice] = useState('');
  const [zip, setZip] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [rating, setRating] = useState('');

  // Constructs query parameters and fetches filtered restaurant data from the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const query = new URLSearchParams();
    if (price) query.append('price', price);
    if (zip) query.append('zip', zip);
    if (cuisine) query.append('cuisine', cuisine);
    if (rating) query.append('rating', rating);
    query.append('page', 1);
    query.append('limit', 10);

    try {
      const response = await axios.get(`http://localhost:5000/meals/search?${query.toString()}`);
      onSearch(response.data, price, zip, cuisine, rating);
    } catch (err) {
      console.error('Search request failed:', err.message);
      onSearch([], price, zip, cuisine, rating);
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label>
        Max Price:
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          placeholder="e.g. 15"
        />
      </label>

      <label>
        ZIP Code:
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="e.g. 97209"
        />
      </label>

      <label>
        Cuisine Type:
        <input
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="e.g. Korean"
        />
      </label>

      <label>
        Min Rating:
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="0"
          max="5"
          step="0.1"
          placeholder="e.g. 4.0"
        />
      </label>

      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
