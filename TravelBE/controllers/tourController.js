const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Guide = require('../models/Guide');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Create tour (Admin)
exports.createTour = async (req, res) => {
  try {
    const { name, price, duration, description, itinerary, location, startLocation, capacity, type } = req.body;

    if (!name || !price)
      return res.status(400).json({ message: 'Thiếu tên hoặc giá tour' });
    if (Number(price) <= 0)
      return res.status(400).json({ message: 'Giá phải lớn hơn 0' });

    const exist = await Tour.findOne({ name });
    if (exist) return res.status(400).json({ message: 'Tên tour đã tồn tại' });

    // Xử lý ảnh
    const images = [];
    if (req.files?.length) {
      req.files.forEach(f => images.push(`/uploads/tours/${f.filename}`));
    } else if (req.body.images) {
      try {
        const imgs = typeof req.body.images === 'string'
          ? JSON.parse(req.body.images)
          : req.body.images;

        if (Array.isArray(imgs)) images.push(...imgs);
      } catch (e) {
        return res.status(400).json({ message: 'Dữ liệu images không hợp lệ' });
      }
    }

    if (images.length === 0)
      return res.status(400).json({ message: 'Yêu cầu ít nhất 1 ảnh' });

    // Xử lý itinerary
    let it = [];
    try {
      it = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary || [];
      if (!Array.isArray(it) || it.length === 0)
        return res.status(400).json({ message: 'Yêu cầu ít nhất 1 lịch trình' });
    } catch (err) {
      return res.status(400).json({ message: 'Dữ liệu itinerary không hợp lệ' });
    }

    // Xử lý location
    let loc = location;
    try {
      if (typeof location === 'string') loc = JSON.parse(location);
    } catch {
      return res.status(400).json({ message: 'Dữ liệu location không hợp lệ' });
    }

    const tour = await Tour.create({
      name,
      slug: slugify(name, { lower: true }),
      startLocation: startLocation || 'Hồ Chí Minh',
      price,
      duration,
      description,
      itinerary: it,
      images,
      location: loc,
      capacity: capacity || 0,
      type: type || 'domestic',
      status: 'active'
    });

    return res.status(201).json({
      message: 'Tạo tour thành công',
      id: tour._id,
      tour
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Update tour
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });

    const tour = await Tour.findById(id);
    if (!tour || tour.status === 'deleted')
      return res.status(404).json({ message: 'Tour không tồn tại' });

    const up = req.body;

    if (up.name) {
      const exists = await Tour.findOne({ name: up.name, _id: { $ne: id } });
      if (exists)
        return res.status(400).json({ message: 'Tên tour đã tồn tại' });

      tour.name = up.name;
      tour.slug = slugify(up.name, { lower: true });
    }

    if (up.price !== undefined) {
      if (Number(up.price) <= 0)
        return res.status(400).json({ message: 'Giá phải > 0' });

      tour.price = up.price;
    }

    if (up.duration !== undefined) tour.duration = up.duration;
    if (up.description !== undefined) tour.description = up.description;
    if (up.type !== undefined) tour.type = up.type;
    if (up.capacity !== undefined) tour.capacity = up.capacity;
    if (up.startLocation !== undefined) tour.startLocation = up.startLocation;

    // Xử lý location
    if (up.location) {
      try {
        tour.location = typeof up.location === 'string'
          ? JSON.parse(up.location)
          : up.location;
      } catch {
        return res.status(400).json({ message: 'Dữ liệu location không hợp lệ' });
      }
    }

    // Xử lý itinerary
    if (up.itinerary) {
      try {
        tour.itinerary = typeof up.itinerary === 'string'
          ? JSON.parse(up.itinerary)
          : up.itinerary;
      } catch {
        return res.status(400).json({ message: 'Dữ liệu itinerary không hợp lệ' });
      }
    }

    // Thêm ảnh mới
    if (req.files?.length) {
      const imgs = req.files.map(f => `/uploads/tours/${f.filename}`);
      tour.images = tour.images.concat(imgs);
    }

    // Xóa ảnh cũ nếu FE gửi removeImages
    if (up.removeImages) {
      const imagesToRemove = Array.isArray(up.removeImages) ? up.removeImages : [up.removeImages];
      tour.images = tour.images.filter(img => !imagesToRemove.includes(img));
    }

    await tour.save();

    return res.json({ message: 'Cập nhật tour thành công', tour });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Delete tour
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });

    const tour = await Tour.findById(id);
    if (!tour)
      return res.status(404).json({ message: 'Tour không tồn tại' });

    // Kiểm tra booking đúng model đã import
    const count = await Booking.countDocuments({ tour: tour._id });
    if (count > 0) {
      tour.status = 'inactive';
      await tour.save();
      return res.json({ message: 'Tour đã ngừng hoạt động vì có đơn đặt' });
    }

    await Tour.deleteOne({ _id: id });
    return res.json({ message: 'Tour đã được xoá thành công' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


// List tours
exports.listTours = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      q,
      location,
      minPrice,
      maxPrice,
      type,
      minRating,
      sortBy,
      startLocation
    } = req.query;

    page = Math.max(1, Number(page));
    limit = Math.min(50, Math.max(1, Number(limit))); // tránh limit quá lớn

    const filter = { status: 'active' };

    if (location) filter['location.address'] = new RegExp(location, 'i');
    if (startLocation) filter.startLocation = new RegExp(startLocation, 'i');
    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }

    let query = Tour.find(filter);

    const sortOptions = {
      'price_asc': { price: 1 },
      'price_desc': { price: -1 },
      'newest': { createdAt: -1 }
    };

    if (sortBy && sortOptions[sortBy]) {
      query = query.sort(sortOptions[sortBy]);
    }

    const total = await Tour.countDocuments(filter);

    const tours = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const results = tours.map(t => ({
      ...t,
      remainingSeats: Math.max(0, (t.capacity ?? 0) - (t.bookedSeats ?? 0))
    }));

    return res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: results
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin List Tours
exports.getAllTours = async (req, res) => {
  try {
    let { page = 1, limit = 10, q, location, type, minPrice, maxPrice, startLocation } = req.query;
    page = Math.max(1, Number(page));
    limit = Math.min(50, Math.max(1, Number(limit)));

    const filter = { status: { $ne: 'deleted' } };

    if (location) filter['location.address'] = new RegExp(location, 'i');
    if (startLocation) filter.startLocation = new RegExp(startLocation, 'i');
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }

    const total = await Tour.countDocuments(filter);
    const tours = await Tour.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const results = tours.map(t => ({
      ...t,
      remainingSeats: Math.max(0, (t.capacity ?? 0) - (t.bookedSeats ?? 0))
    }));

    return res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: results
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get tour details
exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });
    }

    const tour = await Tour.findById(id)
      .populate('guide', 'name experience languages avatar description certificates toursCount status')
      .populate('vehicle', 'type capacity plateNumber driverName image status')
      .lean();

    if (!tour || tour.status === 'deleted') {
      return res.status(404).json({ message: 'Tour không tồn tại' });
    }

    tour.remainingSeats = Math.max(0, (tour.capacity ?? 0) - (tour.bookedSeats ?? 0));

    // tour.guideInfo = tour.guide ? {
    //   name: tour.guide.name,
    //   experience: tour.guide.experience,
    //   languages: tour.guide.languages,
    //   avatar: tour.guide.avatar,
    //   description: tour.guide.description,
    //   certificates: tour.guide.certificates,
    //   toursCount: tour.guide.toursCount
    // } : null;

    tour.vehicleInfo = tour.vehicle ? {
      type: tour.vehicle.type,
      capacity: tour.vehicle.capacity,
      plateNumber: tour.vehicle.plateNumber,
      driverName: tour.vehicle.driverName,
      image: tour.vehicle.image,
      status: tour.vehicle.status
    } : null;

    return res.json({ tour });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Attach hotel to tour
