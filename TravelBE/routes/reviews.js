const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const uploadReview = require('../middlewares/uploadReview');
const reviewCtrl = require('../controllers/reviewController');

router.post('/', auth(), uploadReview.array('images', 5), reviewCtrl.createReview);
router.get('/tour/:id', reviewCtrl.listReviewsByTour);

module.exports = router;

