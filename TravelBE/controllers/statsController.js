const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Interaction = require('../models/Interaction');

// Valid Payment Status Config
const VALID_STATUSES = ['Paid', 'Confirmed', 'Completed'];

/**
 * 1. Doanh thu theo thời gian
 * Cung cấp doanh thu theo ngày/tháng/năm
 * API: GET /api/stats/revenue-by-time?type=day|month|year
 */
exports.getRevenueByTime = async (req, res) => {
  try {
    const { type = 'month' } = req.query; // day, month, year
    
    let format = '%Y-%m'; // mặc định là tháng
    if (type === 'day') format = '%Y-%m-%d';
    if (type === 'year') format = '%Y';

    const result = await Booking.aggregate([
      // Lọc booking đã thanh toán / thành công
      { $match: { 
          $or: [
              { status: { $in: VALID_STATUSES } },
              { paymentStatus: 'Paid' }
          ]
      } },
      // Group theo format thời gian
      { $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
      } },
      // Sort tăng dần theo thời gian
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Doanh thu theo loại dịch vụ
 * API: GET /api/stats/revenue-by-type
 */
exports.getRevenueByType = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $match: { 
          $or: [
              { status: { $in: VALID_STATUSES } },
              { paymentStatus: 'Paid' }
          ]
      } },
      { $group: {
          _id: '$type', // 'tour', 'hotel', 'car'
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
      } }
    ]);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Doanh thu theo khu vực
 * API: GET /api/stats/revenue-by-location
 */
exports.getRevenueByLocation = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $match: { 
          $or: [
              { status: { $in: VALID_STATUSES } },
              { paymentStatus: 'Paid' }
          ],
          type: 'tour' // Chỉ filter Tour để map location
      } },
      { $lookup: {
          from: 'tours', // Tên collection trong MongoDB
          localField: 'tour',
          foreignField: '_id',
          as: 'tourInfo'
      } },
      { $unwind: { path: '$tourInfo', preserveNullAndEmptyArrays: false } },
      { $group: {
          _id: '$tourInfo.startLocation',
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
      } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. User Growth
 * API: GET /api/stats/user-growth
 */
exports.getUserGrowth = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          users: { $sum: 1 }
      } },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Hành vi người dùng
 * API: GET /api/stats/user-behavior
 */
