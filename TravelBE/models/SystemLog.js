// Dùng để ghi lại các hành động quan trọng của Admin (thay đổi Setting, xoá Tour, khoá User)
const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Log action is required'],
      trim: true,
      minlength: 2,
      maxlength: 200
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor (admin) is required']
    },

    // Lưu đối tượng bị tác động (id, type, oldData, newData...)
    target: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    // Mọi thông tin bổ sung của hành động
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    ipAddress: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true; 
          return /^(::ffff:)?\d{1,3}(\.\d{1,3}){3}$/.test(value) || /^[0-9a-fA-F:]+$/.test(value);
        },
        message: 'Invalid IP address'
      }
    }
  },
  { timestamps: true }
);

// Tự động set default details nếu không có
SystemLogSchema.pre('save', function (next) {
  if (!this.details) {
    this.details = { note: 'No additional details' };
  }
  next();
});

module.exports = mongoose.model('SystemLog', SystemLogSchema);
