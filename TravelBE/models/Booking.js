const mongoose = require("mongoose");

const TimelineSchema = new mongoose.Schema({
    status: {type: String},
    note: {type: String},
    at: {type: Date, default: Date.now}
}, { _id: false });

const BookingSchema = new mongoose.Schema({
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    startDate: { type: Date, required: true },
    specialRequest: { type: String },
    vehicle: { type: String },
    guide: { type: String },
    paymentMethod: { type: String, enum: ['credit_card','banking','none'], default: 'none' },
    status: { type: String, enum: ['Pending','Confirmed','Cancelled'], default: 'Pending' },
    totalPrice: { type: Number, required: true },
    timeline: { type: [TimelineSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Booking', BookingSchema);