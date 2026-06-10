const mongoose = require("mongoose");

// ========== TIMELINE SCHEMA ==========
const TimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: [true, "Timeline status is required"],
      trim: true,
      minlength: 2
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500
    },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

// ========== BOOKING SCHEMA ==========
const BookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour"
      // required removed to support hotels
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel"
    },

    type: {
      type: String,
      enum: ["tour", "hotel", "car"],
      default: "tour",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Minimum quantity is 1"]
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },

    endDate: {
      type: Date
      // Required for hotels
    },

    specialRequest: { type: String, trim: true, maxlength: 1000 },

    vehicle: { type: String, trim: true },

    guide: { type: String, trim: true },

    paymentMethod: {
      type: String,
      enum: ["VNPay", "MoMo", "Cash", "none"],
      default: "none"
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed", "Refunded", "Confirmed", "Cancelled", "Completed"],
      default: "Pending"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price must be >= 0"]
    },

    transactionId: String,           // Mã giao dịch từ gateway
    paymentResponse: Object,         // Lưu response đầy đủ (JSON)
    paidAt: Date,

    timeline: {
      type: [TimelineSchema],
      default: []
    },

    promotionCode: { type: String, trim: true },
    discountAmount: { type: Number, default: 0 },

    // ========== REMINDER FIELDS ==========
    // Cờ tổng quát: đã gửi ít nhất một reminder chưa
    reminderSent: { type: Boolean, default: false },

    // Log chi tiết từng lần nhắc: type '3days' hoặc '1day'
    reminders: [
      {
        type: {
          type: String,
          enum: ['3days', '1day'],
          required: true
        },
        sentAt: { type: Date, default: Date.now }
      }
    ],

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto timeline push when status changes
BookingSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.timeline.push({
      status: this.status,
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
