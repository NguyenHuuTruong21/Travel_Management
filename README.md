# HỆ THỐNG QUẢN LÝ DU LỊCH VÀ DỊCH VỤ TRỰC TUYẾN (TRAVEL MANAGEMENT)

Tài liệu kỹ thuật chi tiết mô tả kiến trúc, chức năng, API và giao diện của hệ thống.

---

## MỤC LỤC
1. [Tổng quan Module](#modules)
2. [Chi tiết từng Chức năng](#details)
   - [Authentication (Xác thực)](#auth)
   - [Tours (Quản lý Tour)](#tours)
   - [Bookings (Đặt dịch vụ)](#bookings)
   - [Hotels & Vehicles (Khách sạn & Xe)](#services)
   - [Promotion & CMS (Khuyến mãi & Nội dung)](#cms)
   - [Contact & Support (Liên hệ)](#contact)
   - [Reports (Báo cáo)](#reports)
3. [Cấu trúc Database](#db)

---

<a name="modules"></a>
## 1. TỔNG QUAN MODULE
Hệ thống được chia thành các module chức năng chính. Mỗi module bao gồm:
- **Model**: Cấu trúc dữ liệu MongoDB.
- **Controller**: Logic xử lý nghiệp vụ.
- **Routes**: Định nghĩa API Endpoints.
- **Frontend UI**: Các trang giao diện người dùng tương ứng.

---

<a name="details"></a>
## 2. CHI TIẾT TỪNG CHỨC NĂNG

<a name="auth"></a>
### A. AUTHENTICATION (XÁC THỰC NGƯỜI DÙNG)
Quản lý đăng ký, đăng nhập và phân quyền (User/Admin).

*   **Model**: `User.js` (fullName, email, password, roles, phone, address).
*   **Controller**: `authController.js`.
*   **Middleware**: `authMiddleware.js` (Verify Token, Check Admin Role).
*   **Routes**: `/api/auth`.

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend (React) | Component/Page |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Đăng ký** | `POST` | `/register` | Public | `RegisterPage.jsx` | Form đăng ký |
| **Đăng nhập** | `POST` | `/login` | Public | `LoginPage.jsx` | Form đăng nhập |
| **Lấy Profile** | `GET` | `/profile` | User | `ProfilePage.jsx` | Tab "Hồ sơ" |
| **Sửa Profile** | `PUT` | `/profile` | User | `ProfilePage.jsx` | Form cập nhật |
| **Quản lý User**| `GET` | `/api/admin/users` | Admin | `UsersList.jsx` | Danh sách User (Admin) |

---

<a name="tours"></a>
### B. TOURS (QUẢN LÝ TOUR DU LỊCH)
Core feature của hệ thống. Quản lý danh sách tour, tìm kiếm và chi tiết.

*   **Model**: `Tour.js` (name, price, itinerary, images, startLocation, capacity...).
*   **Controller**: `tourController.js`.
*   **Routes**: `/api/tours`.

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **Lấy DS Tour** | `GET` | `/public` (có query filter) | Public | `ToursPage.jsx` |
| **Tour Nổi bật**| `GET` | `/public/featured` | Public | `Home.jsx` (Section Featured) |
| **Chi tiết Tour**| `GET` | `/public/:id` | Public | `TourDetailPage.jsx` |
| **Tạo Tour** | `POST` | `/` | Admin | `TourForm.jsx` |
| **Sửa Tour** | `PUT` | `/:id` | Admin | `TourForm.jsx` |
| **Xóa Tour** | `DELETE`| `/:id` | Admin | `ToursList.jsx` |

---

<a name="bookings"></a>
### C. BOOKINGS (ĐẶT TOUR & DỊCH VỤ)
Xử lý giao dịch đặt chỗ, thanh toán và xử lý đơn hàng.

*   **Model**: `Booking.js` (user, tour, quantity, totalPrice, status, timeline, promotionCode).
*   **Controller**: `bookingController.js`.
*   **Utils**: `notification.js` (Gửi thông báo), `paymentMock.js` (Giả lập thanh toán).
*   **Routes**: `/api/bookings`.

**Luồng xử lý (Flow):** User tạo booking -> Server kiểm tra chỗ trống & tính tiền -> Lưu DB (Pending) -> User thanh toán -> Update Status (Confirmed).

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **Tạo Booking** | `POST` | `/` | User | `BookingPage.jsx` |
| **Lịch sử Đặt** | `GET` | `/my-bookings` | User | `ProfilePage.jsx` (Tab History)|
| **Chi tiết Đơn**| `GET` | `/:id` | User | `BookingPage.jsx` (Success Step)|
| **Thanh toán** | `POST` | `/:id/pay` | User | `BookingPage.jsx` (Step 2) |
| **DS Đơn (Admin)**| `GET` | `/admin` | Admin | `BookingsList.jsx` |
| **Duyệt/Hủy Đơn**| `PUT` | `/:id/status` | Admin | `BookingsList.jsx` (Modal) |

---

<a name="services"></a>
### D. HOTELS, VEHICLES & GUIDES (DỊCH VỤ BỔ TRỢ)
Quản lý các tài nguyên dịch vụ khác ngoài Tour.

*   **Models**: `Hotel.js`, `Vehicle.js`, `Guide.js`.
*   **Controllers**: `hotelController.js`, `vehicleController.js`, `guideController.js`.
*   **Routes**: `/api/hotels`, `/api/vehicles`, `/api/guides`.

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **DS Khách sạn**| `GET` | `/api/hotels/public` | Public | `HotelsPage.jsx` |
| **DS Xe** | `GET` | `/api/vehicles/public` | Public | `ServicesPage.jsx` (Tab Xe) |
| **Quản lý KS** | `CRUD` | `/api/hotels` | Admin | `HotelsList.jsx`, `HotelForm.jsx`|
| **Quản lý Xe** | `CRUD` | `/api/vehicles` | Admin | `VehiclesList.jsx`, `VehicleForm.jsx`|
| **Quản lý HDV** | `CRUD` | `/api/guides` | Admin | `GuidesList.jsx`, `GuideForm.jsx`|

---

<a name="cms"></a>
### E. PROMOTION & CMS (KHUYẾN MÃI & NỘI DUNG)
Quản lý mã giảm giá, bài viết tin tức và banner trang chủ.

*   **Models**: `Promotion.js`, `Post.js`, `Banner.js`.
*   **Controllers**: `cmsController.js`.
*   **Routes**: `/api/promotions`, `/api/posts`, `/api/banners`.

**Chức năng Khuyến mãi (Promotion System):**
- Mã giảm giá được lưu với giới hạn thời gian và số lượt dùng.
- Khi user nhập code tại `BookingPage`, API `/check` sẽ validation và trả về số tiền giảm.
- Khi tạo booking, `bookingController` sẽ trừ lượt sử dụng của mã.

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **Check Mã** | `POST` | `/api/promotions/check` | User | `BookingPage.jsx` |
| **DS KM (Public)**| `GET` | `/api/promotions/public`| Public | `Home.jsx`, `ServicesPage.jsx` |
| **QL Khuyến Mãi**| `CRUD` | `/api/promotions` | Admin | `Promotions.jsx` |
| **QL Tin Tức** | `CRUD` | `/api/posts` | Admin | `Posts.jsx` |
| **QL Banner** | `CRUD` | `/api/banners` | Admin | `Banners.jsx` |

---

<a name="contact"></a>
### F. CONTACT & SUPPORT (LIÊN HỆ)
Hệ thống form liên hệ và đặt xe theo yêu cầu.

*   **Model**: `Contact.js`.
*   **Controller**: `contactController.js`.
*   **Routes**: `/api/contacts`.

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **Gửi Liên hệ** | `POST` | `/` | Public | `ContactPage.jsx` |
| **Thuê xe** | `POST` | `/` (type='rental') | User | `ServicesPage.jsx` (Modal) |
| **DS Liên hệ** | `GET` | `/` | Admin | `ContactsList.jsx` |
| **Trả lời** | `PUT` | `/:id` | Admin | `ContactsList.jsx` (Modal Reply)|

---

<a name="reports"></a>
### G. REPORTS (BÁO CÁO THỐNG KÊ)
Hệ thống báo cáo dành cho quản trị viên.

*   **Controller**: `reportController.js`.
*   **Routes**: `/api/reports`.

**Chi tiết API & Giao diện:**

| Chức năng | Method | Endpoint Backend | Role | Giao diện Frontend |
| :--- | :--- | :--- | :--- | :--- |
| **Báo cáo Doanh thu**| `GET` | `/revenue` | Admin | `RevenueReport.jsx` (Chart+Table)|
| **Báo cáo Khách** | `GET` | `/customers` | Admin | `CustomerReport.jsx` |
| **Báo cáo Dịch vụ** | `GET` | `/services` | Admin | `ServiceReport.jsx` |

---

## 3. REAL-TIME NOTIFICATION (THÔNG BÁO)
Sử dụng **Socket.io** để đẩy thông báo thời gian thực.
*   **Server**: `config/socket.js`, `utils/notification.js`.
*   **Client**: `SocketContext.js`, `NotificationDropdown.jsx`.
*   **Events**:
    - `booking`: Khi đơn hàng thay đổi trạng thái.
    - `contact`: Khi admin trả lời liên hệ.
    - system`: Thông báo hệ thống.

---

## 4. HƯỚNG DẪN CÀI ĐẶT
*(Xem phần Cài đặt ở file Dashboard hoặc source code)*

### Backend (`/TravelBE`)
- Chạy: `npm start` (Port 5000)
- Env: `MONGO_URI`, `JWT_SECRET`, `PORT`.

### Frontend (`/TravelUI/frontend`)
- Chạy: `npm run dev` (Vite - Port 3000)
- Env: `VITE_API_URL` (Mặc định: http://localhost:5000/api)


Name: Nguyễn Hữu Trường
