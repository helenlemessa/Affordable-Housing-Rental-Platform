// services/listingExpiration.js
const cron = require('node-cron');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');

const checkExpiredReservations = async () => {
  try {
    const expired = await Listing.find({
      availability: 'reserved',
      updatedAt: { $lt: new Date(Date.now() - 7*24*60*60*1000) } // 7 days
    }).populate('landowner currentApplicant');
    
    for (const listing of expired) {
      listing.availability = 'available';
      listing.currentApplicant = null;
      await listing.save();
      
      // Create notifications
      await Notification.create([
        {
          user: listing.landowner,
          message: `Reservation period for ${listing.title} has expired`
        },
        {
          user: listing.currentApplicant,
          message: `Your reservation for ${listing.title} has expired`
        }
      ]);

      // Send emails
      await Promise.all([
        sendEmail({
          to: listing.landowner.email,
          subject: 'Reservation Expired',
          text: `The reservation for ${listing.title} has expired and is now available again.`
        }),
        sendEmail({
          to: listing.currentApplicant.email,
          subject: 'Reservation Expired',
          text: `Your reservation for ${listing.title} has expired. The property is now available for others.`
        })
      ]);
    }
    
    console.log(`Processed ${expired.length} expired reservations`);
  } catch (err) {
    console.error('Error processing expired reservations:', err);
  }
};

// Run daily at midnight
cron.schedule('0 0 * * *', checkExpiredReservations);

module.exports = checkExpiredReservations;