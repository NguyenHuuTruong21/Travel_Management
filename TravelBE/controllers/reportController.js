const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

const toObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

// Date Range Helper
const parseDateRange = ({ from, to, year, month }) => {
  if (from || to) {
    const start = from ? new Date(from) : new Date(Date.UTC(1970, 0, 1));
    const end = to ? new Date(to) : new Date();
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  if (year) {
    const y = Number(year);
    if (month) {
      const m = Number(month) - 1;
      const start = new Date(Date.UTC(y, m, 1));
      const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      return { start, end };
    }

    const start = new Date(Date.UTC(y, 0, 1));
    const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
    return { start, end };
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
  return { start, end };
};

// REVENUE REPORT
exports.getRevenueReport = async (req, res, next) => {
  try {
    const { from, to, year, month } = req.query;

    const match = { status: 'Confirmed' };
    const dateRange = parseDateRange({ from, to, year, month });

    match.startDate = { $gte: dateRange.start, $lte: dateRange.end };

    // 1. Overall Stats
    const overallStats = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const { totalRevenue = 0, totalBookings = 0 } = overallStats[0] || {};

    // 2. Stats by Tour
    const byTourStats = await Booking.aggregate([
      { $match: { ...match, type: 'tour' } },
      {
        $group: {
          _id: '$tour',
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const populatedByTour = await Tour.populate(byTourStats, { path: '_id', select: 'name' });

    const byTour = populatedByTour.map(item => {
      const tourFn = item._id;
      return {
        tourName: tourFn ? tourFn.name : 'Unknown Tour',
        count: item.count,
        revenue: item.revenue
      };
    });

    // 3. Stats by Date (Revenue over time)
    const revenueOverTimeStats = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueOverTime = revenueOverTimeStats.map(item => ({
      date: item._id,
      revenue: item.revenue
    }));

    return res.json({
      totalRevenue,
      totalBookings,
      byTour,
      revenueOverTime
    });
  } catch (err) {
    console.error('Revenue report error:', err);
    next(err);
  }
};

// CUSTOMER REPORT
exports.getCustomerReport = async (req, res, next) => {
  try {
    const User = require('../models/User'); // Ensure User model is loaded

    // 1. Total Customers (Users with role 'user')
    // NOTE: Users model stores roles in an array field named `roles` (not `role`)
    const totalCustomers = await User.countDocuments({ roles: 'user' });

    // 2. New Customers (Created this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await User.countDocuments({
      roles: 'user',
      createdAt: { $gte: startOfMonth }
    });

    // 3. Active Customers (Made a booking in status Confirmed/Completed)
    // using distinct user IDs from bookings
    const activeUserIds = await Booking.distinct('user', {
      status: { $in: ['Confirmed', 'Completed'] }
    });
    const activeCustomers = activeUserIds.length;

    // 4. Top Customers (By Total Revenue)
    const topCustomersStats = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);

    const topCustomers = await User.populate(topCustomersStats, { path: '_id', select: 'fullName email' });

    const formattedTopCustomers = topCustomers.map(item => ({
      name: item._id?.fullName || 'Unknown User',
      email: item._id?.email || 'N/A',
      bookingCount: item.bookingCount,
      totalSpent: item.totalSpent
    }));

    return res.json({
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      topCustomers: formattedTopCustomers
    });
  } catch (err) {
    console.error('Customer report error:', err);
    next(err);
  }
};

// SERVICE DISTRIBUTION
const priceRangeLabel = (price) => {
  if (price < 3000000) return 'Thấp (<3M)';
  if (price <= 7000000) return 'Trung bình (3M-7M)';
  return 'Cao (>7M)';
};

const Hotel = require('../models/Hotel');
const Guide = require('../models/Guide');
const Vehicle = require('../models/Vehicle');

// SERVICE DISTRIBUTION
exports.getServiceDistribution = async (_req, res, next) => {
  try {
    // 1. Count totals
    const [tours, hotels, guides, vehicles] = await Promise.all([
      Tour.countDocuments({ status: { $ne: 'deleted' } }),
      Hotel.countDocuments(),
      Guide.countDocuments(),
      Vehicle.countDocuments()
    ]);

    // 2. Popular Tours (by booking count)
    const popularToursStats = await Booking.aggregate([
      { $match: { status: 'Confirmed', type: 'tour' } },
      { $group: { _id: '$tour', bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    const popularTours = await Tour.populate(popularToursStats, { path: '_id', select: 'name averageRating totalReviews' });
    const formattedPopularTours = popularTours.map(item => {
      const tourFn = item._id;
      return {
        name: tourFn?.name || 'Unknown Tour',
        bookingCount: item.bookingCount || 0,
        averageRating: typeof tourFn?.averageRating === 'number' ? tourFn.averageRating : 0,
        reviewsCount: tourFn?.totalReviews || 0
      };
    });

    // 3. Service Utilization (Based on active bookings vs total available)

    // a. Tours Utilization: % of active tours that have at least one confirmed booking
    const bookedTourIds = await Booking.distinct('tour', { status: 'Confirmed' });
    const activeToursCount = await Tour.countDocuments({ status: 'active' });
    const toursUtilization = activeToursCount > 0 ? Math.round((bookedTourIds.length / activeToursCount) * 100) : 0;

    // b. Hotels Utilization: % of hotels that have at least one confirmed booking
    const bookedHotelIds = await Booking.distinct('hotel', { status: 'Confirmed' });
    const activeHotelsCount = await Hotel.countDocuments({ status: 'active' });
    const hotelsUtilization = activeHotelsCount > 0 ? Math.round((bookedHotelIds.length / activeHotelsCount) * 100) : 0;

    // c. Guides Utilization: % of guides assigned to Tours that have bookings
    // Logic: Find guides in booked tours. Note: Guide is stored in Tour model.
    // First find tours that have bookings (bookedTourIds).
    // Then find distinct guides for those tours.
    // Find distinct guides/vehicles used in booked tours
    const bookedTours = await Tour.find({ _id: { $in: bookedTourIds } }).select('guide vehicle').lean();
    const usedGuideIds = new Set();
    const usedVehicleIds = new Set();
    bookedTours.forEach(t => {
      if (t.guide) usedGuideIds.add(t.guide.toString());
      if (t.vehicle) usedVehicleIds.add(t.vehicle.toString());
    });

    // Guides utilization: used guides (in booked tours) divided by active guides
    const activeGuidesCount = await Guide.countDocuments({ status: 'active' });
    const guidesUtilization = activeGuidesCount > 0 ? Math.round((usedGuideIds.size / activeGuidesCount) * 100) : 0;

    // Vehicles utilization: used vehicles (in booked tours) divided by active vehicles
    const activeVehiclesCount = await Vehicle.countDocuments({ status: 'active' });
    const vehiclesUtilization = activeVehiclesCount > 0 ? Math.round((usedVehicleIds.size / activeVehiclesCount) * 100) : 0;

    const utilization = {
      tours: toursUtilization,
      hotels: hotelsUtilization,
      guides: guidesUtilization,
      vehicles: vehiclesUtilization
    };

    return res.json({
      tours,
      hotels,
      guides,
      vehicles,
      popularTours: formattedPopularTours,
      utilization
    });
  } catch (err) {
    console.error('Service distribution error:', err);
    next(err);
  }
};