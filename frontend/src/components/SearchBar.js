// src/components/SearchBar.js
import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [price, setPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price) return;

    try {
      const response = await axios.get(`http://localhost:5000/meals/under/${price}`);
      onSearch(response.data);
    } catch (err) {
      console.error(err);
      onSearch([]);
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label>
        Max Price: $
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="1"
          step="0.01"
        />
      </label>
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
