const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ 
      error: 'Invalid ID format',
      expectedFormat: '24-character hex string (e.g., 507f1f77bcf86cd799439011)'
    });
  }
  next();
};

module.exports = validateObjectId;