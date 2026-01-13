const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['bus', 'minivan', 'electric', 'boat', 'train', 'car'],
      trim: true
    },

    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },

    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
      uppercase: true, // chuẩn hóa VD: "51H-12345"
      minlength: 5,
      maxlength: 20,
    },

    driverName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
    }
  },
  { timestamps: true }
);

// Prevent deleted vehicles from being returned by default
VehicleSchema.pre(/^find/, function (next) {
  if (!this.getFilter().status) {
    this.where({ status: { $ne: 'deleted' } });
  }
  next();
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
