const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  Name: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  creds: {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  chat: {
    prompt: {
      type: String,
    },
    tokens: {
      type: Number,
    },
  },
});

const User = mongoose.model('User', userSchema, 'user_data');

module.exports = User;