// models/ContactRequest.js
const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  message: { type: String  },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  contactSharedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);