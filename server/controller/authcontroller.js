const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto'); // Add at the top
const { generateResetToken } = require('../utils/passwordReset');
const sendEmail = require('../utils/email'); // You'll need to implement this
const Profile = require('../models/Profile');
 
const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    console.log("Raw Request Body:", req.body); // Log incoming data

    // Basic validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password,
      role
    });

    console.log("User object before save:", user); // Log user object
    
    await user.save();
    await Profile.createForUser(user._id);
    console.log("User saved successfully"); // Confirm save completion

    res.status(201).json({ message: "User registered successfully." });

  } catch (err) {
    console.error("❌ FULL ERROR DETAILS:");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Error Code:", err.code);
    console.error("Error Stack:\n", err.stack);
    
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // More specific error handling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation failed",
        errors: err.errors 
      });
    }

    return res.status(500).json({ 
      message: "Server error.",
      internalError: err.message // Send the actual error to client for debugging
    });
  }
};
const loginUser = async (req, res) => {
  // Validate input
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ 
      error: 'Email and password required',
      details: {
        received: Object.keys(req.body),
        required: ['email', 'password']
      }
    });
  }

  try {
    // Verify database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const user = await User.findOne({ email: req.body.email.trim() })
      .select('+password')
      .maxTimeMS(5000); // 5s timeout

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        hint: 'User not found' 
      });
    }

    // Compare passwords with error handling
    const isMatch = await bcrypt.compare(
      req.body.password.trim(), 
      user.password
    ).catch(err => {
      console.error('Bcrypt error:', err);
      return false;
    });

    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        hint: 'Invalid password' 
      });
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET missing');
    }

    const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

// Send token in HTTP-only cookie
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Use HTTPS in production
  sameSite: "Strict", // Helps prevent CSRF
  maxAge: 24 * 60 * 60 * 1000 // 1 day
});

// Only send user info (not token)
return res.json({
   token: token ,// Include token in response for client-side handling
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    
  }
});


  } catch (err) {
    console.error('Auth error:', err.stack);
    return res.status(500).json({ 
      error: 'Authentication process failed',
      systemMessage: err.message 
    });
  }
};
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production"
  });
  return res.json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  let user; // Declare user at the top
  
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { resetToken, hashedToken, expireTime } = generateResetToken();
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expireTime;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `Password reset link: ${resetUrl}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message
    });

    return res.status(200).json({ 
      success: true,
      message: 'Email sent',
      token: resetToken // Include token in response for client-side handling
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    
    // Only try to clear fields if user was found
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save().catch(e => console.error('Cleanup failed:', e));
    }
    
    return res.status(500).json({ 
      error: 'Email could not be sent',
      details: err.message
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    // 1. Validate token exists
    if (!req.params.token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    // 2. Hash the token and find user
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired token',
        solution: 'Request a new password reset'
      });
    }

    // 3. Validate new password
    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    // Enforce password policy: at least 8 chars, 1 uppercase, 1 number
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters, contain an uppercase letter and a number'
      });
    }

    // 4. Update user
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // 5. Return success with token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully'
    });

  } catch (err) {
    console.error('Reset password error:', err.stack);
    return res.status(500).json({
      error: 'Password reset failed',
      systemError: err.message,
      tip: 'Check server logs for details'
    });
  }
};
const validateResetToken = async (req, res) => {
  try {
    // 1. Check if token exists in request
    if (!req.params.token) {
      return res.status(400).json({ 
        valid: false,
        error: 'Token is required' 
      });
    }

    // 2. Hash the token for comparison
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 3. Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Check expiration
    });

    // 4. Return validation result
    if (!user) {
      return res.status(200).json({ 
        valid: false,
        error: 'Invalid or expired token' 
      });
    }

    return res.status(200).json({ 
      valid: true,
      email: user.email // Optional: return email for verification
    });

  } catch (err) {
    console.error('Token validation error:', err);
    return res.status(500).json({ 
      valid: false,
      error: 'Token validation failed' 
    });
  }
};
const loginadmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminUser = await User.findOne({ email, role: 'admin' });
    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      message: 'Admin login successful',
      token, // Also send token in response for localStorage
      admin: {
        id: adminUser._id,
        email: adminUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during admin login' });
  }
};
const verifyAdminToken = (req, res) => {
  // The token should already be verified by the admin middleware
  // Just return the admin info from req.admin
  res.json({ 
    valid: true,
    admin: req.admin // This comes from the admin middleware
  });
};
module.exports = {loginUser,loginadmin , signup, forgotPassword, resetPassword, validateResetToken , logout, verifyAdminToken};