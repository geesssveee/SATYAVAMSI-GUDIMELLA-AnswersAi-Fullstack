const request = require('supertest');
const express = require('express');
const router = require('../signUpPage');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

jest.mock('../../models/user');
jest.mock('bcrypt');

const app = express();
app.use(express.json());
app.use('/signup', router);

describe('POST /signup', () => {
  it('should return 400 if user already exists', async () => {
    User.findOne.mockResolvedValue({ email: 'existinguser@example.com' });
    const response = await request(app).post('/signup').send({
      userId: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'existinguser@example.com',
      password: 'password',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  it('should return 201 if user is registered successfully', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    const newUser = {
      save: jest.fn().mockResolvedValue({}),
    };
    User.mockImplementation(() => newUser);

    const response = await request(app).post('/signup').send({
      userId: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password',
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(newUser.save).toHaveBeenCalled();
  });

  it('should return 500 if there is a server error', async () => {
    User.findOne.mockRejectedValue(new Error('Server error'));
    const response = await request(app).post('/signup').send({
      userId: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password',
    });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');
  });
});