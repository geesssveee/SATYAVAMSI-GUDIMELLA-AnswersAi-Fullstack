const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const enforceTokenLimit = async (user) => {
  try {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    if (user.lastResetDate.getTime() !== currentDate) {
      user.tokenUsage = 0;
      user.lastResetDate = currentDate;
      await user.save();
    }
  } catch (error) {
    console.error('Error enforcing token limit:', error.message);
    throw error;
  }
};

router.post('/', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.creds.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    await enforceTokenLimit(user);

    const payload = { userId: user.userId };
    const token = generateToken(payload);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
module.exports = router;