// server/middleware/admin.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from multiple sources
    const token = req.cookies.adminToken || 
                 req.headers.authorization?.replace('Bearer ', '') ||
                 req.cookies.token;
        
                 
    if (!token) {
      return res.status(401).json({ 
        error: 'Admin authentication required',
        solution: 'No authentication token found'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if user exists and is admin
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin privileges required',
        solution: 'Your account doesn\'t have admin access'
      });
    }

    // 4. Attach admin user to request
    req.admin = user;
    next();

  } catch (err) {
    console.error('Admin auth error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Session expired',
        solution: 'Please log in again'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        solution: 'Please log in again'
      });
    }
    
    res.status(500).json({ 
      error: 'Authentication failed',
      details: err.message 
    });
  }
};