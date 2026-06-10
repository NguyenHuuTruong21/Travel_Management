const mongoose = require('mongoose');

/**
 * ADVANCED PROMOTION / VOUCHER SCHEMA
 * Hỗ trợ rule-based: nhóm KH, thời gian, loại dịch vụ, location
 */
const PromotionSchema = new mongoose.Schema(
  {
    // ─── THÔNG TIN CƠ BẢN ───────────────────────────────────────────
    code: {
      type: String,
      required: [true, 'Promotion code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // ─── LOẠI & GIÁ TRỊ GIẢM ────────────────────────────────────────
    discountType: {
      type: String,
      enum: ['percent', 'amount'], // percent = %, amount = VND cố định
      default: 'percent'
    },

    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount must be >= 0']
    },

    // Giới hạn số tiền giảm tối đa (áp dụng khi discountType = 'percent')
    maxDiscount: {
      type: Number,
      default: 0 // 0 = không giới hạn
    },

    // Giá trị đơn hàng tối thiểu để áp dụng
    minOrderValue: {
      type: Number,
      default: 0
    },

    // ─── THỜI GIAN HIỆU LỰC ─────────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, 'Start date required']
    },

    endDate: {
      type: Date,
      required: [true, 'End date required']
    },

    // ─── RULE: LOẠI DỊCH VỤ ─────────────────────────────────────────
    // Rỗng = áp dụng cho tất cả loại dịch vụ
    applicableTypes: {
      type: [String],
      enum: ['tour', 'hotel', 'car'],
      default: [] // [] = ALL
    },

    // ─── RULE: TOUR/HOTEL CỤ THỂ ────────────────────────────────────
    // Rỗng = áp dụng cho tất cả tour/hotel
    applicableTours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour'
      }
    ],

    // ─── RULE: ĐỊA ĐIỂM ─────────────────────────────────────────────
    applicableLocations: {
      type: [String], // VD: ['Hà Nội', 'Đà Nẵng']
      default: []     // [] = tất cả địa điểm
    },

    // ─── RULE: NHÓM KHÁCH HÀNG ──────────────────────────────────────
    userGroup: {
      type: String,
      enum: ['ALL', 'NEW_USER', 'VIP', 'NORMAL'],
      default: 'ALL'
    },

    // ─── SỐ LẦN SỬ DỤNG ─────────────────────────────────────────────
    usageLimit: {
      type: Number,
      default: 0, // 0 = không giới hạn tổng
      min: 0
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Mỗi user được dùng tối đa N lần (0 = không giới hạn)
    perUserLimit: {
      type: Number,
      default: 1 // Mặc định mỗi user chỉ dùng 1 lần
    },

    // ─── TRẠNG THÁI ─────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true
    },

    // Flash sale: hiển thị countdown
    isFlashSale: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// ─── HOOKS ──────────────────────────────────────────────────────────
// Auto-disable expired promotion
PromotionSchema.pre('save', function (next) {
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  }
  next();
});

// Validate: startDate < endDate
PromotionSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'endDate must be later than startDate');
  }
  next();
});

// Validate: usedCount must not exceed usageLimit
PromotionSchema.pre('save', function (next) {
  if (this.usageLimit > 0 && this.usedCount > this.usageLimit) {
    this.invalidate('usedCount', 'usedCount cannot exceed usageLimit');
  }
  next();
});

// ─── VIRTUAL: trạng thái còn hiệu lực không ────────────────────────
PromotionSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === 0 || this.usedCount < this.usageLimit)
  );
});

module.exports = mongoose.model('Promotion', PromotionSchema);
