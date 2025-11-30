const Notification = require('../models/Notification');
const User = require('../models/User');
const notificationUtil = require('../utils/notification');

// Create notification via API (from other modules)
exports.create = async (req, res, next) => {
  try {
    const { userId, title, message, type, metadata, sendEmail } = req.body;

    if (!userId || !title || !message) return res.status(400).json({ message: 'userId/title/message required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notif = await notificationUtil.createAndDeliver({
      userId,
      title,
      message,
      type,
      metadata,
      sendEmail: !!sendEmail,
      emailTo: user.email
    });

    res.status(201).json({ notification: notif });
  } catch (err) { next(err); }
};

// Get notifications for current user with pagination and filter
exports.getForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 20);
    const type = req.query.type; // optional filter
    const skip = (page - 1) * limit;

    const filter = { user: userId };
    if (type) filter.type = type;

    const [total, items, unreadCount] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: userId, isRead: false })
    ]);

    res.json({ page, totalPages: Math.ceil(total / limit), total, unreadCount, data: items });
  } catch (err) { next(err); }
};

// Mark a notification as read
exports.markRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Not found' });
    if (String(notif.user) !== String(userId)) return res.status(403).json({ message: 'No access' });

    // For important system/security notifications require detail opened to mark read
    if (notif.type === 'security' || notif.isImportant) {
      // only mark read when explicitly opened (this endpoint is explicit)
    }

    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();

    res.json({ message: 'Marked read', notification: notif });
  } catch (err) { next(err); }
};

// Mark multiple as read (by ids)
exports.markManyRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body; // array of ids
    if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids array required' });

    await Notification.updateMany({ _id: { $in: ids }, user: userId }, { $set: { isRead: true, readAt: new Date() } });

    res.json({ message: 'Marked read' });
  } catch (err) { next(err); }
};
