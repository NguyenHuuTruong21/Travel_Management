const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middlewares/auth');

// Optional Auth (Decode if exists, ignore if err format)
const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }

    // Nếu có token, cố gắng chạy auth middleware
    auth()(req, res, () => {
        // Next được gọi khi token hợp lệ
        next();
    });
};

// Route Gợi ý Tours mới
router.get('/tours', optionalAuth, recommendationController.getRecommendations);

module.exports = router;
