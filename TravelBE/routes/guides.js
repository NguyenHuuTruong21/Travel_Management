const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const uploadGuide = require('../middlewares/uploadGuide');
const guideCtrl = require('../controllers/guideController');

// Admin-only routes
router.post('/', auth(['admin']), uploadGuide.single('avatar'), guideCtrl.createGuide);
router.put('/:id', auth(['admin']), uploadGuide.single('avatar'), guideCtrl.updateGuide);
router.delete('/:id', auth(['admin']), guideCtrl.deleteGuide);
router.get('/', auth(['admin']), guideCtrl.listGuides);

// Schedule management (Admin)
router.get('/:id/schedule', auth(['admin']), guideCtrl.getGuideSchedule);
router.put('/:id/schedule', auth(['admin']), guideCtrl.updateGuideSchedule);

// Public route - get single guide (for display in tour details)
router.get('/:id', guideCtrl.getGuide);

module.exports = router;

