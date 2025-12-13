const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
require('dotenv').config({ path: '.env.test' });

// Mock email sending
jest.mock('../utils/email', () => jest.fn().mockResolvedValue(true));

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await User.create({
    name: 'Forgot Test User',
    email: 'forgottest@example.com',
    phone: '0912345678',
    password: 'ForgotPass123',
    role: 'customer'
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/forgot-password', () => {
  it('should send reset email for existing user', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'forgottest@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should fail for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'notfound@example.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});