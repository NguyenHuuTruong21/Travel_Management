const mongoose = require('mongoose');
const slugify = require('slugify');

const HotelSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Hotel name is required'], 
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 200
    },

    slug: { 
      type: String, 
      index: true,
      trim: true
    },

    address: { 
      type: String, 
      required: [true, 'Hotel address is required'], 
      trim: true 
    },

    amenities: { 
      type: [String], 
      default: [],
      validate: {
        validator: arr => Array.isArray(arr),
        message: 'Amenities must be an array of strings'
      }
    },

    pricePerNight: { 
      type: Number, 
      default: 0, 
      min: 0 
    },

    images: { 
      type: [String], 
      default: [],
      validate: {
        validator: arr => Array.isArray(arr),
        message: 'Images must be an array of strings'
      }
    },

    stars: { 
      type: Number, 
      min: 1, 
      max: 5, 
      default: 3 
    },

    status: { 
      type: String, 
      enum: ['active', 'inactive', 'deleted'], 
      default: 'active' 
    }
  },
  { timestamps: true }
);

// Auto-generate slug from name
HotelSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Hotel', HotelSchema);
