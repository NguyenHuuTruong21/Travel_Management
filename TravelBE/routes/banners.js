const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

router.get('/', cmsController.getBanners);

module.exports = router;
