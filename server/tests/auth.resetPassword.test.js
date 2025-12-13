const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const { generateResetToken } = require('../utils/passwordReset');
require('dotenv').config({ path: '.env.test' });

jest.setTimeout(30000);

let testUser;
let resetToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  testUser = await User.create({
    name: 'Reset Test User',
    email: 'resettest@example.com',
    phone: '0912345678',
    password: 'ResetPass123',
    role: 'customer'
  });

  // Generate reset token
  const { resetToken: rawToken, hashedToken } = generateResetToken();
  testUser.resetPasswordToken = hashedToken;
  testUser.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  await testUser.save();
  resetToken = rawToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('PUT /api/auth/reset-password/:token', () => {
  it('should reset password with valid token', async () => {
    const res = await request(app)
      .put(`/api/auth/reset-password/${resetToken}`)
      .send({ password: 'NewPass123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should fail with invalid token', async () => {
    const res = await request(app)
      .put('/api/auth/reset-password/invalidtoken')
      .send({ password: 'NewPass123!' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});