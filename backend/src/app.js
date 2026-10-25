const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const errorHandler = require('./middleware/errorHandler');
const { checkDatabaseConnection } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'D&G E-Commerce API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Database Readiness Check Endpoint (verifies connection without exposing secrets)
app.get('/health/db', async (req, res, next) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.connected) {
      res.status(200).json({
        status: 'OK',
        database: 'connected',
        serverTime: dbStatus.serverTime
      });
    } else {
      res.status(503).json({
        status: 'UNAVAILABLE',
        database: 'disconnected',
        error: dbStatus.message
      });
    }
  } catch (err) {
    next(err);
  }
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
