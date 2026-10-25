const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Client order history
router.get('/my-orders', authenticate, authorize('client'), orderController.getMyOrders);

// Single order details (client or seller)
router.get('/:id', authenticate, orderController.getOrderById);

// Place an order (client only)
router.post('/', authenticate, authorize('client'), orderController.createOrder);

module.exports = router;
