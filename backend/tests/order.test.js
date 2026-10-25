const request = require('supertest');
const app = require('../src/app');
const { pool, query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Order & Cart Management Tests (Phase 5)', () => {
  jest.setTimeout(30000);
  let seller = null;
  let client1 = null;
  let client2 = null;
  let sellerToken = '';
  let client1Token = '';
  let client2Token = '';
  let testProduct = null;
  let createdOrderId = null;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('pass123', salt);

    // Create Seller
    const sRes = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Order Test Seller', 'seller_order_${Date.now()}@test.com', $1, 'seller')
       RETURNING id, name, email, role`,
      [hash]
    );
    seller = sRes.rows[0];
    sellerToken = jwt.sign(seller, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Client 1
    const c1Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Order Client One', 'client1_order_${Date.now()}@test.com', $1, 'client')
       RETURNING id, name, email, role`,
      [hash]
    );
    client1 = c1Res.rows[0];
    client1Token = jwt.sign(client1, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Client 2
    const c2Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Order Client Two', 'client2_order_${Date.now()}@test.com', $1, 'client')
       RETURNING id, name, email, role`,
      [hash]
    );
    client2 = c2Res.rows[0];
    client2Token = jwt.sign(client2, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create a product with price 2500 and stock 10
    const pRes = await query(
      `INSERT INTO products (name, description, price, category, stock_quantity, seller_id)
       VALUES ('Rwamagana Tea', 'Fresh green tea', 2500, 'Beverages', 10, $1)
       RETURNING id, name, price, stock_quantity`,
      [seller.id]
    );
    testProduct = pRes.rows[0];
  });

  afterAll(async () => {
    if (createdOrderId) {
      await query('DELETE FROM order_items WHERE order_id = $1', [createdOrderId]);
      await query('DELETE FROM orders WHERE id = $1', [createdOrderId]);
    }
    if (testProduct) {
      await query('DELETE FROM products WHERE id = $1', [testProduct.id]);
    }
    const userIds = [seller?.id, client1?.id, client2?.id].filter(Boolean);
    if (userIds.length > 0) {
      await query(`DELETE FROM users WHERE id IN (${userIds.join(',')})`);
    }
    await pool.end();
  });

  describe('POST /api/orders (Checkout & Stock Validation)', () => {
    it('should reject order if delivery address is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 2 }]
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Delivery address is required/i);
    });

    it('should reject order when requested quantity exceeds available stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          delivery_address: 'Rwamagana Town Center, Sector Muhazi',
          items: [{ productId: testProduct.id, quantity: 15 }] // Available: 10
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Insufficient stock/i);
    });

    it('should place order successfully, compute authoritative DB price, and decrement stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          delivery_address: 'Rwamagana Town Center, Sector Muhazi',
          items: [{ productId: testProduct.id, quantity: 3, price: 10 }] // Spoofed price 10 should be IGNORED!
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toHaveProperty('id');
      expect(res.body.order.status).toBe('Pending');
      // Authoritative calculation: 2500 * 3 = 7500 RWF (not 3 * 10)
      expect(Number(res.body.order.total_amount)).toBe(7500);

      createdOrderId = res.body.order.id;

      // Verify stock in database was safely reduced: 10 - 3 = 7
      const pCheck = await query('SELECT stock_quantity FROM products WHERE id = $1', [testProduct.id]);
      expect(pCheck.rows[0].stock_quantity).toBe(7);
    });
  });

  describe('Order Ownership & History', () => {
    it('GET /api/orders/my-orders should return client order history', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${client1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders.some(o => o.id === createdOrderId)).toBe(true);
    });

    it('GET /api/orders/:id should forbid Client 2 from viewing Client 1 order (403)', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${client2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/orders/:id should allow Client 1 to view their order details with items', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${client1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.id).toBe(createdOrderId);
      expect(res.body.order.items.length).toBe(1);
      expect(Number(res.body.order.items[0].unit_price)).toBe(2500);
    });
  });

  describe('Seller Order Management & Sales Summary', () => {
    it('GET /api/seller/orders should list orders for the seller', async () => {
      const res = await request(app)
        .get('/api/seller/orders')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders.some(o => o.id === createdOrderId)).toBe(true);
    });

    it('PATCH /api/seller/orders/:id/status should update status: Pending -> Confirmed -> Shipped -> Delivered', async () => {
      // Pending -> Confirmed
      const res1 = await request(app)
        .patch(`/api/seller/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'Confirmed' });
      expect(res1.statusCode).toBe(200);
      expect(res1.body.order.status).toBe('Confirmed');

      // Confirmed -> Shipped
      const res2 = await request(app)
        .patch(`/api/seller/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'Shipped' });
      expect(res2.statusCode).toBe(200);
      expect(res2.body.order.status).toBe('Shipped');

      // Shipped -> Delivered
      const res3 = await request(app)
        .patch(`/api/seller/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'Delivered' });
      expect(res3.statusCode).toBe(200);
      expect(res3.body.order.status).toBe('Delivered');
    });

    it('should reject invalid status transition from Delivered (terminal state)', async () => {
      const res = await request(app)
        .patch(`/api/seller/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'Pending' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid status transition/i);
    });

    it('GET /api/seller/sales-summary should reflect delivered order in total sales', async () => {
      const res = await request(app)
        .get('/api/seller/sales-summary')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.deliveredOrdersCount).toBeGreaterThanOrEqual(1);
      expect(res.body.summary.totalSalesAmount).toBeGreaterThanOrEqual(7500);
    });
  });
});
