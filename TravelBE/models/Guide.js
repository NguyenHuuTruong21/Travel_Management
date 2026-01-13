const mongoose = require('mongoose');

// ---------------------
// Schedule Slot Schema
// ---------------------
const ScheduleSlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Schedule date is required']
    },

    startTime: {
      type: String,
      validate: {
        validator: v => !v || /^\d{2}:\d{2}$/.test(v),
        message: 'startTime must be in HH:MM format'
      }
    },

    endTime: {
      type: String,
      validate: {
        validator: v => !v || /^\d{2}:\d{2}$/.test(v),
        message: 'endTime must be in HH:MM format'
      }
    },

    isAvailable: { type: Boolean, default: true }
  },
  { _id: false }
);

// ---------------------
// Guide Schema
// ---------------------
const GuideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Guide name is required'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    phone: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    experience: {
      type: Number,
      required: true,
      min: [0, 'Experience cannot be negative'],
      default: 0
    },

    languages: {
      type: [String],
      required: [true, 'Languages required'],
      default: [],
      validate: {
        validator: arr => Array.isArray(arr) && arr.length > 0,
        message: 'Guide must speak at least one language'
      }
    },

    avatar: {
      type: String,
      required: [true, 'Avatar URL is required'],
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    certificates: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },

    schedule: {
      type: [ScheduleSlotSchema],
      default: []
    },

    toursCount: {
      type: Number,
      default: 0,
      min: 0
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: false }
);

// ---------------------
// Update updatedAt
// ---------------------
GuideSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// ---------------------
// Indexes
// ---------------------
GuideSchema.index({ status: 1 });
GuideSchema.index({ languages: 1 });
GuideSchema.index({ 'schedule.date': 1 });

module.exports = mongoose.model('Guide', GuideSchema);
