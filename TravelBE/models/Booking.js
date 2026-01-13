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
      enum: ["tour", "hotel"],
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
      enum: ["credit_card", "banking", "none"],
      default: "none"
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending"
    },

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price must be >= 0"]
    },

    timeline: {
      type: [TimelineSchema],
      default: []
    },

    promotionCode: { type: String, trim: true },
    discountAmount: { type: Number, default: 0 },

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
