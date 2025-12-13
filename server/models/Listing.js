const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  exactLocation: String,
  houseType: String,
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  amenities: [String],
  subcity: String,
  images: [String],
  documents: [String],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'taken'],
    default: 'pending'
  },
  availability: {
    type: String,
    enum: ['available', 'taken' , 'reserved'],
    default: 'available'
  },
  adminComments: String,
  landowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   currentApplicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    contactSharedAt: Date,
    agreementReached: Boolean,
      createdBy: {  // Add this if you use both
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
    agreementDate: Date
  }]
});


module.exports = mongoose.model('Listing', listingSchema);
