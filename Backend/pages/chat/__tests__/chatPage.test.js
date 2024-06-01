const request = require('supertest');
const express = require('express');
const router = require('../chatPage');
const User = require('../../../models/user');
const { verifyToken } = require('../../../utils/jwt');
const axios = require('axios');

jest.mock('../../../models/user');
jest.mock('../../../utils/jwt');
jest.mock('axios');

const app = express();
app.use(express.json());
app.use('/chat', router);

describe('POST /chat', () => {
  beforeEach(() => {
    verifyToken.mockReset();
    User.findOne.mockReset();
    User.findById.mockReset();
    axios.post.mockReset();
  });

  it('should return 401 if token is missing', async () => {
    const response = await request(app).post('/chat').send({ message: 'Hello' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization token missing');
  });

  it('should return 403 if token is invalid', async () => {
    verifyToken.mockReturnValue(null);
    const response = await request(app).post('/chat').set('Authorization', 'Bearer invalidtoken').send({ message: 'Hello' });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid token');
  });

  it('should return 404 if user not found', async () => {
    verifyToken.mockReturnValue({ userId: 'testuser' });
    User.findOne.mockResolvedValue(null);
    const response = await request(app).post('/chat').set('Authorization', 'Bearer validtoken').send({ message: 'Hello' });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 200 and reply if chat is successful', async () => {
    verifyToken.mockReturnValue({ userId: 'testuser' });
    const currentDate = new Date().setHours(0, 0, 0, 0);
    User.findOne.mockResolvedValue({
      _id: 'userid',
      tokenUsage: 0,
      dailyTokenLimit: 10,
      lastResetDate: new Date(currentDate),
      save: jest.fn()
    });
    User.findById.mockResolvedValue({
      _id: 'userid',
      tokenUsage: 0,
      dailyTokenLimit: 10,
      lastResetDate: new Date(currentDate),
      save: jest.fn()
    });
    axios.post.mockResolvedValue({ data: [{ generated_text: 'Hi there!' }] });

    const response = await request(app).post('/chat').set('Authorization', 'Bearer validtoken').send({ prompt: 'Hello' });

    expect(response.status).toBe(200);
    expect(response.body.response).toBe('Hi there!');
  });

  it('should return 500 if there is a server error', async () => {
    verifyToken.mockReturnValue({ userId: 'testuser' });
    const currentDate = new Date().setHours(0, 0, 0, 0);
    User.findOne.mockResolvedValue({
      _id: 'userid',
      tokenUsage: 0,
      dailyTokenLimit: 10,
      lastResetDate: new Date(currentDate),
      save: jest.fn()
    });
    User.findById.mockResolvedValue({
      _id: 'userid',
      tokenUsage: 0,
      dailyTokenLimit: 10,
      lastResetDate: new Date(currentDate),
      save: jest.fn()
    });
    axios.post.mockRejectedValue(new Error('Server error'));

    const response = await request(app).post('/chat').set('Authorization', 'Bearer validtoken').send({ prompt: 'Hello' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Error communicating with Hugging Face API');
  });
});