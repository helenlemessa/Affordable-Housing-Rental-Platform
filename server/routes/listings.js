const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');
const multer = require("multer");
const { storage } = require("../utils/cloudinary"); // adjust path if needed
const ContactRequest = require('../models/ContactRequest');
const Notification = require('../models/Notification');
const upload = multer({ storage })
// POST /api/listings
router.post(
  "/add",
  auth,
  (req, res, next) => {
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "documents", maxCount: 5 }
    ])(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        console.log('Multer error:', err);
        return res.status(400).json({ 
          error: 'File upload error',
          details: err.message 
        });
      } else if (err) {
        console.log('Unknown upload error:', err);
        return res.status(500).json({ 
          error: 'Server error during file upload',
          details: err.message 
        });
      }
      // If no error, continue to the next middleware
      next();
    });
  },
  async (req, res) => {
    try {
      const { 
        name: title,
        description, 
        price, 
        location,
        exactLocation,
        houseType,
        bedrooms,
        bathrooms,
        area,
        // Explicitly set to pending
        amenities,
        subcity
      } = req.body;

      const imageUrls = (req.files["images"] || []).map((file) => file.path);
      const documentUrls = (req.files["documents"] || []).map((file) => file.path);

      const listing = new Listing({
        title,
        description,
        price,
        location,
        exactLocation,
        houseType,
        bedrooms,
        bathrooms,
        area,
        amenities,
        subcity,
        availability: 'available', // explicitly mark as available
        images: imageUrls,
        documents: documentUrls,
        landowner: req.user.id,
         status: 'pending' // Explicitly set to pending
      });

      await listing.save();
      res.status(201).json(listing);
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: "Server error while creating listing",
        error: err.message 
      });
    }
  }
);
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
// Get single listing (only if approved)
// In your listings route file (routes/listings.js)
// routes/listings.js
// routes/listings.js
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landowner', 'name email phone'); // Ensure this matches your schema
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    if (listing.status !== 'approved') {
      return res.status(403).json({ error: 'This listing is not available' });
    }
    
    res.json(listing);
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
// PATCH /api/listings/:id/mark-taken
router.patch('/:id/mark-taken', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.landowner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    listing.availability = 'taken';
    await listing.save();

    res.json({ message: 'Listing marked as taken' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id/mark-taken', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify ownership
    if (listing.landowner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Instead of deleting, mark as taken and update status
    listing.availability = 'taken';
    listing.status = 'taken';
    await listing.save();

    // Create notification for any approved applicants
    const approvedRequests = await ContactRequest.find({
      listing: listing._id,
      status: 'approved'
    }).populate('fromUser');

    for (const request of approvedRequests) {
      const notification = new Notification({
        user: request.fromUser._id,
        message: `Property "${listing.title}" has been marked as taken`,
        details: 'The landowner has confirmed this property is no longer available',
        listing: listing._id,
        notificationType: 'status-change'
      });
      await notification.save();
    }

    res.json({ 
      success: true,
      listingTitle: listing.title,
      message: 'Property marked as taken and removed from public listings'
    });

  } catch (err) {
    console.error('Error marking listing as taken:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get contact requests for a listing
router.get('/:id/contact-requests', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('contactRequests.user', 'name email phone');
    
    if (listing.landowner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(listing.contactRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// In routes/listings.js - add this route
router.get('/my-listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ landowner: req.user.id })
      .populate('landowner', 'name email phone')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Found ${listings.length} listings for user ${req.user.id}`);
    res.json(listings);
  } catch (err) {
    console.error('Error fetching user listings:', err);
    res.status(500).json({ error: err.message });
  }
});
// In your listings routes
router.post('/:id/contact', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new Error('Listing not found');
    
    const contactRequest = new ContactRequest({
      listing: listing._id,
      fromUser: req.user.id,
      toUser: listing.user || listing.createdBy,
      message: req.body.message || 'Contact request'
    });
    
    await contactRequest.save();
    res.status(201).json(contactRequest);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add to routes/listings.js

// Update the request-contact endpoint
router.post('/:id/request-contact', auth, async (req, res) => {
  try {
    console.log('Request received for listing:', req.params.id); // Debug log

    const listing = await Listing.findById(req.params.id).populate('landowner');
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Check for existing request
    const existingRequest = await ContactRequest.findOne({
      listing: req.params.id,
      fromUser: req.user.id
    });
    if (existingRequest) {
      return res.status(400).json({ error: "You already requested contact" });
    }

    // Create contact request
    const contactRequest = new ContactRequest({
      listing: req.params.id,
      fromUser: req.user.id,
      toUser: listing.landowner._id,
      status: 'pending'
    });
    await contactRequest.save();

    // Create notification ONLY for landowner
    const notification = new Notification({
      user: listing.landowner._id, // Target landowner
      message: `${req.user.name} requested contact info for ${listing.title}`,
      listing: listing._id,
      notificationType: 'contact',
      actionRequired: true,
      actionType: 'contact-approval',
      relatedRequest: contactRequest._id
    });
    await notification.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error in request-contact:', err); // Detailed error logging
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// In routes/listings.js - update the approve-contact endpoint
router.post('/:id/approve-contact', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    if (listing.landowner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const contactRequest = await ContactRequest.findById(requestId)
      .populate('fromUser', 'name email');
    
    if (!contactRequest) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    // Update request status
    contactRequest.status = 'approved';
    contactRequest.contactSharedAt = new Date();
    await contactRequest.save();

    // Create notification for the tenant
    const tenantNotification = new Notification({
      user: contactRequest.fromUser._id,
      message: `Your contact request for "${listing.title}" was approved!`,
      details: `You can now contact the landowner. Phone: ${req.user.phone || 'Not provided'}`,
      listing: listing._id,
      notificationType: 'contact_approved',
      relatedRequest: contactRequest._id
    });
    await tenantNotification.save();

    // UPDATE THE LANDOWNER'S ORIGINAL NOTIFICATION
    const originalNotification = await Notification.findOne({
      relatedRequest: requestId,
      user: req.user.id, // Landowner's notification
      actionType: 'contact-approval'
    });

    if (originalNotification) {
      originalNotification.message = `You approved contact request for ${listing.title}`;
      originalNotification.details = `Contact shared with ${contactRequest.fromUser.name}`;
      originalNotification.actionRequired = false;
      originalNotification.read = true;
      await originalNotification.save();

      // Broadcast the updated notification via WebSocket
      if (req.app.locals.broadcastNotification) {
        req.app.locals.broadcastNotification(originalNotification.toObject());
      }
    }

    res.json({ 
      success: true,
      message: "Contact request approved successfully",
      contactInfo: {
        phone: req.user.phone,
        email: req.user.email,
        name: req.user.name
      }
    });

  } catch (err) {
    console.error('Error in approve-contact:', err);
    res.status(500).json({ 
      error: 'Failed to approve request',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
module.exports = router;