exports.attachHotelToTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hotelId, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ message: 'Tour không tồn tại' });

    if (tour.status !== 'active')
      return res.status(400).json({ message: 'Không thể gắn khách sạn cho tour không hoạt động' });

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || hotel.status !== 'active')
      return res.status(400).json({ message: 'Khách sạn phải active' });

    const duplicated = tour.hotels?.some(h => h.hotel.equals(hotelId));
    if (duplicated)
      return res.status(400).json({ message: 'Khách sạn đã được gắn cho tour này' });

    tour.hotels.push({ hotel: hotelId, note: note || '' });
    await tour.save();

    const updated = await Tour.findById(id)
      .populate('hotels.hotel', 'name location stars image')
      .lean();

    res.json({ message: 'Gắn khách sạn thành công', tour: updated });
  } catch (err) {
    next(err);
  }
};

// Assign guide to tour (Admin)
exports.assignGuideToTour = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    const { guideId } = req.body;

    if (!guideId)
      return res.status(400).json({ message: 'Guide ID là bắt buộc' });

    if (!mongoose.Types.ObjectId.isValid(tourId) || !mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour không tồn tại' });

    if (tour.status !== 'active')
      return res.status(400).json({ message: 'Không thể gán guide cho tour không hoạt động' });

    // Tour đã có Hướng dẫn viên
    if (tour.guide && !tour.guide.equals(guideId))
      return res.status(400).json({ message: 'Tour đã có guide. Chỉ được gán 1 guide.' });

    const guide = await Guide.findById(guideId);
    if (!guide) return res.status(404).json({ message: 'Guide không tồn tại' });

    if (guide.status !== 'active')
      return res.status(400).json({ message: 'Guide phải đang active' });

    // ---- Kiểm tra lịch của tour ----
    const bookings = await Booking.find({
      tour: tour._id,
      status: { $ne: 'Cancelled' }
    });

    // Lấy danh sách ngày tour
    const tourDates = [
      ...new Set(
        bookings.map(b => new Date(b.startDate).setHours(0, 0, 0, 0))
      )
    ].map(ms => new Date(ms));

    // Không có booking thì không cần check xung đột
    if (tourDates.length) {
      const guideSchedule = guide.schedule || [];

      // 1) Kiểm tra guide có rảnh không
      for (const date of tourDates) {
        const isFree = guideSchedule.some(slot =>
          new Date(slot.date).setHours(0, 0, 0, 0) === date.getTime()
          && slot.isAvailable === true
        );

        if (!isFree)
          return res.status(400).json({
            message: `Guide không rảnh vào ngày ${date.toLocaleDateString('vi-VN')}`
          });
      }

      // 2) Kiểm tra guide có bận tour khác không
      const otherTours = await Tour.find({
        guide: guide._id,
        _id: { $ne: tour._id },
        status: 'active'
      });

      if (otherTours.length) {
        const otherBookings = await Booking.find({
          tour: { $in: otherTours.map(t => t._id) },
          status: { $ne: 'Cancelled' }
        });

        for (const date of tourDates) {
          const conflict = otherBookings.find(b =>
            new Date(b.startDate).setHours(0, 0, 0, 0) === date.getTime()
          );

          if (conflict) {
            return res.status(400).json({
              message: `Guide đã được gán cho tour khác vào ngày ${date.toLocaleDateString('vi-VN')}`
            });
          }
        }
      }
    }

    // gán hướng dẫn viên
    tour.guide = guide._id;
    await tour.save();

    // cập nhật số tour phụ trách
    guide.toursCount = await Tour.countDocuments({ guide: guide._id });
    await guide.save();

    const updatedTour = await Tour.findById(tourId)
      .populate('guide', 'name experience languages avatar description certificates toursCount')
      .lean();

    res.json({
      message: 'Gán guide thành công',
      tour: updatedTour
    });

  } catch (err) {
    console.error('Assign guide error:', err);
    next(err);
  }
};


