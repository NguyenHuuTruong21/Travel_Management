const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Tour = require('../models/Tour');
const notification = require('../utils/notification');
const paymentMock = require('../utils/paymentMock');

//  Helper: check startDate validity (>= today)
const isValidStartDate = (d) => {
    const date = new Date(d);
    const today = new Date();
    today.setHours(0,0,0,0);
    return !isNaN(date.getTime()) && date >= today;
}

// Create Booking
exports.createBooking = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.user.id;
        const { tourId, quantity, startDate, specialRequest, vehicle, guide, paymentMethod } = req.body;

        if (!tourId || !quantity || !startDate) {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ message: 'Thiếu tourId/quantity/startDate' });
        }

        if (!isValidStartDate(startDate)) {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ message: 'Ngày khởi hành không hợp lệ' });
        }

        const tour = await Tour.findById(tourId).session(session);
        if (!tour) {
            await session.abortTransaction(); session.endSession();
            return res.status(404).json({ message: 'Tour không tồn tại' });
        }

        const remaining = (tour.capacity || 0) - (tour.bookedSeats || 0);
        if (quantity > remaining) {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ message: 'Số lượng vượt quá chỗ trống.' });
        }

        // compute total price
        const totalPrice = Number(tour.price) * Number(quantity);

        // create booking
        const booking = await Booking.create([{
            tour: tour._id,
            user: userId,
            quantity,
            startDate,
            specialRequest,
            vehicle,
            guide,
            paymentMethod: paymentMethod || 'none',
            totalPrice,
            timeline: [{ status: 'Pending', note: 'Tạo đơn', at: new Date() }]
        }], { session });

        // tentatively reserve seats (prevent overbooking)
        tour.bookedSeats = (tour.bookedSeats || 0) + Number(quantity);
        await tour.save({ session });

        await session.commitTransaction();
        session.endSession();

        const b = booking[0];
        res.status(201).json({
          bookingId: b._id,
            tourId: tour._id,
            userId,
            quantity,
            status: b.status,
            totalPrice: b.totalPrice
        });

        // create in-app notification and send confirmation email asynchronously
        (async () => {
          try {
            const user = await User.findById(userId);
            const notification = require('../utils/notification');
            const title = 'Đơn đặt tour của bạn đã được tạo';
            const message = `Mã đơn: ${b._id}. Ngày khởi hành: ${new Date(b.startDate).toLocaleDateString()}`;
            await notification.createAndDeliver({ userId, title, message, type: 'booking', metadata: { bookingId: b._id, status: b.status }, sendEmail: true, emailTo: user.email });
          } catch (e) { console.error('Post-booking notification error', e); }
        })();
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

// Get User Bookings
exports.getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
        const skip = (page -1) * limit;

        const [total, items] = await Promise.all([
            Booking.countDocuments({ user: userId }),
            Booking.find({ user: userId })
                .populate('tour', 'name price duration')
                .sort({ createdAt: -1 })
                .skip(skip).limit(limit)
        ]);

        res.json({
            page, totalPages: Math.ceil(total/limit), total,
            data: items
        });
    }
    catch (err) {
        next(err);
    }
}

// Get Booking by ID
exports.getBookingDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id).populate('tour').populate('user','fullName email');
    if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

    // only owner or admin can view (admin check via roles)
    if (String(booking.user._id) !== req.user.id && !(req.user.roles && req.user.roles.includes('admin'))) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn này' });
    }

    res.json({ booking });
  } catch (err) { next(err); }
};

// Post Payment Mock
exports.payBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { method, payload } = req.body; // payload: { cardNumber, ... }
    const booking = await Booking.findById(bookingId).populate('user','email');
    if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

    if (String(booking.user._id) !== req.user.id) return res.status(403).json({ message: 'Không phải chủ đơn' });
    if (booking.status !== 'Pending') return res.status(400).json({ message: 'Chỉ thanh toán đơn Pending' });

    // process payment mock
    const result = await paymentMock.processPayment({ method, payload });

    if (result.success) {
      booking.status = 'Confirmed';
      booking.timeline.push({ status: 'Confirmed', note: 'Thanh toán thành công' });
      await booking.save();

      // notify user
      const email = booking.user.email;
      await notification.notifyBookingStatus({ userId: booking.user._id, email, bookingId: booking._id, status: 'Confirmed' });

      return res.json({ message: 'Thanh toán thành công', bookingId: booking._id });
    } else {
      booking.status = 'Cancelled';
      booking.timeline.push({ status: 'Cancelled', note: 'Thanh toán thất bại' });
      await booking.save();

      // rollback seats: subtract bookedSeats
      const tour = await Tour.findById(booking.tour);
      tour.bookedSeats = Math.max(0, (tour.bookedSeats || 0) - booking.quantity);
      await tour.save();

      const email = booking.user.email;
      await notification.notifyBookingStatus({ userId: booking.user._id, email, bookingId: booking._id, status: 'Cancelled', note: 'Thanh toán thất bại' });

      return res.status(400).json({ message: 'Thanh toán thất bại', reason: result });
    }

  } catch (err) { next(err); }
};

// Admin Update Booking Status
exports.adminUpdateStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const bookingId = req.params.id;
    const { status, note } = req.body; // status: Confirmed or Cancelled

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ message: 'Booking không tồn tại' });
    }

    if (!['Confirmed','Cancelled'].includes(status)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Status không hợp lệ' });
    }

    // if cancelling, release seats; if confirming, keep as is
    if (status === 'Cancelled' && booking.status !== 'Cancelled') {
      // reduce bookedSeats
      const tour = await Tour.findById(booking.tour).session(session);
      tour.bookedSeats = Math.max(0, (tour.bookedSeats || 0) - booking.quantity);
      await tour.save({ session });
    }

    booking.status = status;
    booking.timeline.push({ status, note: note || `Admin set ${status}`, at: new Date() });
    await booking.save({ session });

    await session.commitTransaction(); session.endSession();

    // notify user (outside transaction)
    const user = await User.findById(booking.user);
    await notification.notifyBookingStatus({ userId: user._id, email: user.email, bookingId: booking._id, status, note });

    res.json({ message: `Booking ${status}` });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    next(err);
  }
};