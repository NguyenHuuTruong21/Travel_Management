const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: 500,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'hidden'],
      default: 'approved'
    }
  },
  { timestamps: true }
);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });
ReviewSchema.index({ tour: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);