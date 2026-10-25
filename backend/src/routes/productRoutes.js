const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Seller-specific: my products (must be defined before /:id)
router.get('/seller/my-products', authenticate, authorize('seller'), productController.getMyProducts);

// Public routes: browsing and searching
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes: seller product management
router.post('/', authenticate, authorize('seller'), productController.createProduct);
router.put('/:id', authenticate, authorize('seller'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('seller'), productController.deleteProduct);

module.exports = router;
