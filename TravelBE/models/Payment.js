const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      trim: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'orderModel'
    },
    orderModel: {
      type: String,
      required: true,
      enum: ['Booking'] // Vì đang sử dụng bảng Booking chung
    },
    orderType: {
      type: String,
      required: true,
      enum: ['TOUR', 'HOTEL', 'CAR']
    },
    amount: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['VNPAY', 'MOMO', 'ZALOPAY', 'CASH']
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING'
    },
    paymentResponse: {
      type: Object // Lưu toàn bộ JSON response từ gateway
    },
    paidAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
