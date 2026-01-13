const Notification = require('../models/Notification');
const notificationUtil = require('../utils/notification');
const User = require('../models/User');

// Create notification via API (from other modules)
exports.create = async (req, res, next) => {
  try {
    const { userId, title, message, type, metadata, sendEmail, emailTo, isImportant } = req.body;

    if (!userId || !title || !message)
      return res.status(400).json({ error: 'userId, title, message are required' });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: 'User not found' });

    const notification = await notificationUtil.createAndDeliver({
      userId,
      title,
      message,
      type: type || 'general',
      metadata: metadata || {},
      sendEmail: Boolean(sendEmail),
      emailTo,
      isImportant: Boolean(isImportant)
    });

    res.status(201).json({ data: notification });
  } catch (err) {
    next(err);
  }
};

// Get notifications for current user with pagination and filter
exports.getForUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.user.id;

    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 20);
    const type = req.query.type || null;

    const list = await notificationUtil.listForUser(userId, { page, limit, type });
    const unreadCount = await notificationUtil.countUnread(userId);

    res.json({
      data: list.data,
      pagination: {
        page: list.page,
        total: list.total,
        totalPages: list.totalPages
      },
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

// Mark a notification as read
exports.markRead = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.user.id;
    const id = req.params.id;

    const notif = await notificationUtil.markRead(userId, id);
    if (!notif)
      return res.status(404).json({ error: 'Notification not found or not allowed' });

    res.json({
      message: 'Notification marked as read',
      data: notif
    });
  } catch (err) {
    next(err);
  }
};

// Mark multiple as read (by ids)
exports.markManyRead = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: 'ids[] required' });

    const result = await notificationUtil.markManyRead(userId, ids);

    res.json({
      message: 'Notifications marked as read',
      data: result
    });
  } catch (err) {
    next(err);
  }
};
