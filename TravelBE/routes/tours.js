const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const admin = require('../middlewares/admin');

const tourCtrl = require('../controllers/tourController');

// Public list & detail
router.get('/', tourCtrl.listTours);
router.get('/admin', auth(['admin']), tourCtrl.getAllTours);
router.get('/:id', tourCtrl.getTour);

// Admin-only routes
router.post('/', auth(['admin']), upload.array('images', 6), tourCtrl.createTour);
router.put('/:id', auth(['admin']), upload.array('images', 6), tourCtrl.updateTour);
router.delete('/:id', auth(['admin']), tourCtrl.deleteTour);

// after other imports
router.put('/:id/hotel', auth(), admin, tourCtrl.attachHotelToTour);
router.put('/:id/guide', auth(['admin']), tourCtrl.assignGuideToTour);
router.put('/:id/vehicle', auth(['admin']), tourCtrl.assignVehicleToTour);

module.exports = router;