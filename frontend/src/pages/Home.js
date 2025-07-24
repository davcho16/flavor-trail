// src/pages/Home.js
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import './Home.css';

const Home = () => {
  const [results, setResults] = useState([]);

  return (
    <div className="home-container">
      <h1>Flavor Trail</h1>
      <SearchBar onSearch={setResults} />

      <div className="results-container">
        {results.length > 0 ? (
          results.map((item, index) => (
            <div className="card" key={index}>
              <h3>{item.restaurant_name}</h3>
              <p>{item.item_name}</p>
              <p className="price">${parseFloat(item.item_price).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p className="no-results">Enter a price to find affordable meals 🍽️</p>
        )}
      </div>
    </div>
  );
};

export default Home;