// Assign vehicle to tour (Admin)
exports.assignVehicleToTour = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    const { vehicleId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tourId) || !mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour không tồn tại' });

    if (tour.status !== 'active')
      return res.status(400).json({ message: 'Không thể gán phương tiện cho tour không hoạt động' });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Phương tiện không tồn tại' });

    if (vehicle.status !== 'active')
      return res.status(400).json({ message: 'Phương tiện phải active' });

    // Tour có vehicle khác → không cho đổi
    if (tour.vehicle && !tour.vehicle.equals(vehicleId)) {
      return res.status(400).json({ message: 'Tour đã có phương tiện. Vui lòng bỏ gán trước khi đổi.' });
    }

    // ---- Kiểm tra xung đột ngày ----
    const bookings = await Booking.find({
      tour: tour._id,
      status: { $ne: 'Cancelled' }
    });

    const tourDates = [
      ...new Set(
        bookings.map(b => new Date(b.startDate).setHours(0, 0, 0, 0))
      )
    ].map(ms => new Date(ms));

    if (tourDates.length) {
      const otherTours = await Tour.find({
        vehicle: vehicle._id,
        _id: { $ne: tour._id },
        status: 'active'
      });

      if (otherTours.length) {
        const otherBookings = await Booking.find({
          tour: { $in: otherTours.map(t => t._id) },
          status: { $ne: 'Cancelled' }
        });

        for (const date of tourDates) {
          const conflict = otherBookings.find(b =>
            new Date(b.startDate).setHours(0, 0, 0, 0) === date.getTime()
          );

          if (conflict) {
            return res.status(400).json({
              message: `Phương tiện bận vào ngày ${date.toLocaleDateString('vi-VN')}`
            });
          }
        }
      }
    }

    // gán phương tiện
    tour.vehicle = vehicle._id;
    await tour.save();

    const updated = await Tour.findById(tourId)
      .populate('vehicle', 'type capacity plateNumber driverName image status')
      .lean();

    res.json({
      message: 'Gán phương tiện thành công',
      tour: updated
    });

  } catch (err) {
    console.error('Assign vehicle error:', err);
    next(err);
  }
};
