// server/routes/auth.js
const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth'); 
const router = express.Router();
const { 
  signup,
  loginUser,
  validateResetToken,
  forgotPassword,
  resetPassword,
  logout,
  loginadmin,
  verifyAdminToken
} = require('../controller/authcontroller');
const validate = require('../middleware/validate');
const { signupSchema } = require('../validators/authvalidators');
const admin = require('../middleware/admin'); // Import the admin middleware

// Regular user routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/validate-reset-token/:token', validateResetToken);
router.get('/logout', logout); 

// Admin routes
router.post('/admin/login', loginadmin);
router.get('/admin/verify', admin, verifyAdminToken); // Now using the admin middleware
// ... (your existing auth routes code above)

// TEMPORARY DEBUG ROUTE - REMOVE AFTER FIXING
router.get('/debug-admin-password', async (req, res) => {
  try {
    const admin = await User.findOne({ email: "admin@example.com" });
    
    if (!admin) return res.json({ error: "Admin not found" });
    
    const isMatch = await bcrypt.compare("TempAdminPass123!", admin.password);
    
    res.json({
      exists: true,
      email: admin.email,
      role: admin.role,
      passwordMatch: isMatch,
      storedHash: admin.password.substring(0, 30) + "...",
      inputPassword: "TempAdminPass123!",
      inputLength: "TempAdminPass123!".length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/force-reset-admin', async (req, res) => {
  try {
    // 1. Get the exact password you want to use
    const plainPassword = "TempAdminPass123!";
    
    // 2. Generate new hash WITHOUT any pre-save modifications
    const newHash = await bcrypt.hash(plainPassword, 10);
    
    // 3. Update directly in database (bypassing middleware)
    await User.updateOne(
      { email: "admin@example.com" },
      { $set: { password: newHash } }
    );
    
    // 4. Verify the update
    const updatedAdmin = await User.findOne({ email: "admin@example.com" });
    const verifyMatch = await bcrypt.compare(plainPassword, updatedAdmin.password);
    
    res.json({
      success: true,
      passwordMatch: verifyMatch,
      newHash: updatedAdmin.password.substring(0, 30) + "..."
    });
    
  } catch (err) {
    res.status(500).json({
      error: "Reset failed",
      details: err.message
    });
  }
});
// In routes/auth.js - add this route
router.get('/verify', auth, async (req, res) => {
  try {
    // Return user data without password
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error during verification' });
  }
});
module.exports = router; // Keep this as the last line
 