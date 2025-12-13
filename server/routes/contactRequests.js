// routes/contactRequests.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controller/contactRequestController');

router.post('/listings/:id/request-contact', auth, controller.requestContact);
router.get('/notifications', auth, controller.getNotifications);
router.put('/notifications/:id/accept', auth, controller.acceptContactRequest);
router.put('/notifications/:id/mark-taken', auth, controller.markTaken);

module.exports = router;