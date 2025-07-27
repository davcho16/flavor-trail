// src/components/SearchBar.js
import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [price, setPrice] = useState('');
  const [zip, setZip] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [rating, setRating] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(null, price, zip, cuisine, rating);
  };

  return (
    <div className="searchbar-container">
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Max Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="ZIP Code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
        <input
          type="text"
          placeholder="Cuisine Type"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Min Rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default SearchBar;
