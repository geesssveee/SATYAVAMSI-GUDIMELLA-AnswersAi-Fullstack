const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const { verifyToken } = require('../../utils/jwt');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token' });
  }
  User.findOne({ userId: decoded.userId })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Error finding user:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const remainingTokens = user.dailyTokenLimit - user.tokenUsage;
    res.json({ remainingTokens });
  } catch (error) {
    console.error('Error fetching remaining tokens:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;