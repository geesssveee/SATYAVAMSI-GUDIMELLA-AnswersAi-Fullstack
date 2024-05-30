const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  creds:{
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
  chatHistory: [
    {
      prompt: {
        type: String,
        required: true,
      },
      response: {
        type: String,
        required: true,
      },
      tokens: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  tokenUsage: {
    type: Number,
    default: 0,
  },
  dailyTokenLimit: {
    type: Number,
    default: 2000,
  },
  lastResetDate: {
    type: Date,
    default: new Date().setHours(0, 0, 0, 0), // set to the beginning of the current day
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema, 'user_data');

module.exports = User;