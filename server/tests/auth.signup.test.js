const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
require('dotenv').config({ path: '.env.test' });

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/signup', () => {
  it('should register a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '0936197514',
        password: 'TestPass123',
        role: 'customer'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/success/i);
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'missingfields@example.com',
        password: 'TestPass123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    // Update this to match your actual validation message
    expect(res.body.message).toMatch(/validation failed|required/i);
  });
});