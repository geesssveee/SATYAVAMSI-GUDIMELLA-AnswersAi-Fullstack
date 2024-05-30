const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  try {
    console.log("I am here!");
    const { userId, firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ 'creds.email': email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(userId,email,hashedPassword);
    const newUser = new User({
      userId,
      name: {
        firstName,
        lastName,
      },
      creds: {
        email,
        password: hashedPassword,
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