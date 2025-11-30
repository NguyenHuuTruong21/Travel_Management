const mongoose = require('mongoose');
const Review = require('../models/Review');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

const updateTourRatingStats = async tourId => {
  const stats = await Review.aggregate([
    { $match: { tour: new mongoose.Types.ObjectId(tourId), status: 'approved' } },
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
  if (stats.length) {
    average = Number(stats[0].average.toFixed(1));
    total = stats[0].total;
  }

  await Tour.findByIdAndUpdate(tourId, {
    averageRating: average,
    totalReviews: total
  });
};

exports.createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tourId, rating, comment } = req.body;

    if (!userId) return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour || tour.status === 'deleted') {
      return res.status(404).json({ message: 'Tour không tồn tại' });
    }

    const ratingNumber = Number(rating);
    if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 tới 5 sao' });
    }

    if (comment && comment.length > 500) {
      return res.status(400).json({ message: 'Comment tối đa 500 ký tự' });
    }

    // Ensure user booked the tour
    const bookingExists = await Booking.exists({
      tour: tourId,
      user: userId,
      status: { $ne: 'Cancelled' }
    });
    if (!bookingExists) {
      return res.status(400).json({ message: 'Bạn cần đặt tour này trước khi đánh giá' });
    }

    // Ensure only one review per user per tour
    const existingReview = await Review.findOne({ tour: tourId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá tour này rồi' });
    }

    // Collect images from upload
    const images = [];
    if (req.files && req.files.length) {
      req.files.forEach(f => images.push(`/uploads/reviews/${f.filename}`));
    } else if (req.body.images) {
      const imgs = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
      images.push(...imgs);
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

exports.listReviewsByTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });
    }

    const {
      page = 1,
      limit = 10,
      rating,
      hasImages,
      sort = 'newest',
      from,
      to
    } = req.query;

    const filter = { tour: id, status: 'approved' };
    if (rating) filter.rating = Number(rating);
    if (hasImages === 'true') filter.images = { $exists: true, $ne: [] };
    if (hasImages === 'false') filter.images = { $in: [[], null] };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const sortOption =
      sort === 'oldest'
        ? { createdAt: 1 }
        : sort === 'rating_desc'
        ? { rating: -1, createdAt: -1 }
        : sort === 'rating_asc'
        ? { rating: 1, createdAt: -1 }
        : { createdAt: -1 };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
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
      page: Number(page),
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

