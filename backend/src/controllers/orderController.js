const { pool, query } = require('../config/database');

/**
 * POST /api/orders
 * Transactional checkout endpoint.
 * Validates stock, calculates authoritative prices from DB, decreases stock, and creates order & items.
 */
async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { items, delivery_address } = req.body;
    const clientId = req.user.id;

    // Validate delivery address
    if (!delivery_address || typeof delivery_address !== 'string' || delivery_address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Delivery address is required' }
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Order must contain at least one product item' }
      });
    }

    // Start Transaction
    await client.query('BEGIN');

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = Number(item.productId || item.id);
      const quantity = Number(item.quantity);

      if (!productId || isNaN(productId)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid product ID specified' }
        });
      }

      if (!quantity || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: { message: `Invalid quantity for product ${productId}. Must be a positive integer.` }
        });
      }

      // Lock product row FOR UPDATE to prevent race conditions during checkout
      const productRes = await client.query(
        'SELECT id, name, price, stock_quantity, seller_id FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );

      if (productRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: { message: `Product with ID ${productId} does not exist` }
        });
      }

      const product = productRes.rows[0];

      // Check stock availability
      if (product.stock_quantity < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, requested: ${quantity}`
          }
        });
      }

      // Authoritative unit price from database (NEVER TRUST CLIENT-SENT PRICES)
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * quantity;

      validatedItems.push({
        productId,
        quantity,
        unitPrice,
        name: product.name,
      });

      // Deduct stock safely
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, productId]
      );
    }

    // Insert Order
    const orderRes = await client.query(
      `INSERT INTO orders (client_id, total_amount, status, delivery_address)
       VALUES ($1, $2, 'Pending', $3)
       RETURNING id, client_id, total_amount, status, delivery_address, created_at, updated_at`,
      [clientId, totalAmount, delivery_address.trim()]
    );

    const order = orderRes.rows[0];

    // Insert Order Items
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, vItem.productId, vItem.quantity, vItem.unitPrice]
      );
    }

    // Commit Transaction
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Note: Payment upon delivery.',
      order: {
        ...order,
        items: validatedItems
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders/my-orders
 * Return all orders for the authenticated client.
 */
async function getMyOrders(req, res, next) {
  try {
    const clientId = req.user.id;

    const result = await query(
      `SELECT o.id, o.client_id, o.total_amount, o.status, o.delivery_address, o.created_at, o.updated_at,
              COUNT(oi.id) AS item_count,
              SUM(oi.quantity) AS total_units
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.client_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [clientId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      orders: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 * Return details and items of a specific order.
 * Verifies ownership: clients can only view their own orders.
 */
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const orderRes = await query(
      `SELECT o.id, o.client_id, o.total_amount, o.status, o.delivery_address, o.created_at, o.updated_at,
              u.name AS client_name, u.email AS client_email
       FROM orders o
       JOIN users u ON o.client_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' }
      });
    }

    const order = orderRes.rows[0];

    // Clients can only access their own orders
    if (userRole === 'client' && order.client_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: You can only view your own orders' }
      });
    }

    // Fetch items with product details
    const itemsRes = await query(
      `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
              p.name AS product_name, p.image_url, p.category, p.seller_id,
              s.name AS seller_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN users s ON p.seller_id = s.id
       WHERE oi.order_id = $1`,
      [id]
    );

    // If seller is requesting, verify they own at least one item in the order
    if (userRole === 'seller') {
      const sellerOwnsAnItem = itemsRes.rows.some(item => item.seller_id === userId);
      if (!sellerOwnsAnItem) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not have products in this order' }
        });
      }
    }

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items: itemsRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
