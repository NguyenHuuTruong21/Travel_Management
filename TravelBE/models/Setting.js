const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },

    type: {
      type: String,
      enum: ['number', 'string', 'boolean', 'json'],
      default: 'string'
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

// ---- VALIDATION FOR "value" BASED ON "type" ----
SettingSchema.pre('save', function (next) {
  const { type, value } = this;

  if (type === 'number' && typeof value !== 'number') {
    return next(new Error('Value must be a number'));
  }

  if (type === 'boolean' && typeof value !== 'boolean') {
    return next(new Error('Value must be a boolean'));
  }

  if (type === 'string' && typeof value !== 'string') {
    return next(new Error('Value must be a string'));
  }

  if (type === 'json' && typeof value !== 'object') {
    return next(new Error('Value must be a JSON object'));
  }

  next();
});

module.exports = mongoose.model('Setting', SettingSchema);
