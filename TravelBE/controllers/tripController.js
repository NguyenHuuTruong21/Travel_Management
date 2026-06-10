/**
 * controllers/tripController.js
 * ==============================
 * Quản lý lịch trình cá nhân (Personal Itinerary Management)
 *
 * Endpoints:
 *  GET /api/bookings/my-itinerary   → Lấy lịch trình, filter: all|upcoming|completed
 *  GET /api/notifications           → Danh sách thông báo (alias friendly cho /user)
 *  GET /api/notifications/unread-count → Đếm thông báo chưa đọc
 *  PUT /api/notifications/:id/read  → Đánh dấu đã đọc (alias cho PATCH)
 */

const Booking = require('../models/Booking');
const notificationUtil = require('../utils/notification');

// ─────────────────────────────────────────────
//  GET /api/bookings/my-itinerary
//  Lấy danh sách lịch trình cá nhân
//  Query: filter=upcoming|completed|all  (default: all)
//         page, limit
// ─────────────────────────────────────────────
exports.getMyItinerary = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực' });

    const filter = req.query.filter || 'all';   // upcoming | completed | all
    const page   = parseInt(req.query.page  || 1);
    const limit  = parseInt(req.query.limit || 10);
    const skip   = (page - 1) * limit;

    const now = new Date();

    // Điều kiện cơ bản: chỉ lấy booking đã xác nhận / đã thanh toán
    const baseFilter = {
      user: userId,
      $or: [
        { status: 'Confirmed' },
        { status: 'Completed' },
        { paymentStatus: 'Paid' }
      ]
    };

    // Thêm filter theo thời gian
    if (filter === 'upcoming') {
      // Chuyến đi trong tương lai (startDate >= hôm nay)
      baseFilter.startDate = { $gte: now };
    } else if (filter === 'completed') {
      // Chuyến đi đã qua (startDate < hôm nay)
      baseFilter.startDate = { $lt: now };
    }

    const [total, items] = await Promise.all([
      Booking.countDocuments(baseFilter),
      Booking.find(baseFilter)
        .populate('tour', 'name destination images price duration')
        .populate('hotel', 'name address images pricePerNight')
        .populate('user', 'fullName email')
        .sort({ startDate: 1 }) // Sắp xếp theo startDate tăng dần (gần nhất trước)
        .skip(skip)
        .limit(limit)
    ]);

    // Bổ sung trường daysUntilDeparture để frontend hiển thị countdown
    const enriched = items.map(b => {
      const obj = b.toObject();
      const start = new Date(b.startDate);
      const diffMs = start - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      obj.daysUntilDeparture = diffDays; // âm = đã qua, dương = còn lại
      return obj;
    });

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      filter,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  GET /api/notifications
//  Alias friendly của /api/notifications/user
//  Query: page, limit, type
// ─────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực' });

    const page   = parseInt(req.query.page  || 1);
    const limit  = parseInt(req.query.limit || 20);
    const type   = req.query.type || null;

    const list       = await notificationUtil.listForUser(userId, { page, limit, type });
    const unreadCount = await notificationUtil.countUnread(userId);

    res.json({
      data: list.data,
      pagination: {
        page:       list.page,
        total:      list.total,
        totalPages: list.totalPages
      },
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  GET /api/notifications/unread-count
//  Trả về số thông báo chưa đọc của user hiện tại
// ─────────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực' });

    const count = await notificationUtil.countUnread(userId);
    res.json({ unreadCount: count });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  PUT /api/notifications/:id/read
//  Đánh dấu một notification là đã đọc
//  (Alias PUT cho PATCH đã có sẵn)
// ─────────────────────────────────────────────
exports.markNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Chưa xác thực' });

    const notif = await notificationUtil.markRead(userId, req.params.id);
    if (!notif) return res.status(404).json({ message: 'Thông báo không tồn tại hoặc không có quyền' });

    res.json({ message: 'Đã đánh dấu đã đọc', data: notif });
  } catch (err) {
    next(err);
  }
};
