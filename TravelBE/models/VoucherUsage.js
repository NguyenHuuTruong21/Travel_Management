const mongoose = require('mongoose');

/**
 * VOUCHER USAGE - Lưu lịch sử mỗi lần user dùng voucher
 * Dùng để:
 * - Kiểm tra user đã dùng voucher này chưa (perUserLimit)
 * - Thống kê hiệu quả chiến dịch khuyến mãi
 */
const VoucherUsageSchema = new mongoose.Schema(
  {
    // Voucher (Promotion) được sử dụng
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      required: true,
      index: true
    },

    // User đã dùng
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Booking liên kết
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },

    // Số tiền đã giảm thực tế
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // Số tiền gốc trước khi giảm
    originalAmount: {
      type: Number,
      required: true
    },

    // Số tiền sau khi giảm
    finalAmount: {
      type: Number,
      required: true
    },

    usedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index kết hợp: kiểm tra nhanh user đã dùng voucher chưa
VoucherUsageSchema.index({ voucherId: 1, userId: 1 });

module.exports = mongoose.model('VoucherUsage', VoucherUsageSchema);
