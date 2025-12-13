const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  avatar: { 
    type: String,
    default: 'https://res.cloudinary.com/your-cloud/image/upload/v1620000000/default_avatar.png'
  },
  coverPhoto: { 
    type: String,
    default: 'https://res.cloudinary.com/your-cloud/image/upload/v1620000000/default_cover.jpg'
  },
  bio: { 
    type: String, 
    maxlength: 500 
  },
  contact: {
    phone: { type: String },
    alternateEmail: { type: String }
  },
  // For tenants
  preferences: {
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 2000 }
    },
    locationPreferences: [String],
    amenities: [String]
  },
  // For landlords
  properties: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property' 
  }],
  verificationStatus: {
    identityVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false }
  },
  socialLinks: {
    facebook: String,
    linkedin: String,
    twitter: String
  }
}, { timestamps: true });

// Auto-create profile when user is created
ProfileSchema.statics.createForUser = async function(userId) {
  return this.create({ user: userId });
};

module.exports = mongoose.model('Profile', ProfileSchema);