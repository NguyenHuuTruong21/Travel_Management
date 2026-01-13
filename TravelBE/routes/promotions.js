const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

// Public Route
router.get('/public', cmsController.getPublicPromotions);
router.post('/check', cmsController.checkPromotion);

module.exports = router;
