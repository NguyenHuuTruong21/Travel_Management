const express = require('express');
const router = express.Router();
const authFactory = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const upload = require('../middlewares/upload');
const hotelCtrl = require('../controllers/hotelController');

const auth = authFactory();

// Public
router.get('/', hotelCtrl.listHotels);
router.get('/:id', hotelCtrl.getHotel);

// Admin
router.post('/', auth, admin, upload.array('images', 6), hotelCtrl.createHotel);
router.put('/:id', auth, admin, upload.array('images', 6), hotelCtrl.updateHotel);
router.delete('/:id', auth, admin, hotelCtrl.deleteHotel);

module.exports = router;