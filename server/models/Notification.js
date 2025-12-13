const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // CHANGE: Use 'recipient' instead of 'user' for consistency
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['contact_request', 'contact_approved', 'listing_taken', 'status_change', 'contact_response'], 
    required: true 
  },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  contactRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactRequest' },
  read: { type: Boolean, default: false },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionType: {
    type: String,
    enum: ['contact-approval', 'mark-taken', null],
    default: null
  },
  contactInfo: {
    name: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);