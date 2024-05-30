const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


const generateToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
};


const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};