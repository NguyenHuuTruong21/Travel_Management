const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/paymentController');

// Tạo thanh toán (User đã đăng nhập)
router.post('/create', auth(), ctrl.createPayment);

// Callback từ simulated payment (GET - không cần auth vì redirect từ trang thanh toán)
router.get('/simulate/callback', ctrl.simulateCallback);

// Lấy trạng thái thanh toán theo bookingId
router.get('/status/:bookingId', auth(), ctrl.getPaymentStatus);

module.exports = router;