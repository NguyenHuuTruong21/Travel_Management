const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 200
    },

    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 2000
    },

    type: {
      type: String,
      enum: ['booking', 'promo', 'system', 'security', 'contact'],
      default: 'system'
    },

    metadata: {
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
      status: { type: String, trim: true },
      extra: { type: mongoose.Schema.Types.Mixed }
    },

    isRead: { type: Boolean, default: false },

    readAt: { type: Date },

    isImportant: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto-set readAt when isRead = true
NotificationSchema.pre('save', function (next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Auto-clear readAt when marking unread
NotificationSchema.pre('save', function (next) {
  if (!this.isRead) {
    this.readAt = null;
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
