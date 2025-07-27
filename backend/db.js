// db.js
// Initializes and exports a PostgreSQL connection pool using the `pg` library.
// Reads database credentials from environment variables defined in a .env file.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
