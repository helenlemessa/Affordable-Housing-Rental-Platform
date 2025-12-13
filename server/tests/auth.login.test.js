const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
require('dotenv').config({ path: '.env.test' });

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Create test user directly
  await User.create({
    name: 'Login Test User',
    email: 'logintest@example.com',
    phone: '0912345678',
    password: 'LoginPass123',
    role: 'customer'
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/auth/login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'LoginPass123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});