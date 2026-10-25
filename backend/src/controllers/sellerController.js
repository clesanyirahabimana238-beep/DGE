const { query } = require('../config/database');

const VALID_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [], // Terminal state
  Cancelled: [], // Terminal state
};

/**
 * GET /api/seller/orders
 * Retrieve orders that contain products owned by the authenticated seller.
 */
async function getSellerOrders(req, res, next) {
  try {
    const sellerId = req.user.id;

    const result = await query(
      `SELECT DISTINCT o.id, o.client_id, o.total_amount, o.status, o.delivery_address,
              o.created_at, o.updated_at,
              u.name AS client_name, u.email AS client_email,
              COUNT(oi.id) AS item_count
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON o.client_id = u.id
       WHERE p.seller_id = $1
       GROUP BY o.id, u.name, u.email
       ORDER BY o.created_at DESC`,
      [sellerId]
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
 * PATCH /api/seller/orders/:id/status
 * Update order status with transition validation and ownership verification.
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        }
      });
    }

    // Check if order exists and if seller owns any products in this order
    const orderCheck = await query(
      `SELECT o.id, o.status, COUNT(oi.id) AS seller_item_count
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND p.seller_id = $2
       GROUP BY o.id, o.status`,
      [id, sellerId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found or you have no products in this order' }
      });
    }

    const currentStatus = orderCheck.rows[0].status;

    // Validate transition
    if (currentStatus === status) {
      return res.status(200).json({
        success: true,
        message: `Order status is already ${status}`,
        order: { id: Number(id), status }
      });
    }

    const allowedNext = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status transition from "${currentStatus}" to "${status}". Allowed transitions: ${allowedNext.join(', ') || 'None (order is in final state)'}`
        }
      });
    }

    const updateRes = await query(
      `UPDATE orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, client_id, total_amount, status, delivery_address, created_at, updated_at`,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updateRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seller/sales-summary
 * Returns number of delivered orders and total sales from delivered orders.
 * Each qualifying order is counted once.
 */
async function getSalesSummary(req, res, next) {
  try {
    const sellerId = req.user.id;

    // Calculate total sales from delivered orders for this seller's products
    const summaryRes = await query(
      `SELECT
         COUNT(DISTINCT o.id) AS delivered_orders_count,
         COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_sales_amount
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = $1 AND o.status = 'Delivered'`,
      [sellerId]
    );

    const data = summaryRes.rows[0];

    return res.status(200).json({
      success: true,
      summary: {
        deliveredOrdersCount: Number(data.delivered_orders_count),
        totalSalesAmount: Number(data.total_sales_amount),
        currency: 'RWF'
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSellerOrders,
  updateOrderStatus,
  getSalesSummary,
};
