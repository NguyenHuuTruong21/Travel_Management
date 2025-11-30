const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking', 'promo', 'system', 'security'],
        default: 'system'
    },
    metadata: {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
        status: { type: String },
        extra: { type: mongoose.Schema.Types.Mixed }
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isImportant: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);