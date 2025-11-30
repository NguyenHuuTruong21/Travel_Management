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
  try {
    const notif = await Notification.create({ user: userId, title, message, type, metadata, isImportant });

    // realtime emit to all user devices (room: user:<userId>)
    module.exports.emitToUser(userId, 'notification', {
      id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      metadata: notif.metadata,
      isImportant: notif.isImportant,
      createdAt: notif.createdAt
    });

    // send email if requested
    if (sendEmail && emailTo) {
      try {
        const subject = title;
        const html = `<p>${message}</p>`;
        await sendMail(emailTo, subject, html);
      } catch (err) {
        console.error('Failed to send notification email', err);
      }
    }

    return notif;
  } catch (err) {
    console.error('Failed to create notification', err);
    throw err;
  }
};

// specialized: booking notifications with dedupe rules
module.exports.notifyBookingStatus = async ({ userId, email, bookingId, status, note }) => {
  // status should be e.g. 'Confirmed' or 'Cancelled'
  const type = 'booking';
  const title = status === 'Confirmed' ? 'Đơn đặt tour đã được xác nhận' : (status === 'Cancelled' ? 'Đơn đặt tour đã bị hủy' : 'Trạng thái đơn thay đổi');
  const message = note ? `${title}: ${note}` : `${title}`;

  // dedupe: check if notification for this booking+status already exists
  try {
    const exists = await Notification.findOne({
      type,
      'metadata.bookingId': bookingId,
      'metadata.status': status
    });

    if (exists) {
      // already sent; do not duplicate
      return exists;
    }

    const notif = await module.exports.createAndDeliver({
      userId,
      title,
      message,
      type,
      metadata: { bookingId, status },
      sendEmail: true,
      emailTo: email,
      isImportant: status === 'Cancelled'
    });

    return notif;
  } catch (err) {
    console.error('notifyBookingStatus error', err);
    // still try to send realtime/event even if DB fails
    try { module.exports.emitToUser(userId, 'booking_status_updated', { bookingId, status, note }); } catch(e){}
  }
};