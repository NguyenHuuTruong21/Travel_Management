const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// Yêu cầu quyền admin cho các routes thống kê doanh thu
const requireAdmin = [auth(), admin];

// API: Doanh thu theo thời gian
router.get('/revenue-by-time', requireAdmin, statsController.getRevenueByTime);

// API: Doanh thu theo loại cấu trúc dịch vụ
router.get('/revenue-by-type', requireAdmin, statsController.getRevenueByType);

// API: Doanh thu theo khu vực
router.get('/revenue-by-location', requireAdmin, statsController.getRevenueByLocation);

// API: Thống kê tăng trưởng User
router.get('/user-growth', requireAdmin, statsController.getUserGrowth);

// API: Thống kê hành vi User
router.get('/user-behavior', requireAdmin, statsController.getUserBehavior);

// API: Top Tours (Dùng $sort và $limit)
router.get('/top-tours', requireAdmin, statsController.getTopTours);

// API: So sánh tăng trưởng theo tháng ($facet)
router.get('/mom-comparison', requireAdmin, statsController.getMoMComparison);

// API: Lấy số liệu tổng quát cho Dashboard
router.get('/summary', requireAdmin, statsController.getSummaryStats);

// API để client ghi nhận hành vi. Mở cho tất cả mọi người hoặc user đăng nhập
// Sử dụng auth() middleware tuỳ chỉnh không bắt buộc lỗi để decode token nếu có
const optionalAuth = (req, res, next) => {
    auth()(req, res, (err) => {
        if (err) req.user = null; // Bỏ qua lỗi authenticate, cho là khách vãng lai
        next();
    });
};
router.post('/interactions', optionalAuth, statsController.logInteraction);

module.exports = router;
