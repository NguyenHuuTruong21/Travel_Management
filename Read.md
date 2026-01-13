# Tài liệu chi tiết Chức năng hệ thống TravelManagement

Tài liệu này cung cấp giải thích chi tiết về luồng hoạt động, cấu trúc dữ liệu và logic xử lý của 5 nhóm chức năng chính trong dự án.

## 1. Chức năng Đăng ký, Đăng nhập (Authentication)

### Mô tả chi tiết
Hệ thống sử dụng cơ chế **JWT (JSON Web Token)** để xác thực người dùng. Quy trình bảo mật bao gồm không lưu mật khẩu thô mà sử dụng thư viện `bcrypt` để băm mật khẩu trước khi lưu vào cơ sở dữ liệu.
- **Access Token**: Dùng để truy cập các API được bảo vệ, có thời hạn ngắn (ví dụ: 15 phút).
- **Refresh Token**: Dùng để lấy Access Token mới khi cái cũ hết hạn, có thời hạn dài (ví dụ: 7 ngày), được lưu an toàn trong database.

### Luồng xử lý dữ liệu (Flow)
1. **Đăng ký (Frontend -> Backend)**
   - Người dùng nhập thông tin tại `RegisterPage.jsx`.
   - Backend (`authController.register`) nhận dữ liệu, kiểm tra trùng lặp email/username.
   - Tạo một `verificationToken` duy nhất.
   - Gửi email chứa link kích hoạt tới email người dùng.
   - Tài khoản được tạo với trạng thái ban đầu là `inactive`.
2. **Kích hoạt tài khoản**
   - Người dùng click vào link trong email.
   - Backend đổi trạng thái tài khoản sang `active`.
3. **Đăng nhập**
   - Người dùng nhập email/pass. Backend so sánh password hash.
   - Nếu đúng: Server trả về chuỗi `accessToken` và `refreshToken`. Frontend lưu `accessToken` (thường là memory/localStorage) để gửi kèm trong header các request sau (`Authorization: Bearer <token>`).

### Code Backend minh họa (`controllers/authController.js`)
Đoạn code dưới đây xử lý logic đăng ký, bao gồm validate dữ liệu và gửi email xác thực:
```javascript
// Trích xuất từ authController.js
exports.register = async (req, res) => {
  try {
    const { username, fullName, email, password, agreedToTerms } = req.body;

    // 1. Kiểm tra đầu vào
    if (!agreedToTerms) return res.status(400).json({ message: "Bạn phải đồng ý điều khoản" });
    const existEmail = await User.findOne({ email });
    if (existEmail) return res.status(400).json({ message: "Email đã tồn tại!" });

    // 2. Tạo token xác thực ngẫu nhiên
    const verificationToken = uuidv4();

    // 3. Hash mật khẩu (tự động trong Model thông qua pre-save hook)
    const user = new User({
      username, fullName, email, password,
      verificationToken,
      status: "inactive" // Mặc định chưa kích hoạt
    });
    
    // 4. Lưu vào Database
    await user.save();

    // 5. Gửi email xác thực
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;
    await sendMail(email, "Xác thực tài khoản", `<a href="${link}">Kích hoạt</a>`);
    
    res.json({ message: "Đăng ký thành công. Vui lòng kiểm tra email." });
  } catch (err) { /* xử lý lỗi */ }
};
```

---

## 2.3.2. Chức năng quản lý tour du lịch và đặt tour

### Mô tả chức năng
Chức năng quản lý tour du lịch và đặt tour là chức năng trung tâm của hệ thống, cho phép khách hàng tìm kiếm và đặt các tour du lịch, đồng thời hỗ trợ quản trị viên quản lý toàn bộ thông tin tour và đơn đặt tour.
Chức năng này được chia thành hai nhóm chính:
• **Đối với User**: xem danh sách tour, xem chi tiết tour và thực hiện đặt tour.
• **Đối với Admin**: quản lý tour (thêm, sửa, xóa, cập nhật trạng thái) và quản lý các đơn đặt tour.

### Thực hiện chức năng

#### 1. Xem danh sách tour du lịch
• Hệ thống hiển thị danh sách các tour đang mở bán tại trang `ToursPage.jsx`.
• Mỗi tour bao gồm các thông tin cơ bản: Tên tour, Địa điểm, Thời gian, Giá tour, Số chỗ còn lại, Hình ảnh đại diện.
• Người dùng có thể:
    o Tìm kiếm tour theo tên hoặc địa điểm.
    o Lọc tour theo giá (min/max), loại hình (trong nước/quốc tế).

