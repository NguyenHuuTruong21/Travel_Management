const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const notification = require('../utils/notification');
const paymentMock = require('../utils/paymentMock');

//  Helper: check startDate validity (>= today)
const isValidStartDate = (d) => {
  const date = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !isNaN(date.getTime()) && date >= today;
}

// Create Booking
exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const {
      type = 'tour', // 'tour' or 'hotel'
      tourId,
      hotelId,
      startDate,
      endDate,
      quantity,
      specialRequest,
      vehicle,
      guide,
      paymentMethod
    } = req.body;

    // Common validations
    if (!quantity || !startDate) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Thiếu thông tin số lượng/ngày bắt đầu' });
    }
    if (!isValidStartDate(startDate)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Ngày khởi hành/Check-in không hợp lệ' });
    }

    let bookingData = {
      type,
      user: userId,
      quantity,
      startDate,
      endDate,
      specialRequest,
      paymentMethod: paymentMethod || 'none',
      timeline: [{ status: 'Pending', note: 'Tạo đơn', at: new Date() }]
    };

    let totalPrice = 0;
    let resourceId = null; // tourId or hotelId for response

    // --- CASE 1: TOUR BOOKING ---
    if (type === 'tour') {
      if (!tourId) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: 'Thiếu tourId' });
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

      totalPrice = Number(tour.price) * Number(quantity);

      // Update booking data specific to tour
      bookingData.tour = tour._id;
      bookingData.vehicle = vehicle;
      bookingData.guide = guide;
      bookingData.totalPrice = totalPrice;

      // Update tour capacity
      tour.bookedSeats = (tour.bookedSeats || 0) + Number(quantity);
      await tour.save({ session });

      resourceId = tour._id;
    }
    // --- CASE 2: HOTEL BOOKING ---
    else if (type === 'hotel') {
      if (!hotelId || !endDate) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: 'Thiếu hotelId hoặc ngày Check-out' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: 'Ngày Check-out phải sau ngày Check-in' });
      }

      const hotel = await Hotel.findById(hotelId).session(session);
      if (!hotel) {
        await session.abortTransaction(); session.endSession();
        return res.status(404).json({ message: 'Khách sạn không tồn tại' });
      }

      // Calculate nights
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const nights = diffDays > 0 ? diffDays : 1;

      // Price = pricePerNight * quantity (rooms/people) * nights
      totalPrice = Number(hotel.pricePerNight || 0) * Number(quantity) * nights;

      bookingData.hotel = hotel._id;
      bookingData.totalPrice = totalPrice;

      resourceId = hotel._id;
    } else {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Loại booking không hợp lệ' });
    }

    // --- PROMOTION LOGIC (NEW) ---
    const { promotionCode } = req.body;
    let discountAmount = 0;

    if (promotionCode) {
      const Promotion = require('../models/Promotion');
      // Must check promotion again inside transaction to be safe
      const promo = await Promotion.findOne({ code: promotionCode.toUpperCase(), isActive: true }).session(session);

      if (promo) {
        // Validation (Dates, Usage)
        const now = new Date();
        const isValidDate = (!promo.startDate || promo.startDate <= now) && (!promo.endDate || promo.endDate >= now);
        const hasUsage = promo.usageLimit === 0 || promo.usedCount < promo.usageLimit;

        let isApplicable = true;
        if (promo.applicableTours && promo.applicableTours.length > 0) {
          // Only check if it's a tour booking
          if (type !== 'tour' || !promo.applicableTours.includes(tourId)) {
            isApplicable = false;
          }
        }

        if (isValidDate && hasUsage && isApplicable) {
          // Calculate Discount
          if (promo.discountType === 'percent') {
            discountAmount = (totalPrice * promo.discountValue) / 100;
          } else {
            discountAmount = promo.discountValue;
          }
          discountAmount = Math.min(discountAmount, totalPrice);

          // Update promo usage
          promo.usedCount = (promo.usedCount || 0) + 1;
          await promo.save({ session });

          // Save to booking data
          bookingData.promotionCode = promo.code;
          bookingData.discountAmount = discountAmount;
        }
      }
    }

    // Final Price
    const finalPrice = Math.max(0, totalPrice - discountAmount);
    bookingData.totalPrice = finalPrice; // Override total price with discounted price

    // CREATE BOOKING
    const booking = await Booking.create([bookingData], { session });

    await session.commitTransaction();
    session.endSession();

    const b = booking[0];
    res.status(201).json({
      bookingId: b._id,
      tourId: type === 'tour' ? resourceId : undefined,
      hotelId: type === 'hotel' ? resourceId : undefined,
      userId,
      quantity,
      status: b.status,
      totalPrice: b.totalPrice
    });

    // Notify
    (async () => {
      try {
        const user = await User.findById(userId).select('email');
        if (!user) return;
        const title = type === 'tour' ? 'Đơn đặt tour được tạo' : 'Đơn đặt khách sạn được tạo';
        const message = `Mã đơn: ${b._id}. Tổng tiền: ${b.totalPrice.toLocaleString()} VNĐ`;
        await notification.createAndDeliver({ userId, title, message, type: 'booking', metadata: { bookingId: b._id }, sendEmail: true, emailTo: user.email });
      } catch (e) { console.error('Notification error', e); }
    })();

  } catch (err) {
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
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Booking.countDocuments({ user: userId }),
      Booking.find({ user: userId })
        .populate('tour', 'name price duration')
        .populate('hotel', 'name pricePerNight address')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
    ]);

    res.json({
      page, totalPages: Math.ceil(total / limit), total,
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'ID không hợp lệ' });
    const booking = await Booking.findById(id)
      .populate('tour')
      .populate('hotel')
      .populate('user', 'fullName email');

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
    if (!mongoose.Types.ObjectId.isValid(bookingId))
      return res.status(400).json({ message: 'ID không hợp lệ' });
    
    const booking = await Booking.findById(bookingId).populate('user', 'email');
    if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

    if (String(booking.user._id) !== req.user.id) return res.status(403).json({ message: 'Không phải chủ đơn' });
    if (booking.status !== 'Pending') return res.status(400).json({ message: 'Chỉ thanh toán đơn Pending' });

    // process payment mock
    const result = await paymentMock.processPayment({ method, payload });

    if (result.success) {
      booking.status = 'Confirmed';
      booking.timeline.push({ status: 'Confirmed', note: 'Thanh toán thành công', at: new Date() });
      await booking.save();

      // notify user
      const email = booking.user.email;
      await notification.notifyBookingStatus({ userId: booking.user._id, email, bookingId: booking._id, status: 'Confirmed' });

      return res.json({ message: 'Thanh toán thành công', bookingId: booking._id });
    } else {
      booking.status = 'Cancelled';
      booking.timeline.push({ status: 'Cancelled', note: 'Thanh toán thất bại', at: new Date() });
      await booking.save();

      // rollback seats: subtract bookedSeats
      const tour = await Tour.findById(booking.tour);
      if (tour) {
        tour.bookedSeats = Math.max(0, (tour.bookedSeats || 0) - booking.quantity);
        await tour.save();
      }

      const email = booking.user.email;
      await notification.notifyBookingStatus({ userId: booking.user._id, email, bookingId: booking._id, status: 'Cancelled', note: 'Thanh toán thất bại', type: booking.type });

      return res.status(400).json({ message: 'Thanh toán thất bại', reason: result });
    }

  } catch (err) { next(err); }
};

// Get All Bookings (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Booking.countDocuments(),
      Booking.find()
        .populate('tour', 'name destination')
        .populate('hotel', 'name address')
        .populate('user', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
    ]);

    res.json({
      page, totalPages: Math.ceil(total / limit), total,
      data: items
    });
  } catch (err) {
    next(err);
  }
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

    if (!['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Status không hợp lệ' });
    }

    // if cancelling, release seats; if confirming, keep as is
    if (status === 'Cancelled' && booking.status !== 'Cancelled') {
      // reduce bookedSeats
      const tour = await Tour.findById(booking.tour).session(session);
      if (tour) {
        tour.bookedSeats = Math.max(0, (tour.bookedSeats || 0) - booking.quantity);
        await tour.save({ session });
      }
    }

    booking.status = status;
    booking.timeline.push({ status, note: note || `Admin set ${status}`, at: new Date() });
    await booking.save({ session });

    await session.commitTransaction(); session.endSession();

    // notify user (outside transaction)
    const user = await User.findById(booking.user);
    if (user?.email) {
      await notification.notifyBookingStatus({ userId: user._id, email: user.email, bookingId: booking._id, status, note, type: booking.type });
    }

    res.json({ message: `Booking ${status}` });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    next(err);
  }
};