const express = require('express');
const router = express.Router();

const authFactory = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const upload = require('../middlewares/uploadHotel'); // middleware multer specific for hotels
const hotelCtrl = require('../controllers/hotelController');

const auth = authFactory();

/* ------------------------------
   PUBLIC ROUTES
------------------------------ */
router.get('/', hotelCtrl.listHotels);   // Danh sách khách sạn
router.get('/:id', hotelCtrl.getHotel);  // Chi tiết khách sạn

/* ------------------------------
   ADMIN ROUTES
------------------------------ */
router.post(
  '/',
  auth,                 // Xác thực token
  admin,                // Kiểm tra role admin
  upload.array('images', 6), // Upload tối đa 6 ảnh
  hotelCtrl.createHotel
);

router.put(
  '/:id',
  auth,
  admin,
  upload.array('images', 6),
  hotelCtrl.updateHotel
);

router.delete(
  '/:id',
  auth,
  admin,
  hotelCtrl.deleteHotel
);

module.exports = router;
