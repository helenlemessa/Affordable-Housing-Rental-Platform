const Listing = require('../models/Listing');
const User = require('../models/user');
const ContactRequest = require('../models/ContactRequest');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.requestContact = async (req, res) => {
  try {
    const listingId = req.params.id;
    const requesterId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ error: 'Invalid listing id' });
    }

    // Find listing with landowner (not owner)
    const listing = await Listing.findById(listingId).populate('landowner');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listing.landowner) {
      console.error('Listing landowner missing for listing', listingId);
      return res.status(500).json({ error: 'Listing landowner not configured' });
    }

    // Prevent owner requesting their own listing
    if (listing.landowner._id.toString() === requesterId.toString()) {
      return res.status(400).json({ error: 'Cannot request contact for your own listing' });
    }

    // Check for existing request
    const existingRequest = await ContactRequest.findOne({
      listing: listingId,
      fromUser: requesterId
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'You already requested contact for this property' });
    }

    // Create contact request
    const contactReq = await ContactRequest.create({
      listing: listing._id,
      fromUser: requesterId,
      toUser: listing.landowner._id,
      status: 'pending',
      createdAt: new Date()
    });

    // Get requester info for notification
    const requester = await User.findById(requesterId);

    // Create notification for landowner - FIXED SCHEMA
    const notification = await Notification.create({
      recipient: listing.landowner._id, // Use recipient instead of user
      sender: requesterId,
      type: 'contact_request',
      listing: listing._id,
      contactRequest: contactReq._id,
      message: `${requester.name} wants to contact you about "${listing.title}"`,
      actionRequired: true,
      actionType: 'contact-approval',
      read: false
    });

    console.log('✅ Notification created for landowner:', notification);

    // Broadcast via WebSocket if available
    if (req.app.locals.sendToUser) {
      req.app.locals.sendToUser(listing.landowner._id, {
        _id: notification._id,
        recipient: listing.landowner._id,
        sender: requesterId,
        type: 'contact_request',
        message: notification.message,
        actionRequired: true,
        actionType: 'contact-approval',
        listing: listing._id,
        read: false,
        createdAt: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact request sent',
      contactRequest: contactReq,
      notification
    });
  } catch (err) {
    console.error('requestContact error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// GET /api/notifications - FIXED
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔔 Fetching notifications for user:', userId);
    
    const notifications = await Notification.find({ recipient: userId })
      .populate('listing', 'title price location')
      .populate('sender', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Found ${notifications.length} notifications for user ${userId}`);
    
    return res.json(notifications); // Return array directly, not wrapped in object
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/notifications/:id/accept - FIXED
exports.acceptContactRequest = async (req, res) => {
  try {
    const notifId = req.params.id;
    const ownerId = req.user.id;

    const notif = await Notification.findById(notifId);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (notif.recipient.toString() !== ownerId) return res.status(403).json({ error: 'Not authorized' });
    if (notif.type !== 'contact_request') return res.status(400).json({ error: 'Invalid notification type' });

    // Load listing and requester
    const listing = await Listing.findById(notif.listing).populate('landowner');
    const requester = await User.findById(notif.sender);
    if (!listing || !requester) return res.status(404).json({ error: 'Related data not found' });

    // Update contact request status
    await ContactRequest.findOneAndUpdate(
      { _id: notif.contactRequest },
      { status: 'approved', contactSharedAt: new Date() }
    );

    // Send notification back to requester with owner's contact info
    const requesterNotification = await Notification.create({
      recipient: requester._id,
      sender: ownerId,
      type: 'contact_approved',
      listing: listing._id,
      message: `Your contact request for "${listing.title}" was approved!`,
      contactInfo: {
        name: listing.landowner.name,
        email: listing.landowner.email,
        phone: listing.landowner.phone
      },
      read: false
    });

    // Mark original notification as read
    notif.read = true;
    notif.actionRequired = false;
    await notif.save();

    // Broadcast to requester via WebSocket
    if (req.app.locals.sendToUser) {
      req.app.locals.sendToUser(requester._id, {
        _id: requesterNotification._id,
        recipient: requester._id,
        type: 'contact_approved',
        message: requesterNotification.message,
        contactInfo: requesterNotification.contactInfo,
        listing: listing._id,
        read: false,
        createdAt: new Date()
      });
    }

    return res.json({ 
      success: true, 
      message: 'Contact shared with requester',
      contactInfo: requesterNotification.contactInfo
    });
  } catch (err) {
    console.error('acceptContactRequest error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/notifications/:id/mark-taken - FIXED
exports.markTaken = async (req, res) => {
  try {
    const notifId = req.params.id;
    const ownerId = req.user.id;

    const notif = await Notification.findById(notifId);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (notif.recipient.toString() !== ownerId) return res.status(403).json({ error: 'Not authorized' });

    const listing = await Listing.findById(notif.listing);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.landowner.toString() !== ownerId) return res.status(403).json({ error: 'Not landowner' });

    // Update listing status instead of deleting
    listing.availability = 'taken';
    listing.status = 'taken';
    await listing.save();

    // Update contact requests
    await ContactRequest.updateMany(
      { listing: listing._id, status: 'pending' }, 
      { status: 'rejected' }
    );

    // Update notification
    notif.read = true;
    notif.actionRequired = false;
    await notif.save();

    // Notify all pending requesters
    const pendingRequests = await ContactRequest.find({
      listing: listing._id,
      status: 'pending'
    }).populate('fromUser');

    for (const request of pendingRequests) {
      const statusNotification = await Notification.create({
        recipient: request.fromUser._id,
        sender: ownerId,
        type: 'status_change',
        listing: listing._id,
        message: `The listing "${listing.title}" has been marked as taken`,
        read: false
      });

      // Broadcast via WebSocket
      if (req.app.locals.sendToUser) {
        req.app.locals.sendToUser(request.fromUser._id, statusNotification.toObject());
      }
    }

    return res.json({ 
      success: true, 
      message: 'Listing marked as taken and requesters notified'
    });
  } catch (err) {
    console.error('markTaken error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};