const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour is required']
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },

    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
      default: ''
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 images allowed'
      }
    },

    status: {
      type: String,
      enum: ['approved', 'pending', 'hidden'],
      default: 'approved'
    }
  },
  { timestamps: true }
);

// Prevent user from reviewing same tour more than once
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query sorting performance
ReviewSchema.index({ tour: 1, createdAt: -1 });

// Auto-pending if rating ≤ 2
ReviewSchema.pre('save', function (next) {
  if (this.rating <= 2) {
    this.status = 'pending';
  }
  next();
});

// Sanitize comment to prevent script injection
ReviewSchema.pre('save', function (next) {
  if (this.comment) {
    this.comment = this.comment.replace(/<[^>]*>?/gm, ''); // remove HTML tags
  }
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
