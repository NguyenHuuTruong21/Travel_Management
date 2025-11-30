const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['bus', 'minivan', 'electric', 'boat', 'train', 'car'],
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    plateNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    driverName: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active',
    },
}, {timestamps: true});

module.exports = mongoose.model('Vehicle', VehicleSchema);