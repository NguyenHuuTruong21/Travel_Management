const mongoose = require('mongoose');

const ScheduleSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String }, // e.g. "08:00"
  endTime: { type: String }, // e.g. "17:00"
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

const GuideSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  experience: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  languages: { 
    type: [String], 
    required: true,
    default: []
  },
  avatar: { 
    type: String, 
    required: true
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
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update updatedAt before saving
GuideSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
GuideSchema.index({ status: 1 });
GuideSchema.index({ languages: 1 });
GuideSchema.index({ 'schedule.date': 1 });

module.exports = mongoose.model('Guide', GuideSchema);

