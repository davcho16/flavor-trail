// index.js
// Main server entry point for the Express backend.
// Loads environment variables, sets up middleware (CORS, JSON parsing), and mounts route handlers.
// Starts the backend server on the configured port (default: 5000).

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const mealRoutes = require('./routes/meals');
const restaurantRoutes = require('./routes/restaurants');
const reservationRoutes = require('./routes/reservations'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to allow cross-origin requests and parse JSON bodies
app.use(cors());
app.use(express.json());

// Mounts route modules under specific route prefixes
app.use('/meals', mealRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/reservations', reservationRoutes);

// Starts the server and listens on the specified port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
