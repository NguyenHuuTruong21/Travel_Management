const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const uploadVehicle = require('../middlewares/uploadVehicle');
const vehicleCtrl = require('../controllers/vehicleController');

router.post('/', auth(['admin']), uploadVehicle.single('image'), vehicleCtrl.createVehicle);
router.put('/:id', auth(['admin']), uploadVehicle.single('image'), vehicleCtrl.updateVehicle);
router.delete('/:id', auth(['admin']), vehicleCtrl.deleteVehicle);
router.get('/', auth(['admin']), vehicleCtrl.listVehicles);

module.exports = router;

