const mongoose = require('mongoose');
const Banner = require('../models/Banner');
const Post = require('../models/Post');
const Promotion = require('../models/Promotion');

// Helper: check ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- BANNERS ---
exports.getBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
        res.json({ data: banners });
    } catch (err) { next(err); }
};

exports.createBanner = async (req, res, next) => {
    try {
        if (!req.body.title || !req.body.image) {
            return res.status(400).json({ message: "Thiếu title hoặc image" });
        }
        const banner = await Banner.create(req.body);
        res.status(201).json({ banner });
    } catch (err) { next(err); }
};

exports.updateBanner = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!isValidObjectId(id))
            return res.status(400).json({ message: "ID không hợp lệ" });
        const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!banner)
            return res.status(404).json({ message: "Banner không tồn tại" });
        res.json({ banner });
    } catch (err) { next(err); }
};

exports.deleteBanner = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!isValidObjectId(id))
            return res.status(400).json({ message: "ID không hợp lệ" });
        const banner = await Banner.findByIdAndDelete(id);
        if (!banner)
            return res.status(404).json({ message: "Banner không tồn tại" });
        res.json({ message: 'Banner deleted' });
    } catch (err) { next(err); }
};

// --- POSTS ---
exports.getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().populate('author', 'fullName');
        res.json({ data: posts });
    } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
    try {
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({ message: "Thiếu title hoặc content" });
        }
        const post = await Post.create({ ...req.body, author: req.user.id });
        res.status(201).json({ post });
    } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!isValidObjectId(id))
            return res.status(400).json({ message: "ID không hợp lệ" });

        const oldPost = await Post.findById(id);
        if (!oldPost)
            return res.status(404).json({ message: "Post không tồn tại" });

        // Check quyền sửa: phải là author hoặc admin
        if (String(oldPost.author) !== req.user.id &&
            !(req.user.roles && req.user.roles.includes("admin"))) {
            return res.status(403).json({ message: "Không có quyền sửa bài viết" });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ post });
    } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!isValidObjectId(id))
            return res.status(400).json({ message: "ID không hợp lệ" });

        const oldPost = await Post.findById(id);
        if (!oldPost)
            return res.status(404).json({ message: "Post không tồn tại" });

        // Check quyền xoá: phải là author hoặc admin
        if (String(oldPost.author) !== req.user.id &&
            !(req.user.roles && req.user.roles.includes("admin"))) {
            return res.status(403).json({ message: "Không có quyền xóa bài viết" });
        }

        await Post.findByIdAndDelete(id);

        res.json({ message: 'Post deleted' });
    } catch (err) { next(err); }
};

// --- PROMOTIONS ---
exports.getPromotions = async (req, res, next) => {
    try {
        const promos = await Promotion.find().populate('applicableTours', 'name');
        res.json({ data: promos });
    } catch (err) { next(err); }
};

exports.createPromotion = async (req, res, next) => {
    try {
        if (!req.body.code || !req.body.discountValue) {
            return res.status(400).json({ message: "Thiếu code hoặc discountValue" });
        }

        const promo = await Promotion.create(req.body);
        res.status(201).json({ promo });
    } catch (err) { next(err); }
};

exports.updatePromotion = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!isValidObjectId(id))
            return res.status(400).json({ message: "ID không hợp lệ" });

        const promo = await Promotion.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!promo)
            return res.status(404).json({ message: "Promotion không tồn tại" });

        res.json({ promo });
    } catch (err) { next(err); }
};

exports.deletePromotion = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!isValidObjectId(id))
            return res.status(400).json({ message: "ID không hợp lệ" });

        const promo = await Promotion.findByIdAndDelete(id);

        if (!promo)
            return res.status(404).json({ message: "Promotion không tồn tại" });

        res.json({ message: 'Promotion deleted' });
    } catch (err) { next(err); }
};

// Public List Promotions
exports.getPublicPromotions = async (req, res, next) => {
    try {
        const now = new Date();
        const filter = {
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        };

        const promos = await Promotion.find(filter)
            .populate('applicableTours', 'name slug images')
            .sort({ endDate: 1 }); // Ending soonest first

        res.json({ data: promos });
    } catch (err) {
        next(err);
    }
};

// Check Promotion Validity
exports.checkPromotion = async (req, res, next) => {
    try {
        const { code, tourId, totalAmount } = req.body;
        if (!code) return res.status(400).json({ message: "Vui lòng nhập mã" });

        const promo = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });
        if (!promo) return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã hết hạn" });

        // Check dates
        const now = new Date();
        if (promo.startDate > now || promo.endDate < now) {
            return res.status(400).json({ message: "Mã giảm giá chưa bắt đầu hoặc đã hết hạn" });
        }

        // Check usage limit
        if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
        }

        // Check applicable tours
        if (promo.applicableTours && promo.applicableTours.length > 0) {
            if (!tourId || !promo.applicableTours.includes(tourId)) {
                return res.status(400).json({ message: "Mã này không áp dụng cho tour hiện tại" });
            }
        }

        // Calculate discount
        let discount = 0;
        if (promo.discountType === 'percent') {
            discount = (totalAmount * promo.discountValue) / 100;
        } else {
            discount = promo.discountValue;
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, totalAmount);

        res.json({
            valid: true,
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discountAmount: discount
        });
    } catch (err) {
        next(err);
    }
};
