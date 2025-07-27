// App.js
// Main entry point for the React application.
// Uses React Router to define and manage page-level routing.
// Currently only renders the Home component on the root path ("/").
// Designed to be easily extended with additional pages such as About, Contact, etc.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