exports.getUserBehavior = async (req, res) => {
  try {
    const result = await Interaction.aggregate([
      { $group: {
          _id: '$action',
          count: { $sum: 1 }
      } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Top 5 Tour bán chạy
 * API: GET /api/stats/top-tours
 */
exports.getTopTours = async (req, res) => {
    try {
        const topTours = await Booking.aggregate([
            { $match: { 
                $or: [
                    { status: { $in: VALID_STATUSES } },
                    { paymentStatus: 'Paid' }
                ],
                type: 'tour' 
            } },
            { $group: {
                _id: '$tour',
                totalRevenue: { $sum: '$totalPrice' },
                totalBookings: { $sum: 1 },
                totalPassengers: { $sum: '$quantity' }
            } },
            // $sort mapping Top Selling Tours based on Revenue
            { $sort: { totalRevenue: -1 } },
            // $limit exactly top 5
            { $limit: 5 },
            { $lookup: {
                from: 'tours',
                localField: '_id',
                foreignField: '_id',
                as: 'tourDetail'
            } },
            { $unwind: '$tourDetail' },
            { $project: {
                _id: 1,
                totalRevenue: 1,
                totalBookings: 1,
                totalPassengers: 1,
                name: '$tourDetail.name',
                image: { $arrayElemAt: ['$tourDetail.images', 0] }
            } }
        ]);

        res.status(200).json({ success: true, data: topTours });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 7. So sánh tháng này với tháng trước dùng $facet
 * API: GET /api/stats/mom-comparison
 */
exports.getMoMComparison = async (req, res) => {
    try {
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const comparison = await Booking.aggregate([
            { $match: { 
                $or: [
                    { status: { $in: VALID_STATUSES } },
                    { paymentStatus: 'Paid' }
                ],
                createdAt: { $gte: firstDayLastMonth } 
            } },
            { $facet: {
                thisMonth: [
                    { $match: { createdAt: { $gte: firstDayThisMonth } } },
                    { $group: { _id: null, revenue: { $sum: '$totalPrice' }, bookingsCount: { $sum: 1 } } }
                ],
                lastMonth: [
                    { $match: { createdAt: { $lt: firstDayThisMonth } } },
                    { $group: { _id: null, revenue: { $sum: '$totalPrice' }, bookingsCount: { $sum: 1 } } }
                ]
            } }
        ]);

        const formatData = (arr) => arr.length > 0 ? arr[0] : { revenue: 0, bookingsCount: 0 };
        const thisMonthData = formatData(comparison[0].thisMonth);
        const lastMonthData = formatData(comparison[0].lastMonth);

        // Tính % thay đổi
        let revenueChange = 0;
        let bookingsChange = 0;

        if (lastMonthData.revenue > 0) {
            revenueChange = ((thisMonthData.revenue - lastMonthData.revenue) / lastMonthData.revenue) * 100;
        } else if (thisMonthData.revenue > 0) {
            revenueChange = 100;
        }

        if (lastMonthData.bookingsCount > 0) {
            bookingsChange = ((thisMonthData.bookingsCount - lastMonthData.bookingsCount) / lastMonthData.bookingsCount) * 100;
        } else if (thisMonthData.bookingsCount > 0) {
            bookingsChange = 100;
        }

        res.status(200).json({
            success: true,
            data: {
                thisMonth: thisMonthData,
                lastMonth: lastMonthData,
                revenueChange: parseFloat(revenueChange.toFixed(2)),
                bookingsChange: parseFloat(bookingsChange.toFixed(2))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 9. Lấy số liệu tổng quát (Summary Stats) cho Dashboard
 * API: GET /api/stats/summary
 */
exports.getSummaryStats = async (req, res) => {
    try {
        // 1. Tổng doanh thu (Lifetime)
        const totalRevenueResult = await Booking.aggregate([
            { $match: { 
                $or: [
                    { status: { $in: VALID_STATUSES } },
                    { paymentStatus: 'Paid' }
                ]
            } },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
        const totalBookings = totalRevenueResult.length > 0 ? totalRevenueResult[0].count : 0;

        // 2. Tổng người dùng
        const totalUsers = await User.countDocuments();

        // 3. Tổng Tours
        // Giả sử có model Tour, nếu không có import ở đầu file thì ta sử dụng mongoose.model
        const Tour = mongoose.model('Tour');
        const totalTours = await Tour.countDocuments();

        // 4. Doanh thu tháng này (để hiển thị change % nếu cần)
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthRevenueResult = await Booking.aggregate([
            { $match: { 
                $or: [
                    { status: { $in: VALID_STATUSES } },
                    { paymentStatus: 'Paid' }
                ],
                createdAt: { $gte: firstDayThisMonth }
            } },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
        ]);
        const thisMonthRevenue = thisMonthRevenueResult.length > 0 ? thisMonthRevenueResult[0].total : 0;
        const thisMonthBookings = thisMonthRevenueResult.length > 0 ? thisMonthRevenueResult[0].count : 0;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalBookings,
                totalUsers,
                totalTours,
                thisMonthRevenue,
                thisMonthBookings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 8. Ghi nhận log Tương tác User
 * API: POST /api/stats/interactions
 */
exports.logInteraction = async (req, res) => {
    try {
        const { action, entityId, entityType, metadata } = req.body;
        if (!action) return res.status(400).json({ success: false, message: 'Action is required' });

        const newInteraction = await Interaction.create({
            user: req.user ? req.user.id : null,
            action,
            entityId: entityId || null,
            entityType: entityType || 'none',
            metadata: metadata || {}
        });

        res.status(201).json({ success: true, data: newInteraction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
