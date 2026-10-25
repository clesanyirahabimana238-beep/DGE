const request = require('supertest');
const app = require('../src/app');
const { pool, query } = require('../src/config/database');

describe('Authentication & Authorization Tests (Phase 3)', () => {
  jest.setTimeout(30000);
  const testClient = {
    name: 'Test Client',
    email: `client_${Date.now()}@example.com`,
    password: 'password123',
    role: 'seller' // Attempted privilege escalation - MUST be ignored and forced to 'client'
  };

  let clientToken = '';
  let clientId = null;

  afterAll(async () => {
    // Cleanup created test user
    if (clientId) {
      await query('DELETE FROM users WHERE id = $1', [clientId]);
    }
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should validate invalid registration data (missing name, invalid email, short password)', async () => {
      // Missing name
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'valid@example.com', password: 'password123' });
      expect(res1.statusCode).toBe(400);
      expect(res1.body.success).toBe(false);

      // Invalid email
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'not-an-email', password: 'password123' });
      expect(res2.statusCode).toBe(400);
      expect(res2.body.success).toBe(false);

      // Short password (< 6 chars)
      const res3 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'valid@example.com', password: '123' });
      expect(res3.statusCode).toBe(400);
      expect(res3.body.success).toBe(false);
    });

    it('should register a new client successfully and NEVER allow public registration as seller', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testClient);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.name).toBe(testClient.name);
      expect(res.body.user.email).toBe(testClient.email.toLowerCase());
      // PRIVILEGE ESCALATION CHECK: Role must be 'client', not 'seller'
      expect(res.body.user.role).toBe('client');
      // SECURITY CHECK: password_hash must NOT be returned
      expect(res.body.user).not.toHaveProperty('password_hash');
      expect(res.body.user).not.toHaveProperty('password');

      clientId = res.body.user.id;
      clientToken = res.body.token;
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testClient);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject incorrect passwords with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testClient.email,
          password: 'wrong_password_123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should log in successfully with valid credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testClient.email,
          password: testClient.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testClient.email.toLowerCase());
      expect(res.body.user.role).toBe('client');
      expect(res.body.user).not.toHaveProperty('password_hash');
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current user data when a valid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.id).toBe(clientId);
      expect(res.body.user.email).toBe(testClient.email.toLowerCase());
      expect(res.body.user).not.toHaveProperty('password_hash');
    });
  });
});
