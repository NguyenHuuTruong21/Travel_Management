const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const uploadGuide = require('../middlewares/uploadGuide');
const guideCtrl = require('../controllers/guideController');

/* ------------------------------
   ADMIN ROUTES (Require admin role)
------------------------------ */
router.post(
   '/',
   auth(['admin']),
   uploadGuide.single('avatar'),
   guideCtrl.createGuide
);

router.put(
   '/:id',
   auth(['admin']),
   uploadGuide.single('avatar'),
   guideCtrl.updateGuide
);

router.delete('/:id', auth(['admin']), guideCtrl.deleteGuide);

router.get('/', auth(['admin']), guideCtrl.listGuides);

/* ------------------------------
   SCHEDULE MANAGEMENT (Admin)
------------------------------ */
router.get('/:id/schedule', auth(['admin']), guideCtrl.getGuideSchedule);
router.put('/:id/schedule', auth(['admin']), guideCtrl.updateGuideSchedule);

router.get('/public', guideCtrl.getPublicGuides);

/* ------------------------------
   PUBLIC ROUTE - GET SINGLE GUIDE
------------------------------ */
router.get('/:id', guideCtrl.getGuide);


module.exports = router;
