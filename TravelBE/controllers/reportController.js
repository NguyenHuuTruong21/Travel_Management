const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

const toObjectId = id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

const parseDateRange = ({ from, to, year, month }) => {
  // if (from || to) {
  //   const start = from ? new Date(from) : new Date('1970-01-01');
  //   const end = to ? new Date(to) : new Date();
  //   end.setHours(23, 59, 59, 999);
  //   return { start, end };
  // }
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

exports.getRevenueReport = async (req, res) => {
  try {
    const { tourId, from, to, year, month, granularity = 'monthly' } = req.query;

    const match = { status: 'Confirmed' };
    const dateRange = parseDateRange({ from, to, year, month });
    match.startDate = { $gte: dateRange.start, $lte: dateRange.end };

    if (tourId) {
      const objId = toObjectId(tourId);
      if (!objId) return res.status(400).json({ message: 'Tour ID không hợp lệ' });
      match.tour = objId;
    }

    const groupId =
      granularity === 'yearly'
        ? { year: { $year: '$startDate' } }
        : {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          };

    const results = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const data = results.map(item => ({
      period:
        granularity === 'yearly'
          ? `${item._id.year}`
          : `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      year: item._id.year,
      month: item._id.month || null,
      totalRevenue: item.totalRevenue,
      bookingCount: item.bookingCount
    }));

    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

    return res.json({
      currency: 'VND',
      granularity: granularity === 'yearly' ? 'yearly' : 'monthly',
      range: {
        from: dateRange.start,
        to: dateRange.end
      },
      totalRevenue,
      points: data
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getCustomerReport = async (req, res) => {
  try {
    const { tourId, from, to, year, month } = req.query;

    const match = { status: 'Confirmed' };
    const dateRange = parseDateRange({ from, to, year, month });
    match.startDate = { $gte: dateRange.start, $lte: dateRange.end };

    if (tourId) {
      const objId = toObjectId(tourId);
      if (!objId) return res.status(400).json({ message: 'Tour ID không hợp lệ' });
      match.tour = objId;
    }

    const results = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          customerCount: { $sum: '$quantity' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const data = results.map(item => ({
      period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      year: item._id.year,
      month: item._id.month,
      customerCount: item.customerCount,
      bookingCount: item.bookingCount
    }));

    const totalCustomers = data.reduce((sum, item) => sum + item.customerCount, 0);

    return res.json({
      range: {
        from: dateRange.start,
        to: dateRange.end
      },
      totalCustomers,
      points: data
    });
  } catch (error) {
    console.error('Customer report error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const priceRangeLabel = price => {
  if (price < 3000000) return 'Thấp (<3M)';
  if (price <= 7000000) return 'Trung bình (3M-7M)';
  return 'Cao (>7M)';
};

exports.getServiceDistribution = async (_req, res) => {
  try {
    const tours = await Tour.find({ status: { $ne: 'deleted' } })
      .select('location price type status')
      .lean();

    const totalTours = tours.length;
    if (!totalTours) {
      return res.json({
        totalTours: 0,
        locationDistribution: [],
        priceDistribution: [],
        typeDistribution: []
      });
    }

    const locationMap = {};
    const priceMap = {};
    const typeMap = {};

    tours.forEach(tour => {
      const locationLabel = tour.location?.address || 'Khác';
      locationMap[locationLabel] = (locationMap[locationLabel] || 0) + 1;

      const priceLabel = priceRangeLabel(tour.price || 0);
      priceMap[priceLabel] = (priceMap[priceLabel] || 0) + 1;

      const typeLabel = tour.type || 'Khác';
      typeMap[typeLabel] = (typeMap[typeLabel] || 0) + 1;
    });

    const convertToDistribution = map =>
      Object.entries(map).map(([label, count]) => ({
        label,
        count,
        percentage: Number(((count / totalTours) * 100).toFixed(2))
      }));

    return res.json({
      totalTours,
      locationDistribution: convertToDistribution(locationMap),
      priceDistribution: convertToDistribution(priceMap),
      typeDistribution: convertToDistribution(typeMap)
    });
  } catch (error) {
    console.error('Service distribution error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

