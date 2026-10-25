const request = require('supertest');
const app = require('../src/app');
const { pool, checkDatabaseConnection } = require('../src/config/database');

describe('Database Connectivity and Readiness Check', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('checkDatabaseConnection should successfully query Neon PostgreSQL', async () => {
    const result = await checkDatabaseConnection();
    expect(result).toHaveProperty('connected', true);
    expect(result).toHaveProperty('serverTime');
    expect(result.serverTime).toBeDefined();
  });

  it('GET /health/db should return 200 with database: connected', async () => {
    const res = await request(app).get('/health/db');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('serverTime');
  });
});
