const request = require('supertest');
const app = require('../src/app');
const { pool, query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Product Management Tests (Phase 4)', () => {
  jest.setTimeout(30000);
  let seller1 = null;
  let seller2 = null;
  let client = null;
  let seller1Token = '';
  let seller2Token = '';
  let clientToken = '';
  let createdProductId = null;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('pass123', salt);

    // Create Seller 1
    const s1Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Seller One', 'seller1_${Date.now()}@test.com', $1, 'seller')
       RETURNING id, name, email, role`,
      [hash]
    );
    seller1 = s1Res.rows[0];
    seller1Token = jwt.sign(seller1, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Seller 2 (for ownership restriction tests)
    const s2Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Seller Two', 'seller2_${Date.now()}@test.com', $1, 'seller')
       RETURNING id, name, email, role`,
      [hash]
    );
    seller2 = s2Res.rows[0];
    seller2Token = jwt.sign(seller2, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Client
    const cRes = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Client User', 'client_${Date.now()}@test.com', $1, 'client')
       RETURNING id, name, email, role`,
      [hash]
    );
    client = cRes.rows[0];
    clientToken = jwt.sign(client, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Cleanup products and test users
    if (createdProductId) {
      await query('DELETE FROM products WHERE id = $1', [createdProductId]);
    }
    const userIds = [seller1?.id, seller2?.id, client?.id].filter(Boolean);
    if (userIds.length > 0) {
      await query(`DELETE FROM users WHERE id IN (${userIds.join(',')})`);
    }
    await pool.end();
  });

  describe('Product Permissions & Creation', () => {
    it('should reject product creation without authentication (401)', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Rwamagana Coffee',
          price: 5000,
          category: 'Beverages',
          stock_quantity: 20
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should forbid clients from creating products (403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Rwamagana Coffee',
          price: 5000,
          category: 'Beverages',
          stock_quantity: 20
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Access denied/i);
    });

    it('should allow authenticated sellers to create products (201)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          name: 'Rwamagana Premium Coffee',
          description: 'High quality Arabica coffee grown in Eastern Rwanda',
          price: 4500,
          category: 'Beverages',
          image_url: 'https://example.com/coffee.jpg',
          stock_quantity: 50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toHaveProperty('id');
      expect(res.body.product.name).toBe('Rwamagana Premium Coffee');
      expect(Number(res.body.product.price)).toBe(4500);
      expect(res.body.product.seller_id).toBe(seller1.id);

      createdProductId = res.body.product.id;
    });

    it('should validate invalid price or negative stock', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          name: 'Bad Product',
          price: -100,
          category: 'General',
          stock_quantity: -5
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Product Browsing, Search, and Filtering', () => {
    it('GET /api/products should list products publicly without auth', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/products?search=Coffee should return matching products', async () => {
      const res = await request(app).get('/api/products?search=Coffee');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.some(p => p.id === createdProductId)).toBe(true);
    });

    it('GET /api/products?category=Beverages should return category products', async () => {
      const res = await request(app).get('/api/products?category=Beverages');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.some(p => p.id === createdProductId)).toBe(true);
    });

    it('GET /api/products/:id should return single product details', async () => {
      const res = await request(app).get(`/api/products/${createdProductId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.product.id).toBe(createdProductId);
      expect(res.body.product.seller_name).toBe(seller1.name);
    });
  });

  describe('Product Ownership Restrictions', () => {
    it('should forbid Seller 2 from editing Seller 1 product (403)', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${seller2Token}`)
        .send({ name: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Forbidden/i);
    });

    it('should forbid Seller 2 from deleting Seller 1 product (403)', async () => {
      const res = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${seller2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Seller 1 (the owner) to update their product (200)', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          price: 4800,
          stock_quantity: 45
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Number(res.body.product.price)).toBe(4800);
      expect(res.body.product.stock_quantity).toBe(45);
    });

    it('should allow Seller 1 (the owner) to delete their product (200)', async () => {
      const res = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${seller1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const getRes = await request(app).get(`/api/products/${createdProductId}`);
      expect(getRes.statusCode).toBe(404);
      createdProductId = null; // Mark as deleted for cleanup
    });
  });
});
