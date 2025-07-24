// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const mealRoutes = require('./routes/meals');
const restaurantRoutes = require('./routes/restaurants');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/meals', mealRoutes);

app.use('/restaurants', restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
