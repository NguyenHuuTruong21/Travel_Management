const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Banner title is required'], 
      trim: true,
      minlength: 2,
      maxlength: 200
    },

    image: { 
      type: String, 
      required: [true, 'Banner image is required'], 
      trim: true 
    }, // URL or file path

    link: { 
      type: String, 
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^https?:\/\/.+/.test(value);
        },
        message: 'Link must be a valid URL'
      }
    },

    startDate: { type: Date },

    endDate: { type: Date },

    isActive: { 
      type: Boolean, 
      default: true 
    },

    order: { 
      type: Number, 
      default: 0,
      min: 0 
    }
  },
  { timestamps: true }
);

// Auto-disable banner when expired
BannerSchema.pre('save', function (next) {
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  }
  next();
});

module.exports = mongoose.model('Banner', BannerSchema);
