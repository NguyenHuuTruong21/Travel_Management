const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const reportCtrl = require('../controllers/reportController');

router.get('/revenue', auth(['admin']), reportCtrl.getRevenueReport);
router.get('/customers', auth(['admin']), reportCtrl.getCustomerReport);
router.get('/services', auth(['admin']), reportCtrl.getServiceDistribution);

module.exports = router;
