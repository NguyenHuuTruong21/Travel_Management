const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const controller = require('../controllers/notificationController');
const tripCtrl = require('../controllers/tripController');

// ─── Admin: tạo notification thủ công ───
router.post('/', auth(['admin']), controller.create);

// ─── User: lấy danh sách thông báo ───
// GET /api/notifications        → alias friendly (dùng cho MyItinerary / NotificationBell)
// GET /api/notifications/user   → route cũ vẫn hoạt động
router.get('/unread-count', auth(), tripCtrl.getUnreadCount);   // phải TRƯỚC /:id
router.get('/',             auth(), tripCtrl.getNotifications);
router.get('/user',         auth(), controller.getForUser);

// ─── Mark as read ───
// PATCH (cũ) + PUT (alias mới cho frontend itinerary)
router.patch('/:id/read', auth(), controller.markRead);
router.put('/:id/read',   auth(), tripCtrl.markNotificationRead);

// ─── Mark nhiều thông báo đã đọc ───
router.patch('/mark-many-read', auth(), controller.markManyRead);

module.exports = router;
