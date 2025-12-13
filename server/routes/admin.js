const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Add this import
const Listing = require('../models/Listing');
const User = require('../models/user'); // Add this import
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get pending listings
// Admin verification endpoint
router.get('/verify', admin, (req, res) => {
  res.json({ 
    valid: true,
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role
    }
  });
});

// Protected admin routes
router.get('/pending-listings', admin, async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending' })
      .populate('landowner', 'name email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin stats
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const stats = {
      pending: await Listing.countDocuments({ status: 'pending' }),
      approved: await Listing.countDocuments({ status: 'approved' }),
      rejected: await Listing.countDocuments({ status: 'rejected' }),
      totalUsers: await User.countDocuments(),
      newUsers: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a listing
router.put('/approve-listing/:id', auth, admin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        adminComments: req.body.comments || ''
      },
      { new: true }
    );
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject a listing
router.put('/reject-listing/:id', auth, admin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        adminComments: req.body.comments || 'Listing rejected'
      },
      { new: true }
    );
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 // Get all users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get new users (last 7 days)
router.get('/users/new', auth, admin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get approved listings
router.get('/approved', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'approved' })
      .populate('landowner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;