#### 2. Xem chi tiết tour
Khi chọn một tour cụ thể, người dùng được chuyển đến trang Chi tiết tour (`TourDetailPage.jsx`), hiển thị đầy đủ thông tin:
• Mô tả chi tiết tour, Lịch trình (itinerary theo ngày).
• Thông tin khách sạn, phương tiện, hướng dẫn viên đi kèm.
• Giá tour và các dịch vụ.
• Số chỗ còn lại (Tính toán realtime: `capacity - bookedSeats`).

#### 3. Đặt tour du lịch
1. Người dùng nhấn nút **Đặt tour** tại trang chi tiết => chuyển tới `BookingPage.jsx`.
2. Nhập thông tin: Số lượng người, Thông tin liên hệ, Phương thức thanh toán.
3. **Backend xử lý (`bookingController.js`)**:
    o Sử dụng **MongoDB Transaction** để đảm bảo tính nhất quán dữ liệu.
    o Kiểm tra số chỗ còn lại (`quantity > remaining` -> rollback).
    o Tính tổng giá tiền (áp dụng mã giảm giá nếu có).
    o Tạo đơn booking với trạng thái `Pending`.
    o Cập nhật số chỗ đã đặt (`bookedSeats`) của Tour.
4. **Hệ thống gửi**:
    o Thông báo real-time qua Socket.io tới người dùng ("Đặt tour thành công").
    o Email xác nhận đơn hàng.

**Code Transaction Minh Họa (Booking Controller):**
```javascript
exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { tourId, quantity } = req.body;

    // 1. Kiểm tra Tour và lock document trong session
    const tour = await Tour.findById(tourId).session(session);
    
    // 2. Kiểm tra chỗ trống
    const remaining = (tour.capacity || 0) - (tour.bookedSeats || 0);
    if (quantity > remaining) {
      throw new Error('Số lượng vượt quá chỗ trống.');
    }

    // 3. Cập nhật số chỗ (tăng bookedSeats)
    tour.bookedSeats += Number(quantity);
    await tour.save({ session });

    // 4. Tạo Booking
    const booking = await Booking.create([{
        user: req.user.id,
        tour: tourId,
        quantity,
        totalPrice: tour.price * quantity,
        status: 'Pending'
    }], { session });

    // 5. Commit transaction (Lưu tất cả thay đổi)
    await session.commitTransaction();
    
    // 6. Gửi thông báo (ngoài transaction block)
    notification.createAndDeliver({ ... });

    res.status(201).json(booking[0]);
  } catch (err) {
    await session.abortTransaction(); // Rollback nếu lỗi
    next(err);
  } finally {
    session.endSession();
  }
};
```

#### 4. Quản lý tour du lịch (CRUD - Admin)
Quản trị viên có quyền CRUD đối với tour du lịch thông qua API `tourController.js`:
• **Thêm tour mới**: Upload ảnh, nhập JSON lịch trình, gán Guide/Hotel/Vehicle.
• **Chỉnh sửa**: Cập nhật giá, trạng thái (active/inactive).
• **Xóa tour**: Có logic kiểm tra ràng buộc - chỉ cho phép xóa tour chưa có booking nào để đảm bảo lịch sử dữ liệu.

#### 5. Quản lý đặt tour (Booking Management - Admin)
Admin quản lý trạng thái các đơn hàng:
• **Danh sách booking**: Xem tất cả đơn, lọc theo trạng thái.
• **Thao tác**: Xác nhận (Confirm) hoặc Hủy (Cancel).
• **Logic Backend**:
    o Khi Admin **Hủy** đơn: Hệ thống tự động hoàn lại số chỗ (`bookedSeats`) cho Tour tương ứng.
    o Gửi thông báo real-time cho khách hàng biết lý do hủy.

```javascript
// Logic Admin cập nhật trạng thái đơn (bookingController.js)
exports.adminUpdateStatus = async (req, res, next) => {
    // ... start transaction ...
    if (status === 'Cancelled' && booking.status !== 'Cancelled') {
      // Hoàn lại chỗ cho Tour
      const tour = await Tour.findById(booking.tour).session(session);
      tour.bookedSeats -= booking.quantity;
      await tour.save({ session });
    }
    booking.status = status;
    await booking.save({ session });
    // ... commit transaction ...
};
```

---

## 3. Chức năng Thông báo thời gian thực (Real-time Notification)

### Mô tả chi tiết
Hệ thống sử dụng **WebSocket (Socket.IO)** để tạo kênh giao tiếp hai chiều giữa Server và Client. 
- Khi có sự kiện (ví dụ: Tour được xác nhận), Server "emit" (phát) một tin nhắn tới đúng `socketId` hoặc `room` của người dùng đó.
- Frontend lắng nghe sự kiện này và hiển thị popup thông báo ngay lập tức mà không cần F5 trang.

