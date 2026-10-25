const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

// Configure Pool with SSL support for Neon cloud database
const poolConfig = {
  connectionString,
};

if (process.env.NODE_ENV === 'production' || (connectionString && connectionString.includes('neon.tech'))) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

/**
 * Execute a parameterized SQL query.
 * @param {string} text - The SQL query text with parameter placeholders ($1, $2, etc.)
 * @param {Array} params - Array of parameter values
 */
const query = (text, params) => pool.query(text, params);

/**
 * Safely verify database connectivity without logging credentials.
 * @returns {Promise<boolean>}
 */
async function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    return { connected: false, message: 'DATABASE_URL environment variable is not configured' };
  }
  try {
    const res = await pool.query('SELECT NOW() AS current_time');
    return { connected: true, serverTime: res.rows[0].current_time };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}

module.exports = {
  pool,
  query,
  checkDatabaseConnection,
};
