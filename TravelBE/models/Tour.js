const mongoose = require('mongoose');

// ---------------- ITINERARY ----------------
const ItinerarySchema = new mongoose.Schema(
  {
    day: { type: Number, min: 1 },
    title: { type: String, trim: true },
    description: { type: String, trim: true }
  },
  { _id: false }
);

// ---------------- LOCATION ----------------
const LocationSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true },

    coordinates: {
      // [lng, lat]
      type: [Number],
      index: '2dsphere',
      validate: {
        validator: function (value) {
          if (!value || value.length === 0) return true; // optional
          return (
            value.length === 2 &&
            value.every((num) => typeof num === 'number')
          );
        },
        message: 'Coordinates must be [lng, lat]'
      }
    }
  },
  { _id: false }
);

// ---------------- TOUR SCHEMA ----------------
const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour name is required'],
    unique: true,
    trim: true
  },

  slug: {
    type: String,
    index: true,
    trim: true
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },

  duration: { type: String, trim: true },

  description: { type: String, trim: true },

  itinerary: { type: [ItinerarySchema], default: [] },

  images: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => Array.isArray(arr),
      message: 'Images must be an array of strings'
    }
  },

  startLocation: {
    type: String,
    required: [true, 'Start location is required'],
    trim: true,
    default: 'Hồ Chí Minh' // Temporary default for migration
  },

  location: LocationSchema,

  capacity: {
    type: Number,
    default: 0,
    min: 0
  },

  bookedSeats: {
    type: Number,
    default: 0,
    min: 0
  },

  type: {
    type: String,
    enum: ['domestic', 'international'],
    default: 'domestic'
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  hotels: [
    {
      hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
      note: { type: String, trim: true }
    }
  ],

  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    default: null
  },

  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },

  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Remove duplicate bookedSeats (bug fix)
if (TourSchema.path('bookedSeats').length > 1) {
  delete TourSchema.paths['bookedSeats'];
}

// ---------------- VIRTUAL FIELD ----------------
TourSchema.virtual('remainingSeats').get(function () {
  return Math.max(0, (this.capacity || 0) - (this.bookedSeats || 0));
});

module.exports = mongoose.model('Tour', TourSchema);
