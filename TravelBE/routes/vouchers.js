const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/voucherController');

// ─── PUBLIC / USER ROUTES ────────────────────────────────────────────
// Áp dụng voucher (preview discount, chưa trừ count)
router.post('/apply', auth(), ctrl.applyVoucher);

// Gợi ý voucher phù hợp
router.get('/public/suggest', auth(), ctrl.suggestVouchers);

// ─── ADMIN ROUTES ────────────────────────────────────────────────────
// CRUD Voucher
router.get('/', auth(['admin']), ctrl.getVouchers);
router.get('/usage', auth(['admin']), ctrl.getUsageHistory);
router.get('/:id', auth(['admin']), ctrl.getVoucherById);
router.post('/', auth(['admin']), ctrl.createVoucher);
router.put('/:id', auth(['admin']), ctrl.updateVoucher);
router.delete('/:id', auth(['admin']), ctrl.deleteVoucher);

module.exports = router;
