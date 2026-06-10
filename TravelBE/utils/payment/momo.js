// utils/payment/momo.js
const crypto = require('crypto');
const axios = require('axios');
const Booking = require('../../models/Booking');
const Tour = require('../../models/Tour');
const notification = require('../notification');

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const paymentUrl = process.env.MOMO_PAYMENT_URL;

if (!partnerCode || !accessKey || !secretKey) {
  console.warn('⚠️ MoMo credentials are missing in .env');
}

// Tạo chữ ký cho request tạo payment
const generateSignature = (rawData) => {
  return crypto
    .createHmac('sha256', secretKey)
    .update(rawData)
    .digest('hex');
};

// Tạo URL thanh toán MoMo (Redirect)
exports.createPaymentUrl = async (booking) => {
  const orderId = booking._id.toString();
  const requestId = `REQ_${Date.now()}_${orderId}`;
  const amount = Math.round(booking.totalPrice);
  const orderInfo = `Thanh toán đơn hàng #${orderId}`;
  
  // Point to backend return handler for verification before redirecting to frontend
  const redirectUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/momo/return`;
  const ipnUrl = process.env.MOMO_IPN_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/momo/ipn`;
  const extraData = ""; // Can be used to pass extra info if needed

  const rawSignature = 
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=captureWallet`;

  const signature = generateSignature(rawSignature);

  const requestBody = {
    partnerCode,
    partnerName: "Travel Management",
    storeId: "TravelStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType: "captureWallet",
    signature,
    lang: 'vi',
  };

  try {
    const response = await axios.post(paymentUrl, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.resultCode === 0) {
      return response.data.payUrl;
    } else {
      console.error('MoMo Error Response:', response.data);
      throw new Error(response.data.message || 'Tạo link thanh toán MoMo thất bại');
    }
  } catch (error) {
    console.error('MoMo createPaymentUrl error:', error.response?.data || error.message);
    throw error;
  }
};

// Xử lý IPN (Webhook) từ MoMo - Verify signature chi tiết
exports.handleIPN = async (body) => {
  try {
    const {
      partnerCode, orderId, requestId, amount, orderInfo, orderType,
      transId, resultCode, message, payType, responseTime,
      extraData, signature: receivedSignature
    } = body;

    // Tạo raw string để verify signature (theo thứ tự tài liệu MoMo)
    const rawSignature = 
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData || ''}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType || ''}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const calculatedSignature = generateSignature(rawSignature);

    // Verify chữ ký
    if (calculatedSignature !== receivedSignature) {
      console.error('MoMo IPN: Signature không hợp lệ');
      return { success: false, message: 'Invalid signature' };
    }

    const booking = await Booking.findById(orderId);
    if (!booking) {
      return { success: false, message: 'Booking không tồn tại' };
    }

    if (booking.paymentStatus === 'Paid') {
      return { success: true, message: 'Đã xử lý trước đó' }; // Idempotency
    }

    if (resultCode === 0) { // Thanh toán thành công
      booking.paymentStatus = 'Paid';
      booking.status = 'Confirmed';
      booking.transactionId = transId;
      booking.paymentResponse = body;
      booking.paidAt = new Date();

      // Trừ chỗ nếu là tour
      if (booking.type === 'tour' && booking.tour) {
        const tour = await Tour.findById(booking.tour);
        if (tour) {
          tour.bookedSeats = (tour.bookedSeats || 0) + Number(booking.quantity);
          await tour.save();
        }
      }

      await booking.save();

      // Gửi thông báo
      await notification.notifyBookingStatus({
        userId: booking.user,
        bookingId: booking._id,
        status: 'Confirmed',
        note: 'Thanh toán MoMo thành công',
        type: booking.type
      });

      return { success: true, message: 'Thanh toán thành công' };
    } else {
      // Thanh toán thất bại
      booking.paymentStatus = 'Failed';
      booking.status = 'Cancelled';
      booking.paymentResponse = body;
      await booking.save();

      // Rollback chỗ nếu cần (tùy theo logic của bạn)
      return { success: false, message: message || 'Thanh toán thất bại' };
    }
  } catch (error) {
    console.error('MoMo handleIPN error:', error);
    return { success: false, message: 'Lỗi xử lý IPN' };
  }
};