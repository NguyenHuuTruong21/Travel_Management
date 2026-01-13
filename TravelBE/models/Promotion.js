const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: [true, 'Promotion code is required'], 
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },

    description: { 
      type: String, 
      trim: true,
      maxlength: 500
    },

    discountType: { 
      type: String, 
      enum: ['percent', 'amount'], 
      default: 'percent' 
    },

    discountValue: { 
      type: Number, 
      required: [true, 'Discount value is required'],
      min: [0, 'Discount must be greater than 0']
    },

    startDate: { 
      type: Date, 
      required: [true, 'Start date required'] 
    },

    endDate: { 
      type: Date, 
      required: [true, 'End date required']
    },

    applicableTours: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tour'
      }
    ], // Empty = apply to ALL tours

    isActive: { 
      type: Boolean, 
      default: true 
    },

    usageLimit: { 
      type: Number, 
      default: 0,
      min: 0 // 0 = unlimited
    },

    usedCount: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Auto-disable expired promotion
PromotionSchema.pre('save', function (next) {
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  }
  next();
});

// Validate: startDate < endDate
PromotionSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'endDate must be later than startDate');
  }
  next();
});

// Validate: usedCount must not exceed usageLimit (if not unlimited)
PromotionSchema.pre('save', function (next) {
  if (this.usageLimit > 0 && this.usedCount > this.usageLimit) {
    this.invalidate('usedCount', 'usedCount cannot exceed usageLimit');
  }
  next();
});

module.exports = mongoose.model('Promotion', PromotionSchema);
