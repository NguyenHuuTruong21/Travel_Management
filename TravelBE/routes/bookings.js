const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const bookingCtrl = require('../controllers/bookingController');
const tripCtrl = require('../controllers/tripController');

// ✔ auth() trả về middleware — giữ nguyên nhưng đổi tên rõ ràng
const requireAuth = auth();

/* ------------------------------
   USER BOOKING ACTIONS
------------------------------ */
// Get All Bookings (Admin) - Specific route first!
router.get('/admin', requireAuth, admin, bookingCtrl.getAllBookings);

// ─── Lịch trình cá nhân (Personal Itinerary) ───
// Phải khai báo TRƯỚC route /:id để không bị match nhầm
router.get('/my-itinerary', requireAuth, tripCtrl.getMyItinerary);

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
