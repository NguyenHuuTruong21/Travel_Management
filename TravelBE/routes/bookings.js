const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const bookingCtrl = require('../controllers/bookingController');

// Require auth: you must have auth middleware that sets req.user {id, roles}
const authMiddleware = auth(); // auth middleware factory returns middleware function

router.post('/', authMiddleware, bookingCtrl.createBooking);
router.get('/user', authMiddleware, bookingCtrl.getUserBookings);
router.get('/:id', authMiddleware, bookingCtrl.getBookingDetail);

// payment by user
router.post('/:id/pay', authMiddleware, bookingCtrl.payBooking);

// admin change status
router.put('/:id/status', authMiddleware, admin, bookingCtrl.adminUpdateStatus);

module.exports = router;
