const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: {
    type: String,
    enum: ['customer', 'landowner','admin'],
    required: true
  },
}, { timestamps: true });
// server/models/User.js
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      // 1. Remove ALL whitespace (including middle spaces)
      const cleanPassword = this.password.replace(/\s+/g, '');
      
      // 2. Validate before hashing
      if (cleanPassword.length < 8) {
        throw new Error('Password must be 8+ characters');
      }
      
      // 3. Debug log the exact string being hashed
      console.log('Hashing password:', cleanPassword);
      
      // 4. Hash the cleaned password
      this.password = await bcrypt.hash(cleanPassword, 10);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Add password validation
userSchema.path('password').validate(function(pw) {
  return pw.length >= 8 && 
         /[A-Z]/.test(pw) && 
         /[0-9]/.test(pw);
}, 'Password must contain 8+ chars, 1 uppercase, 1 number');
module.exports = mongoose.model('User', userSchema);
