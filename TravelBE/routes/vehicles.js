const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');        // middleware xác thực user & roles
const uploadVehicle = require('../middlewares/uploadVehicle'); // middleware upload hình
const vehicleCtrl = require('../controllers/vehicleController');

/* ------------------------------
   VEHICLE MANAGEMENT (ADMIN)
------------------------------ */

// Create Vehicle
router.post(
  '/',
  auth(['admin']),
  uploadVehicle.single('image'),
  vehicleCtrl.createVehicle
);

// Update Vehicle
router.put(
  '/:id',
  auth(['admin']),
  uploadVehicle.single('image'),
  vehicleCtrl.updateVehicle
);

// Delete Vehicle
router.delete(
  '/:id',
  auth(['admin']),
  vehicleCtrl.deleteVehicle
);

// List Vehicles
router.get(
  '/',
  auth(['admin']),
  vehicleCtrl.listVehicles
);

// Public Route
router.get('/public', vehicleCtrl.getPublicVehicles);

// Get Single Vehicle (Admin)
router.get('/:id', auth(['admin']), vehicleCtrl.getVehicle);

module.exports = router;
