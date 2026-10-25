const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

describe('Health Check Endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  it('GET /health should return 200 OK with service details', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('service', 'D&G E-Commerce API');
    expect(res.body).toHaveProperty('timestamp');
  });
});
