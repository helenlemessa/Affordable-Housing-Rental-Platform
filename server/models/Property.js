// server/models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: { type: String, required: true },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  isPublished: { type: Boolean, default: false },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);