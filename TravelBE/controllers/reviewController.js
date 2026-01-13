const mongoose = require('mongoose');
const Review = require('../models/Review');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

// Update Rating Tour
const updateTourRatingStats = async (tourId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        tour: new mongoose.Types.ObjectId(tourId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$tour',
        average: { $avg: '$rating' },
        total: { $sum: 1 }
      }
    }
  ]);

  let average = 0;
  let total = 0;

  if (stats.length > 0) {
    average = Number(stats[0].average.toFixed(1));
    total = stats[0].total;
  }

  await Tour.findByIdAndUpdate(tourId, {
    averageRating: average,
    totalReviews: total
  });
};

// Create Review
exports.createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tourId, rating, comment } = req.body;

    if (!userId)
      return res.status(401).json({ message: 'Yêu cầu đăng nhập' });

    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId))
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });

    const tour = await Tour.findById(tourId);
    if (!tour || tour.status === 'deleted') {
      return res.status(404).json({ message: 'Tour không tồn tại' });
    }

    // Validate rating
    const ratingNumber = Number(rating);
    if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 tới 5 sao' });
    }

    if (comment && comment.length > 500) {
      return res.status(400).json({ message: 'Comment tối đa 500 ký tự' });
    }

    // Kiểm tra user đã đặt tour chưa
    const bookingExists = await Booking.exists({
      tour: tourId,
      user: userId,
      status: { $ne: 'cancelled' }
    });

    if (!bookingExists) {
      return res.status(400).json({ message: 'Bạn cần đặt tour này trước khi đánh giá' });
    }

    // Một user chỉ được review 1 lần
    const existingReview = await Review.findOne({ tour: tourId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá tour này rồi' });
    }

    // Xử lý images
    let images = [];

    if (Array.isArray(req.files) && req.files.length > 0) {
      images = req.files.map(f => `/uploads/reviews/${f.filename}`);
    } else if (req.body.images) {
      const imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      images.push(...imgs.filter(Boolean));
    }

    const review = await Review.create({
      tour: tourId,
      user: userId,
      rating: ratingNumber,
      comment: comment || '',
      images
    });

    await updateTourRatingStats(tourId);

    return res.status(201).json({
      message: 'Đánh giá đã được gửi thành công',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// List Review by tour
exports.listReviewsByTour = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });
    }

    // Query params
    let { page = 1, limit = 10, rating, hasImages, sort = 'newest', from, to } = req.query;

    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));

    const filter = { tour: id, status: 'approved' };

    if (rating) {
      filter.rating = Number(rating);
    }

    // Lọc theo hình ảnh
    if (hasImages === 'true') {
      filter.images = { $exists: true, $ne: [] };
    } else if (hasImages === 'false') {
      filter.$or = [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ];
    }

    // Lọc theo thời gian
    if (from || to) {
      filter.createdAt = {};
      if (from && !isNaN(Date.parse(from))) filter.createdAt.$gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) filter.createdAt.$lte = new Date(to);
    }

    // Sắp xếp
    const sortOption = (() => {
      switch (sort) {
        case 'oldest': return { createdAt: 1 };
        case 'rating_desc': return { rating: -1, createdAt: -1 };
        case 'rating_asc': return { rating: 1, createdAt: -1 };
        default: return { createdAt: -1 };
      }
    })();

    const total = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'fullName avatar')
      .lean();

    const mapped = reviews.map(rv => ({
      id: rv._id,
      rating: rv.rating,
      comment: rv.comment,
      images: rv.images || [],
      createdAt: rv.createdAt,
      user: {
        name: rv.user?.fullName || 'Ẩn danh',
        avatar: rv.user?.avatar || ''
      }
    }));

    const tour = await Tour.findById(id).select('averageRating totalReviews').lean();

    return res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      averageRating: tour?.averageRating || 0,
      totalReviews: tour?.totalReviews || 0,
      data: mapped
    });

  } catch (error) {
    console.error('List reviews error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get All Reviews (Admin)
exports.getAllReviews = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, status } = req.query;
    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'fullName email avatar')
      .populate('tour', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      data: reviews,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
