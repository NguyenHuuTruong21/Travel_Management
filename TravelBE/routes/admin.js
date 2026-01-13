const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const settingController = require('../controllers/settingController');
const cmsController = require('../controllers/cmsController');

// Ensure admin authentication for all routes
router.use(auth(['admin']));

/* ------------------------------
   USER MANAGEMENT
------------------------------ */
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);

/* ------------------------------
   SYSTEM LOGS
------------------------------ */
router.get('/logs', adminController.getSystemLogs);

/* ------------------------------
   SETTINGS
------------------------------ */
router.get('/settings', settingController.getSettings);
router.put('/settings', settingController.updateSetting);

/* ------------------------------
   CMS - BANNERS
------------------------------ */
router.get('/banners', cmsController.getBanners);
router.post('/banners', cmsController.createBanner);
router.put('/banners/:id', cmsController.updateBanner);
router.delete('/banners/:id', cmsController.deleteBanner);

/* ------------------------------
   CMS - POSTS
------------------------------ */
router.get('/posts', cmsController.getPosts);
router.post('/posts', cmsController.createPost);
router.put('/posts/:id', cmsController.updatePost);
router.delete('/posts/:id', cmsController.deletePost);

/* ------------------------------
   CMS - PROMOTIONS
------------------------------ */
router.get('/promotions', cmsController.getPromotions);
router.post('/promotions', cmsController.createPromotion);
router.put('/promotions/:id', cmsController.updatePromotion);
router.delete('/promotions/:id', cmsController.deletePromotion);

/* ------------------------------
   REVIEWS
------------------------------ */
const reviewController = require('../controllers/reviewController');
router.get('/reviews', reviewController.getAllReviews);

module.exports = router;
