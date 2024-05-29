const express = require('express');
const router = express.Router();
const User = require('../models/user');


router.post('/', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ 'creds.email': email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      userId,
      Name: {
        firstName,
        lastName,
      },
      creds: {
        email,
        password,
      },
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;