const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  day: Number,
  title: String,
  description: String
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  address: String,
  coordinates: { // [lng, lat]
    type: [Number],
    index: '2dsphere'
  }
}, { _id: false });

const TourSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, index: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: String }, // e.g. "3 ngày 2 đêm"
  description: { type: String },
  itinerary: { type: [ItinerarySchema], default: [] }, // array of days
  images: { type: [String], default: [] }, // filenames / urls
  location: LocationSchema, // address + coordinates
  capacity: { type: Number, default: 0 }, // maximum seats
  bookedSeats: { type: Number, default: 0 },
  type: { type: String, enum: ['domestic','international'], default: 'domestic' },
  status: { type: String, enum: ['active','inactive','deleted'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  bookedSeats: { type: Number, default: 0 },
  hotels: [ 
    {
      hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
      note: String // optional: e.g. "Nghỉ đêm tại resort X"
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
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
});

// virtual remaining seats
TourSchema.virtual('remainingSeats').get(function() {
  return Math.max(0, (this.capacity || 0) - (this.bookedSeats || 0));
});

module.exports = mongoose.model('Tour', TourSchema);