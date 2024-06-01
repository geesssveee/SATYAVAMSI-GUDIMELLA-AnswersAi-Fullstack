const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt');

// Middleware function to authenticate the token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token' });
  }
  req.user = decoded; 
  next();
};

// Route to fetch the user ID
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId; 
    res.json({ userId });
  } catch (error) {
    console.error('Error fetching user ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;