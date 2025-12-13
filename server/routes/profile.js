const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validateObjectId = require('../middleware/validateObjectId');

const auth = require('../middleware/auth');
const {
  getUserProfile,
  updateProfile,
  getPublicProfile
} = require('../controller/profileController');

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, getUserProfile);

// @route   PUT /api/profile
// @desc    Update profile
// @access  Private
router.put(
  '/',
  auth,
  [
    check('bio', 'Bio cannot exceed 500 characters').optional().isLength({ max: 500 }),
    check('contact.phone', 'Enter a valid phone number').optional().isMobilePhone()
  ],
  updateProfile
);

// @route   GET /api/profile/:id
// @desc    Get public profile
// @access  Public
 
router.get('/:id', validateObjectId, getPublicProfile);
module.exports = router;