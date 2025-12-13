const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/notifications - FIXED
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔔 Fetching notifications for user:', userId);
    
    const notifications = await Notification.find({ recipient: userId })
      .populate('listing', 'title price location images')
      .populate('sender', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Found ${notifications.length} notifications for user ${userId}`);
    
    res.json(notifications); // Return array directly
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read - FIXED
router.patch('/:id/read', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id }, // Use recipient instead of user
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (err) {
    console.error('PATCH notification error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

module.exports = router;