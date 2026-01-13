const User = require('../models/User');
const sendMail = require('./mailer');
const Notification = require('../models/Notification');

let ioInstance = null;
module.exports.init = (io) => { ioInstance = io };

// send realtime event to a user socket (emit to room user:<userId>)
module.exports.emitToUser = (userId, event, payload) => {
  try {
    if (ioInstance) {
      ioInstance.to(`user:${userId}`).emit(event, payload);
    }
  } catch (e) {
    console.error('Emit error', e);
  }
};

// create and deliver notification: save to DB, emit realtime, optionally send email
module.exports.createAndDeliver = async ({ userId, title, message, type = 'system', metadata = {}, sendEmail = false, isImportant = false, emailTo }) => {
  // create DB record
  // try {
  //   const notif = await Notification.create({ user: userId, title, message, type, metadata, isImportant });

  //   // realtime emit to all user devices (room: user:<userId>)
  //   module.exports.emitToUser(userId, 'notification', {
  //     id: notif._id,
  //     title: notif.title,
  //     message: notif.message,
  //     type: notif.type,
  //     metadata: notif.metadata,
  //     isImportant: notif.isImportant,
  //     createdAt: notif.createdAt
  //   });

  //   // send email if requested
  //   if (sendEmail && emailTo) {
  //     try {
  //       const subject = title;
  //       const html = `<p>${message}</p>`;
  //       await sendMail(emailTo, subject, html);
  //     } catch (err) {
  //       console.error('Failed to send notification email', err);
  //     }
  //   }

  //   return notif;
  // } catch (err) {
  //   console.error('Failed to create notification', err);
  //   throw err;
  // }
  try {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    // 1) Booking confirmed/cancelled: don't create duplicate for same bookingId + status
    if (type === 'booking' && metadata && metadata.bookingId && metadata.status) {
      const dup = await Notification.findOne({
        type: 'booking',
        'metadata.bookingId': metadata.bookingId,
        'metadata.status': metadata.status
      });
      if (dup) return dup; // trả về đã tồn tại
    }

    // 2) Promo: avoid sending same promo to same user in same day (by metadata.promoId or title)
    if (type === 'promo') {
      const promoId = metadata.promoId || null;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const promoFilter = {
        user: userId,
        type: 'promo',
        createdAt: { $gte: todayStart }
      };
      if (promoId) promoFilter['metadata.promoId'] = promoId;
      else promoFilter.title = title;
      const recent = await Notification.findOne(promoFilter);
      if (recent) return recent;
    }

    // Create DB record
    const notif = await Notification.create({
      user: userId,
      title,
      message,
      type,
      metadata,
      isImportant
    });

    // Emit realtime event (all devices): standard payload
    const payload = {
      id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      metadata: notif.metadata,
      isImportant: notif.isImportant,
      isRead: notif.isRead,
      createdAt: notif.createdAt
    };
    module.exports.emitToUser(userId, 'notification', payload);

    // If sendEmail requested -> send email, but do not block response on failure
    if (sendEmail) {
      const to = emailTo || user.email;
      if (to) {
        (async () => {
          try {
            const subject = title;
            const html = `<p>${message}</p>`;
            await sendMail(to, subject, html);
          } catch (err) {
            console.error('notification email send failed', err);
          }
        })();
      } else {
        console.warn('sendEmail requested but no emailTo/user.email present');
      }
    }

    return notif;
  }
  catch (err) {
    console.error('createAndDeliver error', err);
  }
};

/** List notifications for a user with pagination & optional type filter */
module.exports.listForUser = async (userId, { page = 1, limit = 20, type } = {}) => {
  const filter = { user: userId };
  if (type) filter.type = type;
  const skip = (Number(page) - 1) * Number(limit);

  const [total, items] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter)
      .sort({ isImportant: -1, createdAt: -1 }) // important first, then newest
      .skip(skip)
      .limit(Number(limit))
  ]);

  return {
    page: Number(page),
    total,
    totalPages: Math.ceil(total / limit),
    data: items
  };
};

/** Count unread */
module.exports.countUnread = async (userId) => {
  return Notification.countDocuments({ user: userId, isRead: false });
};

/** Mark single notification as read */
module.exports.markRead = async (userId, notifId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: notifId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  return notif;
};

/** Mark many notifications as read (ids array) */
module.exports.markManyRead = async (userId, ids = []) => {
  if (!Array.isArray(ids)) throw new Error('ids must be an array');
  const res = await Notification.updateMany(
    { _id: { $in: ids }, user: userId },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return res;
};


// specialized: booking notifications with dedupe rules
module.exports.notifyBookingStatus = async ({ userId, email, bookingId, status, note, type = 'tour' }) => {
  const serviceName = type === 'hotel' ? 'khách sạn' : 'tour';
  const title = status === 'Confirmed'
    ? `Đơn đặt ${serviceName} đã được xác nhận`
    : `Đơn đặt ${serviceName} đã bị hủy`;

  const message = note ? `${title}: ${note}` : `${title}`;
  return module.exports.createAndDeliver({
    userId,
    title,
    message,
    type: 'booking',
    metadata: { bookingId, status },
    sendEmail: true,
    emailTo: email,
    isImportant: status === 'Cancelled'
  });
};