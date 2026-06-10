const mongoose = require('mongoose');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { validateVoucher, recordVoucherUsage } = require('./voucherController');

// ═══════════════════════════════════════════════════════════════════════
//  TẠO THANH TOÁN - Dùng Simulated Payment thay vì VNPay/MoMo thật
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/create
 * Tạo link thanh toán giả lập
 */
exports.createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, orderType, couponCode, paymentMethod = 'VNPAY' } = req.body;
    const userId = req.user?.id;

    // 1. Tìm booking
    const booking = await Booking.findById(orderId).session(session);
    if (!booking) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });
    }

    if (booking.paymentStatus === 'Paid') {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Đơn hàng này đã được thanh toán' });
    }

    // 2. Validate và tính voucher (nếu có)
    let originalAmount = booking.totalPrice;
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const voucherResult = await validateVoucher({
        code: couponCode,
        userId,
        bookingType: booking.type,
        amount: originalAmount
      });

      if (voucherResult.valid) {
        discountAmount = voucherResult.discountAmount;
        appliedCoupon = couponCode;
        // Cập nhật booking với thông tin giảm giá
        booking.promotionCode = couponCode.toUpperCase();
        booking.discountAmount = discountAmount;
      }
      // Nếu voucher không hợp lệ, bỏ qua (không báo lỗi, chỉ không giảm)
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    // 3. Tạo Payment record ở trạng thái PENDING
    const [payment] = await Payment.create([{
      orderId: booking._id,
      orderModel: 'Booking',
      orderType: orderType || booking.type.toUpperCase(),
      amount: originalAmount,
      discountAmount,
      finalAmount,
      paymentMethod: paymentMethod || 'VNPAY',
      status: 'PENDING'
    }], { session });

    // 4. Tạo token bảo mật cho simulated payment
    const simToken = crypto.randomBytes(32).toString('hex');

    // Lưu token vào payment response tạm thời
    payment.paymentResponse = {
      simToken,
      createdAt: new Date().toISOString(),
      appliedCoupon
    };
    await payment.save({ session });

    // 5. Cập nhật booking
    booking.paymentId = payment._id;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 6. Tạo link giả lập thanh toán
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentUrl = `${frontendUrl}/payment-simulate?` +
      `token=${simToken}&` +
      `bookingId=${booking._id}&` +
      `paymentId=${payment._id}&` +
      `amount=${finalAmount}&` +
      `method=${paymentMethod}&` +
      `type=${booking.type}`;

    res.json({
      success: true,
      paymentUrl,
      paymentId: payment._id,
      originalAmount,
      discountAmount,
      finalAmount,
      appliedCoupon
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    console.error('Create Payment Error:', error);
    res.status(500).json({ message: 'Lỗi khởi tạo thanh toán', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  SIMULATE CALLBACK - Xử lý kết quả giả lập sau khi user click
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/payments/simulate/callback
 * Query: { token, paymentId, bookingId, status: 'success' | 'cancel' }
 */
exports.simulateCallback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { token, paymentId, bookingId, status } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!token || !paymentId || !bookingId) {
      return res.redirect(`${frontendUrl}/payment-error?reason=invalid_token`);
    }

    // Tìm Payment và verify token
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment || payment.paymentResponse?.simToken !== token) {
      await session.abortTransaction(); session.endSession();
      return res.redirect(`${frontendUrl}/payment-error?reason=invalid_token`);
    }

    if (payment.status !== 'PENDING') {
      await session.abortTransaction(); session.endSession();
      return res.redirect(`${frontendUrl}/payment-success?bookingId=${bookingId}`);
    }

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction(); session.endSession();
      return res.redirect(`${frontendUrl}/payment-error?reason=booking_not_found`);
    }

    if (status === 'success') {
      // ─── THANH TOÁN THÀNH CÔNG ─────────────────────────────────────
      const txnId = 'SIM' + Date.now();

      payment.status = 'SUCCESS';
      payment.transactionId = txnId;
      payment.paidAt = new Date();
      payment.paymentResponse = {
        ...payment.paymentResponse,
        resultCode: '00',
        message: 'Simulated Payment Success'
      };
      await payment.save({ session });

      booking.paymentStatus = 'Paid';
      booking.status = 'Confirmed';
      booking.transactionId = txnId;
      booking.paidAt = new Date();
      await booking.save({ session });

      // Cộng bookedSeats nếu là tour
      if (booking.type === 'tour' && booking.tour) {
        const Tour = require('../models/Tour');
        await Tour.findByIdAndUpdate(booking.tour, {
          $inc: { bookedSeats: booking.quantity }
        }, { session });
      }

      // Cập nhật User totalSpent + totalBookings + group
      await updateUserLoyalty(booking.user, payment.finalAmount, session);

      // Ghi nhận usage voucher (nếu có dùng mã)
      if (booking.promotionCode) {
        await recordVoucherUsage({
          code: booking.promotionCode,
          userId: booking.user,
          bookingId: booking._id,
          discountAmount: payment.discountAmount,
          originalAmount: payment.amount,
          finalAmount: payment.finalAmount
        });
      }

      await session.commitTransaction();
      session.endSession();

      return res.redirect(
        `${frontendUrl}/payment-success?bookingId=${bookingId}&txnId=${txnId}&amount=${payment.finalAmount}`
      );

    } else {
      // ─── HỦY / THẤT BẠI ───────────────────────────────────────────
      payment.status = 'FAILED';
      payment.paymentResponse = { ...payment.paymentResponse, resultCode: '99', message: 'User cancelled' };
      await payment.save({ session });

      booking.paymentStatus = 'Failed';
      booking.status = 'Cancelled';
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.redirect(`${frontendUrl}/payment-error?reason=cancelled&bookingId=${bookingId}`);
    }

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    console.error('Simulate Callback Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment-error?reason=server_error`);
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  HELPER: Cập nhật loyalty sau khi thanh toán thành công
// ═══════════════════════════════════════════════════════════════════════
const updateUserLoyalty = async (userId, amount, session) => {
  try {
    const user = await User.findById(userId).session(session);
    if (!user) return;

    user.totalBookings = (user.totalBookings || 0) + 1;
    user.totalSpent = (user.totalSpent || 0) + amount;

    // Tính lại nhóm khách hàng
    const VIP_THRESHOLD_SPENT = 10_000_000;  // 10 triệu VND
    const VIP_THRESHOLD_BOOKINGS = 5;

    if (user.totalSpent >= VIP_THRESHOLD_SPENT || user.totalBookings >= VIP_THRESHOLD_BOOKINGS) {
      user.group = 'VIP';
    } else if (user.totalBookings > 0) {
      user.group = 'NORMAL';
    } else {
      user.group = 'NEW_USER';
    }

    await user.save({ session });
  } catch (err) {
    console.error('updateUserLoyalty error:', err);
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  GET PAYMENT STATUS (User kiểm tra trạng thái)
// ═══════════════════════════════════════════════════════════════════════
exports.getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('paymentId')
      .lean();

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    res.json({
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      payment: booking.paymentId ? {
        id: booking.paymentId._id,
        status: booking.paymentId.status,
        amount: booking.paymentId.amount,
        discountAmount: booking.paymentId.discountAmount,
        finalAmount: booking.paymentId.finalAmount,
        paymentMethod: booking.paymentId.paymentMethod,
        paidAt: booking.paymentId.paidAt
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
