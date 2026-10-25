const express = require('express');
const router = express.Router();

const sellerController = require('../controllers/sellerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All seller routes require authentication and seller role
router.use(authenticate, authorize('seller'));

// View customer orders containing seller's products
router.get('/orders', sellerController.getSellerOrders);

// Update order status with transition validation
router.patch('/orders/:id/status', sellerController.updateOrderStatus);

// View sales summary
router.get('/sales-summary', sellerController.getSalesSummary);

module.exports = router;
