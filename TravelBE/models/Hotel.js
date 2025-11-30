const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, index: true },
    address: { type: String, required: true },
    amenities: { type: [String], default: [] }, // e.g. ['WiFi','Pool']
    pricePerNight: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    stars: { type: Number, min: 1, max: 5, default: 3 },
    status: { type: String, enum: ['active','inactive','deleted'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);