### Cơ chế hoạt động (`utils/notification.js`)
Đây là module tiện ích giúp gửi thông báo đa kênh (vừa lưu DB, vừa gửi Socket, vừa gửi Email).

```javascript
// Hàm tiện ích: Vừa lưu DB, vừa gửi Realtime
module.exports.createAndDeliver = async ({ userId, title, message }) => {
    // 1. Lưu vào Database để xem lại lịch sử
    const notif = await Notification.create({ user: userId, title, message });

    // 2. Phát sự kiện realtime tới "room" riêng của user đó
    // Client nào login với userId này sẽ join room `user:<userId>`
    module.exports.emitToUser(userId, 'notification', {
      title: notif.title,
      message: notif.message,
      createdAt: notif.createdAt
    });

    return notif;
};
```
Logic này đảm bảo người dùng dù offline lúc sự kiện xảy ra thì khi online vẫn xem được trong danh sách thông báo (do đã lưu DB), còn nếu online thì nhận được ngay lập tức.

---

## 4. Chức năng Quản lý Nội dung và Khuyến mãi

### Mô tả chi tiết
Admin quản lý nội dung tĩnh (Bài viết - Post) và chiến dịch marketing (Mã giảm giá - Promotion).
- **Promotion**: Logic phức tạp nhất nằm ở việc kiểm tra tính hợp lệ của mã giảm giá:
    - Thời gian: Ngày hiện tại phải nằm trong khoảng `startDate` - `endDate`.
    - Số lượng: Số lần dùng (`usedCount`) chưa vượt quá giới hạn (`usageLimit`).
    - Phạm vi: Mã chỉ áp dụng cho một số Tour nhất định.

### Logic kiểm tra mã giảm giá (`controllers/cmsController.js`)
Hàm `checkPromotion` được gọi khi người dùng nhập mã ở bước thanh toán:

```javascript
exports.checkPromotion = async (req, res, next) => {
    try {
        const { code, tourId, totalAmount } = req.body;
        
        // 1. Tìm mã trong DB
        const promo = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });
        if (!promo) return res.status(404).json({ message: "Mã không hợp lệ" });

        // 2. Kiểm tra ngày hiệu lực
        const now = new Date();
        if (promo.startDate > now || promo.endDate < now) {
            return res.status(400).json({ message: "Mã đã hết hạn hoặc chưa bắt đầu" });
        }

        // 3. Kiểm tra mã này có áp dụng cho tour hiện tại không
        if (promo.applicableTours?.length > 0 && !promo.applicableTours.includes(tourId)) {
            return res.status(400).json({ message: "Mã không áp dụng cho tour này" });
        }

        // 4. Tính toán số tiền giảm
        let discount = (promo.discountType === 'percent') 
            ? (totalAmount * promo.discountValue) / 100 
            : promo.discountValue;

        res.json({ valid: true, discountAmount: discount });
    } catch (err) { next(err); }
};
```

---

## 5. Chức năng Thống kê và Báo cáo

### Mô tả chi tiết
Dành cho Admin Dashboard để ra quyết định kinh doanh. Thay vì tải toàn bộ dữ liệu về Frontend rồi tính toán (rất chậm), hệ thống sử dụng **MongoDB Aggregation Framework** để tính toán trực tiếp từ phía Database Server.
- Các chỉ số quan trọng: Tổng doanh thu, số lượng booking theo thời gian, tour bán chạy nhất.

### Logic báo cáo (`controllers/reportController.js`)
Ví dụ về việc tính tổng doanh thu và vẽ biểu đồ doanh thu theo ngày:

```javascript
exports.getRevenueReport = async (req, res, next) => {
    // 1. Pipeline tính tổng doanh thu toàn thời gian
    const overallStats = await Booking.aggregate([
      { $match: { status: 'Confirmed' } }, // Chỉ tính đơn đã xác nhận
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }, // Cộng dồn cột totalPrice
          totalBookings: { $sum: 1 }             // Đếm số dòng
        }
      }
    ]);

    // 2. Pipeline nhóm doanh thu theo ngày (để vẽ biểu đồ)
    const revenueOverTime = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Nhóm theo ngày tạo
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } } // Sắp xếp ngày tăng dần
    ]);

    res.json({
        totalRevenue: overallStats[0]?.totalRevenue || 0,
        revenueOverTime
    });
};
```
Cách tiếp cận này tối ưu hiệu suất, đặc biệt khi dữ liệu lên tới hàng nghìn đơn hàng, vì việc tính toán do Database Engine xử lý.
