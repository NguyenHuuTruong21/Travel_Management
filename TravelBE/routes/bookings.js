const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const bookingCtrl = require('../controllers/bookingController');

// ✔ auth() trả về middleware — giữ nguyên nhưng đổi tên rõ ràng
const requireAuth = auth();

/* ------------------------------
   USER BOOKING ACTIONS
------------------------------ */
// Get All Bookings (Admin) - Specific route first!
router.get('/admin', requireAuth, admin, bookingCtrl.getAllBookings);

router.post('/', requireAuth, bookingCtrl.createBooking);
router.get('/user', requireAuth, bookingCtrl.getUserBookings);
router.get('/:id', requireAuth, bookingCtrl.getBookingDetail);

// Payment by user
router.post('/:id/pay', requireAuth, bookingCtrl.payBooking);

/* ------------------------------
   ADMIN — CHANGE BOOKING STATUS
------------------------------ */
router.put('/:id/status', requireAuth, admin, bookingCtrl.adminUpdateStatus);

module.exports = router;
