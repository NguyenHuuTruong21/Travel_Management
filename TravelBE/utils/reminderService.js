/**
 * utils/reminderService.js
 * ========================
 * Dịch vụ nhắc nhở tự động cho Personal Itinerary Management.
 *
 * Flow:
 *  1. Cron job chạy mỗi ngày lúc 08:00 sáng (0 8 * * *)
 *  2. Tìm tất cả booking thỏa: status=Confirmed, paymentStatus=Paid,
 *     startDate trong khoảng 3 ngày hoặc 1 ngày tới
 *  3. Với mỗi booking chưa gửi reminder loại đó:
 *     a) Gửi email HTML đẹp
 *     b) Tạo Notification record trong DB
 *     c) Emit Socket.IO event 'notification:new' về client
 *     d) Cập nhật booking.reminders để tránh gửi lại
 */

const cron = require('node-cron');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const sendMail = require('./mailer');
const notificationUtil = require('./notification');

// ─────────────────────────────────────────────
//  Helper: tạo HTML email nhắc nhở đẹp
// ─────────────────────────────────────────────
const buildReminderEmailHtml = (booking, reminderType, user, resource) => {
  const daysLeft = reminderType === '3days' ? 3 : 1;
  const isHotel = booking.type === 'hotel';
  const serviceName = isHotel ? 'Đặt phòng khách sạn' : 'Tour du lịch';
  const resourceName = resource?.name || 'Chưa xác định';
  const startDate = new Date(booking.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nhắc nhở lịch trình</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:36px 32px;text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:28px;">✈️</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;margin:8px 0 4px;font-weight:700;">Nhắc nhở lịch trình</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">
        Còn <strong>${daysLeft} ngày</strong> nữa là đến ngày khởi hành!
      </p>
    </div>

    <!-- Content -->
    <div style="padding:32px;">
      <p style="font-size:16px;color:#374151;margin:0 0 8px;">Xin chào <strong>${user?.fullName || 'Quý khách'}</strong>,</p>
      <p style="font-size:15px;color:#6b7280;margin:0 0 24px;">
        Chúng tôi nhắc nhở bạn về ${serviceName.toLowerCase()} sắp tới của mình. Hãy chuẩn bị thật kỹ để có một chuyến đi tuyệt vời nhé!
      </p>

      <!-- Booking Info Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:17px;color:#1e293b;margin:0 0 16px;font-weight:700;">📋 Thông tin ${serviceName}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Dịch vụ:</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${resourceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Mã đặt chỗ:</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;font-family:monospace;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Ngày khởi hành:</td>
            <td style="padding:8px 0;color:#2563eb;font-size:14px;font-weight:700;">${startDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Số lượng:</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;">${booking.quantity} ${isHotel ? 'phòng' : 'người'}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Tổng tiền:</td>
            <td style="padding:8px 0;color:#16a34a;font-size:14px;font-weight:700;">${booking.totalPrice?.toLocaleString('vi-VN')} VNĐ</td>
          </tr>
        </table>
      </div>

      <!-- Checklist -->
      <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="font-size:15px;color:#1e40af;margin:0 0 12px;font-weight:700;">✅ Danh sách cần chuẩn bị</h3>
        <ul style="margin:0;padding-left:20px;color:#3b4a6b;font-size:14px;line-height:1.9;">
          ${isHotel ? `
          <li>Kiểm tra xác nhận đặt phòng và yêu cầu đặc biệt</li>
          <li>Chuẩn bị giấy tờ tùy thân (CMND/Hộ chiếu)</li>
          <li>Kiểm tra địa chỉ và phương tiện di chuyển đến khách sạn</li>
          <li>Liên hệ khách sạn nếu cần hỗ trợ thêm</li>
          ` : `
          <li>Kiểm tra hành lý và các vật dụng cần thiết</li>
          <li>Chuẩn bị giấy tờ tùy thân (CMND/Hộ chiếu)</li>
          <li>Xem lại lịch trình và điểm tập hợp khởi hành</li>
          <li>Kiểm tra dự báo thời tiết tại điểm đến</li>
          <li>Mang theo thuốc cần thiết và đồ sơ cứu</li>
          `}
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${frontendUrl}/my-itinerary" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(37,99,235,0.35);">
          🗺️ Xem lịch trình của tôi
        </a>
      </div>

      <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">
        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ đội hỗ trợ của chúng tôi.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        © ${new Date().getFullYear()} <strong>TravelManagement</strong> — Mọi quyền được bảo lưu
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// ─────────────────────────────────────────────
//  Core: gửi reminder cho một booking cụ thể
// ─────────────────────────────────────────────
const sendReminderForBooking = async (booking, reminderType) => {
  try {
    // Populate user + tour/hotel nếu chưa populate
    await booking.populate('user', 'fullName email');

    let resource = null;
    if (booking.type === 'tour') {
      await booking.populate('tour', 'name destination');
      resource = booking.tour;
    } else if (booking.type === 'hotel') {
      await booking.populate('hotel', 'name address');
      resource = booking.hotel;
    }

    const user = booking.user;
    if (!user || !user.email) {
      console.warn(`[Reminder] Booking ${booking._id}: user không có email, bỏ qua.`);
      return;
    }

    const daysLabel = reminderType === '3days' ? '3 ngày' : '1 ngày';
    const serviceName = booking.type === 'hotel' ? 'đặt phòng khách sạn' : 'tour du lịch';
    const resourceName = resource?.name || 'dịch vụ';
    const startDate = new Date(booking.startDate).toLocaleDateString('vi-VN');

    const title = `⏰ Còn ${daysLabel} – ${resourceName} sắp khởi hành!`;
    const message = `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} "${resourceName}" của bạn sẽ bắt đầu vào ngày ${startDate}. Hãy chuẩn bị bước vào hành trình!`;

    // 1) Gửi Email HTML
    try {
      const html = buildReminderEmailHtml(booking, reminderType, user, resource);
      await sendMail(user.email, title, html);
      console.log(`[Reminder] ✅ Email gửi đến ${user.email} (${reminderType})`);
    } catch (emailErr) {
      console.error(`[Reminder] ❌ Gửi email thất bại (${booking._id}):`, emailErr.message);
    }

    // 2) Tạo Notification record + emit Socket.IO
    await notificationUtil.createAndDeliver({
      userId: user._id,
      title,
      message,
      type: 'reminder',
      metadata: {
        bookingId: booking._id,
        reminderType,
        ...(booking.type === 'tour' ? { tourId: resource?._id } : { hotelId: resource?._id }),
        status: booking.status
      },
      isImportant: reminderType === '1day', // ngày mai thì đánh dấu quan trọng
      sendEmail: false // đã gửi ở trên rồi, không gửi lại
    });

    // 3) Cập nhật booking.reminders để tránh gửi lại
    booking.reminders.push({ type: reminderType, sentAt: new Date() });
    booking.reminderSent = true;
    await booking.save();

    console.log(`[Reminder] ✅ Hoàn tất reminder "${reminderType}" cho booking ${booking._id}`);
  } catch (err) {
    console.error(`[Reminder] ❌ Lỗi xử lý booking ${booking._id}:`, err);
  }
};

// ─────────────────────────────────────────────
//  Main: quét bookings và gửi reminder
// ─────────────────────────────────────────────
const runReminderJob = async () => {
  console.log(`[Reminder] 🕗 Cron job khởi chạy lúc ${new Date().toLocaleString('vi-VN')}`);

  try {
    const now = new Date();

    // Tính mốc thời gian: đầu và cuối ngày cách "ngày mai" / "3 ngày nữa"
    const makeRange = (daysOffset) => {
      const start = new Date(now);
      start.setDate(start.getDate() + daysOffset);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    const { start: start3d, end: end3d } = makeRange(3);
    const { start: start1d, end: end1d } = makeRange(1);

    // Lấy tất cả booking đủ điều kiện cơ bản
    const eligibleBookings = await Booking.find({
      status: 'Confirmed',
      paymentStatus: 'Paid',
      startDate: { $gte: start1d, $lte: end3d } // nằm trong khoảng từ ngày mai đến 3 ngày nữa
    }).lean(false); // không lean vì cần save()

    console.log(`[Reminder] 📋 Tìm thấy ${eligibleBookings.length} booking đủ điều kiện`);

    for (const booking of eligibleBookings) {
      const startDay = new Date(booking.startDate);
      startDay.setHours(0, 0, 0, 0);

      // Kiểm tra loại reminder '3days'
      const is3Days = startDay >= start3d && startDay <= end3d;
      const alreadySent3d = booking.reminders?.some(r => r.type === '3days');
      if (is3Days && !alreadySent3d) {
        await sendReminderForBooking(booking, '3days');
      }

      // Kiểm tra loại reminder '1day'
      const is1Day = startDay >= start1d && startDay <= end1d;
      const alreadySent1d = booking.reminders?.some(r => r.type === '1day');
      if (is1Day && !alreadySent1d) {
        await sendReminderForBooking(booking, '1day');
      }
    }

    console.log(`[Reminder] 🏁 Cron job hoàn tất`);
  } catch (err) {
    console.error('[Reminder] ❌ Lỗi cron job:', err);
  }
};

// ─────────────────────────────────────────────
//  Export: khởi động cron job
//  Gọi scheduleReminderJob() từ server.js
// ─────────────────────────────────────────────
module.exports.scheduleReminderJob = () => {
  // Chạy mỗi ngày lúc 08:00 sáng (giờ server)
  cron.schedule('0 8 * * *', runReminderJob, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
  console.log('[Reminder] ✅ Cron job đã được lên lịch: 08:00 mỗi ngày (Asia/Ho_Chi_Minh)');
};

// Export để có thể gọi thủ công khi test
module.exports.runReminderJob = runReminderJob;
