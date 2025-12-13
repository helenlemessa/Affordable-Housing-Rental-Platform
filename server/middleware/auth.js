const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = async (req, res, next) => {
  try {
    // Get token from all possible sources
    const token = req.cookies?.token || 
                 req.headers.authorization?.replace('Bearer ', '') ||
                 req.body?.token;

    console.log('Incoming token:', token); // Debug

    if (!token) {
      console.warn('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.warn('User not found for token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ 
      error: 'Authentication failed',
      details: err.message 
    });
  }
};
module.exports = auth;