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

// In-browser mobile install portal and direct APK download routes
app.get('/install', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Install D&G E-Commerce</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, Roboto, sans-serif; background: #F5F5F7; margin: 0; padding: 24px; text-align: center; color: #212121; }
        .card { background: white; border-radius: 20px; padding: 32px 24px; max-width: 420px; margin: 30px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .badge { width: 72px; height: 72px; border-radius: 36px; background: #1B5E20; color: white; font-size: 26px; font-weight: 900; line-height: 72px; margin: 0 auto 16px; box-shadow: 0 4px 12px rgba(27,94,32,0.3); }
        h1 { color: #1B5E20; font-size: 22px; margin: 0 0 6px; font-weight: 800; }
        .sub { color: #616161; font-size: 14px; margin: 0 0 24px; }
        .btn { display: block; background: #E65100; color: white; padding: 16px; border-radius: 12px; font-size: 17px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(230,81,0,0.35); transition: opacity 0.2s; }
        .btn:active { opacity: 0.85; }
        .instructions { margin-top: 24px; text-align: left; background: #F1F8E9; border-radius: 12px; padding: 16px; border: 1px solid #C5E1A5; }
        .instructions h3 { margin: 0 0 8px; font-size: 13px; color: #2E7D32; text-transform: uppercase; letter-spacing: 0.5px; }
        .instructions ol { margin: 0; padding-left: 20px; font-size: 13px; color: #33691E; line-height: 1.6; }
        .info { margin-top: 18px; font-size: 11px; color: #9E9E9E; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">D&G</div>
        <h1>D&G E-Commerce</h1>
        <div class="sub">📍 Rwamagana, Rwanda • Retail Store Mobile App</div>
        <a class="btn" href="/download-apk">📥 Download APK (67.7 MB)</a>
        <div class="instructions">
          <h3>Quick Installation Steps:</h3>
          <ol>
            <li>Tap <b>Download APK</b> above.</li>
            <li>If Chrome warns <i>"File might be harmful"</i>, tap <b>Download anyway</b>.</li>
            <li>When download completes, tap <b>Open</b> and tap <b>Install</b> (or <b>Update</b>).</li>
          </ol>
        </div>
        <div class="info">D&G E-Commerce App • Built with React Native CLI</div>
      </div>
    </body>
    </html>
  `);
});

app.get('/download-apk', (req, res) => {
  const apkPath = path.resolve(__dirname, '../../DGECommerce-Release.apk');
  res.download(apkPath, 'DGECommerce-Release.apk');
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
