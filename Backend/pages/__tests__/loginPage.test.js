const request = require('supertest');
const express = require('express');
const router = require('../loginPage');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');

jest.mock('../../models/user');
jest.mock('bcrypt');
jest.mock('../../utils/jwt');

const app = express();
app.use(express.json());
app.use('/login', router);

describe('POST /login', () => {
  it('should return 404 if user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const response = await request(app).post('/login').send({ userId: 'testuser', password: 'password' });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 401 if password is invalid', async () => {
    User.findOne.mockResolvedValue({ creds: { password: 'hashedPassword' } });
    bcrypt.compare.mockResolvedValue(false);
    const response = await request(app).post('/login').send({ userId: 'testuser', password: 'password' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid password');
  });

  it('should return 200 and token if login is successful', async () => {
    User.findOne.mockResolvedValue({ userId: 'testuser', creds: { password: 'hashedPassword' } });
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue('testtoken');
    const response = await request(app).post('/login').send({ userId: 'testuser', password: 'password' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBe('testtoken');
  });

  it('should return 500 if there is a server error', async () => {
    User.findOne.mockRejectedValue(new Error('Server error'));
    const response = await request(app).post('/login').send({ userId: 'testuser', password: 'password' });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');
  });
});