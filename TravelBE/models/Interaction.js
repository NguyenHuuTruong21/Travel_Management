const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Khách vãng lai cũng có thể tracking qua session/IP, nhưng hiện tại ưu tiên User
  },
  action: {
    type: String,
    enum: ['view_tour', 'view_hotel', 'search', 'click_booking', 'complete_booking', 'cancel_booking'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId, // Ý chỉ đến Tour ID hoặc Hotel ID
    default: null
  },
  entityType: {
    type: String,
    enum: ['tour', 'hotel', 'article', 'none'],
    default: 'none'
  },
  metadata: {
    type: Object, // Lưu thêm thông tin query, URL,... nếu muốn
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Thêm index để tối ưu Aggregation
InteractionSchema.index({ action: 1 });
InteractionSchema.index({ createdAt: 1 });
InteractionSchema.index({ user: 1 });

module.exports = mongoose.model('Interaction', InteractionSchema);
