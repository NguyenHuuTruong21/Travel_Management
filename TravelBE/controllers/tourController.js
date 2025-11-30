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
        const { name, price, duration, description, itinerary, location, capacity, type } = req.body;

        // Validation
        if (!name || !price) return res.status(400).json({ message: 'Thiếu tên hoặc giá tour' });
        if (Number(price) <= 0) return res.status(400).json({ message: 'Giá phải lớn hơn 0' });

        const exist = await Tour.findOne({ name });
        if (exist) return res.status(400).json({ message: 'Tên tour đã tồn tại' });

        // images from multer (req.files) or req.body.images (urls)
        const images = [];
        if (req.files && req.files.length) {
        req.files.forEach(f => images.push(`/uploads/tours/${f.filename}`));
        } else if (req.body.images) {
        // allow images = JSON string or array
        const imgs = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(imgs)) images.push(...imgs);
        }

        if (images.length === 0) return res.status(400).json({ message: 'Yêu cầu ít nhất 1 ảnh' });
        // itinerary: accept JSON string or array
        const it = typeof itinerary === 'string' ? JSON.parse(itinerary) : (itinerary || []);
        if (!Array.isArray(it) || it.length === 0) return res.status(400).json({ message: 'Yêu cầu ít nhất 1 lịch trình' });

        // location: expect { address, coordinates: [lng,lat] }
        const loc = typeof location === 'string' ? JSON.parse(location) : location;

        const tour = await Tour.create({
        name,
        slug: slugify(name, { lower: true }),
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

        return res.status(201).json({ message: 'Tạo tour thành công', id: tour._id, tour });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Update tour
exports.updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Tour ID không hợp lệ' });

        const tour = await Tour.findById(id);
        if (!tour || tour.status === 'deleted') return res.status(404).json({ message: 'Tour không tồn tại' });

        // If tour is currently 'inactive' or 'deleted', disallow update? spec: not edit if deleted or ongoing (we don't track ongoing here)
        if (tour.status === 'deleted') return res.status(400).json({ message: 'Tour đã bị xóa' });

        // handle fields
        const up = req.body;
        if (up.name) {
        const exists = await Tour.findOne({ name: up.name, _id: { $ne: id } });
        if (exists) return res.status(400).json({ message: 'Tên tour đã tồn tại' });
        tour.name = up.name;
        tour.slug = slugify(up.name, { lower: true });
        }
        if (up.price) {
        if (Number(up.price) <= 0) return res.status(400).json({ message: 'Giá phải > 0' });
        tour.price = up.price;
        }
        if (up.duration) tour.duration = up.duration;
        if (up.description) tour.description = up.description;
        if (up.capacity) tour.capacity = up.capacity;
        if (up.type) tour.type = up.type;
        if (up.location) tour.location = typeof up.location === 'string' ? JSON.parse(up.location) : up.location;
        if (up.itinerary) tour.itinerary = typeof up.itinerary === 'string' ? JSON.parse(up.itinerary) : up.itinerary;

        // images - merge new uploads
        if (req.files && req.files.length) {
        const imgs = req.files.map(f => `/uploads/tours/${f.filename}`);
        tour.images = tour.images.concat(imgs);
        }

        await tour.save();
        return res.json({ message: 'Cập nhật tour thành công', tour });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Delete tour
exports.deleteTour = async (req, res) => {
    try {
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Tour ID không hợp lệ' });

        const tour = await Tour.findById(id);
        if (!tour) return res.status(404).json({ message: 'Tour không tồn tại' });

        // check if booking exists (if Booking model available)
        const Booking = mongoose.models.Booking;
        if (Booking) {
        const count = await Booking.countDocuments({ tour: tour._id });
        if (count > 0) {
            tour.status = 'inactive';
            await tour.save();
            return res.json({ message: 'Tour đã bị ngừng hoạt động vì đã có đơn đặt' });
        }
        }
        // else remove fully
        await Tour.deleteOne({ _id: id });
        return res.json({ message: 'Tour đã được xoá thành công' });
    }
    catch (error) {
        console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
    }
}

// List tours
exports.listTours = async (req, res) => {
    try {
        const {
        page = 1,
        limit = 10,
        q, // search keyword
        location,
        minPrice,
        maxPrice,
        type,
        minRating, // if reviews implemented
        sortBy // price_asc, price_desc, newest, popularity
        } = req.query;

        const filter = { status: { $ne: 'deleted' } };

        if (location) filter['location.address'] = new RegExp(location, 'i');
        if (type) filter.type = type;
        if (minPrice) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
        if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
        if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];

        let query = Tour.find(filter);

        // sorting
        if (sortBy) {
        if (sortBy === 'price_asc') query = query.sort({ price: 1 });
        else if (sortBy === 'price_desc') query = query.sort({ price: -1 });
        else if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
        // popularity would require bookings count - skip here
        }

        const total = await Tour.countDocuments(filter);
        const tours = await query
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

         // attach remainingSeats
        const results = tours.map(t => ({ ...t, remainingSeats: Math.max(0, (t.capacity || 0) - (t.bookedSeats || 0)) }));

        return res.json({
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            total,
            data: results
        });
    }
    catch (error) {
         console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
    }
}

// Get tour details
exports.getTour = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Tour ID không hợp lệ' });

        const tour = await Tour.findById(id)
            .populate('guide', 'name experience languages avatar description certificates toursCount')
            .populate('vehicle', 'type capacity plateNumber driverName image status')
            .lean();
        if (!tour || tour.status === 'deleted') return res.status(404).json({ message: 'Tour không tồn tại' });

        tour.remainingSeats = Math.max(0, (tour.capacity || 0) - (tour.bookedSeats || 0));

        // Format guide info for display
        if (tour.guide) {
            tour.guideInfo = {
                name: tour.guide.name,
                experience: tour.guide.experience,
                languages: tour.guide.languages,
                avatar: tour.guide.avatar,
                description: tour.guide.description,
                certificates: tour.guide.certificates,
                toursCount: tour.guide.toursCount
            };
        } else {
            tour.guideInfo = null;
        }

        if (tour.vehicle) {
            tour.vehicleInfo = {
                type: tour.vehicle.type,
                capacity: tour.vehicle.capacity,
                plateNumber: tour.vehicle.plateNumber,
                driverName: tour.vehicle.driverName,
                image: tour.vehicle.image,
                status: tour.vehicle.status
            };
        } else {
            tour.vehicleInfo = null;
        }

         // optionally compute average rating or bookings count if other models exist
        return res.json({ tour });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// Attach hotel to tour
exports.attachHotelToTour = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    const { hotelId, note } = req.body;

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour không tồn tại' });

    if (tour.status !== 'active') return res.status(400).json({ message: 'Không thể gắn khách sạn cho tour không hoạt động' });

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || hotel.status !== 'active') return res.status(400).json({ message: 'Khách sạn phải đang ở trạng thái active' });

    // prevent duplicate
    const exists = tour.hotels && tour.hotels.find(h => String(h.hotel) === String(hotelId));
    if (exists) return res.status(400).json({ message: 'Khách sạn đã được gắn cho tour này' });

    tour.hotels = tour.hotels || [];
    tour.hotels.push({ hotel: hotel._id, note: note || '' });
    await tour.save();

    res.json({ message: 'Gắn khách sạn thành công', tour });
  } catch (err) {
    next(err);
  }
};

// Assign guide to tour (Admin)
exports.assignGuideToTour = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    const { guideId } = req.body;

    if (!guideId) {
      return res.status(400).json({ message: 'Guide ID là bắt buộc' });
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });
    }

    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour không tồn tại' });
    }

    if (tour.status !== 'active') {
      return res.status(400).json({ message: 'Không thể gán guide cho tour không hoạt động' });
    }

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });
    }

    if (guide.status !== 'active') {
      return res.status(400).json({ message: 'Guide phải đang active' });
    }

    // Check if tour already has a guide
    if (tour.guide) {
      return res.status(400).json({ message: 'Tour đã có hướng dẫn viên. Một tour chỉ được gán 1 guide phụ trách.' });
    }

    // Check if guide has available schedule for the tour dates
    // We need to check bookings to get the tour dates
    const bookings = await Booking.find({
      tour: tour._id,
      status: { $ne: 'Cancelled' }
    }).sort({ startDate: 1 });

    if (bookings.length > 0) {
      // Check guide's schedule for the booking dates
      const tourDates = bookings.map(b => {
        const d = new Date(b.startDate);
        d.setHours(0, 0, 0, 0);
        return d;
      });

      // Remove duplicates
      const uniqueTourDates = [...new Set(tourDates.map(d => d.getTime()))].map(t => new Date(t));

      // Check if guide has available schedule for these dates
      const guideSchedule = guide.schedule || [];
      
      for (const tourDate of uniqueTourDates) {
        const availableSlot = guideSchedule.find(slot => {
          const slotDate = new Date(slot.date);
          slotDate.setHours(0, 0, 0, 0);
          return slotDate.getTime() === tourDate.getTime() && slot.isAvailable === true;
        });

        if (!availableSlot) {
          return res.status(400).json({ 
            message: `Guide không rảnh trong thời gian này (ngày ${tourDate.toLocaleDateString('vi-VN')})` 
          });
        }
      }

      // Also check if guide is already assigned to another tour on the same date
      const otherToursWithGuide = await Tour.find({
        guide: guide._id,
        _id: { $ne: tourId },
        status: 'active'
      });

      if (otherToursWithGuide.length > 0) {
        const otherTourIds = otherToursWithGuide.map(t => t._id);
        const otherBookings = await Booking.find({
          tour: { $in: otherTourIds },
          status: { $ne: 'Cancelled' }
        });

        for (const tourDate of uniqueTourDates) {
          const conflict = otherBookings.find(b => {
            const bDate = new Date(b.startDate);
            bDate.setHours(0, 0, 0, 0);
            return bDate.getTime() === tourDate.getTime();
          });

          if (conflict) {
            return res.status(400).json({ 
              message: `Guide không rảnh trong thời gian này (đã được gán cho tour khác vào ngày ${tourDate.toLocaleDateString('vi-VN')})` 
            });
          }
        }
      }
    }
    // If no bookings exist, allow assignment (admin should ensure schedule is set before bookings are made)

    // Assign guide to tour
    tour.guide = guide._id;
    await tour.save();

    // Update guide's tours count
    guide.toursCount = await Tour.countDocuments({ guide: guide._id });
    await guide.save();

    const updatedTour = await Tour.findById(tourId)
      .populate('guide', 'name experience languages avatar description certificates toursCount')
      .lean();

    res.json({ 
      message: 'Guide được gán cho tour thành công',
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

    if (!vehicleId) {
      return res.status(400).json({ message: 'Vehicle ID là bắt buộc' });
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ message: 'Tour ID không hợp lệ' });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: 'Vehicle ID không hợp lệ' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour không tồn tại' });
    }

    if (tour.status !== 'active') {
      return res.status(400).json({ message: 'Không thể gán phương tiện cho tour không hoạt động' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Phương tiện không tồn tại' });
    }

    if (vehicle.status !== 'active') {
      return res.status(400).json({ message: 'Phương tiện phải đang active' });
    }

    if (tour.vehicle && String(tour.vehicle) !== String(vehicleId)) {
      return res.status(400).json({ message: 'Tour đã có phương tiện. Vui lòng bỏ gán trước khi chọn phương tiện khác.' });
    }

    // Check tour bookings to detect date conflicts
    const bookings = await Booking.find({
      tour: tour._id,
      status: { $ne: 'Cancelled' }
    }).sort({ startDate: 1 });

    const bookingDates = [
      ...new Set(
        bookings.map(b => {
          const d = new Date(b.startDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      )
    ].map(ts => new Date(ts));

    if (bookingDates.length) {
      const otherTours = await Tour.find({
        vehicle: vehicle._id,
        _id: { $ne: tour._id },
        status: 'active'
      }).select('_id');

      if (otherTours.length > 0) {
        const otherTourIds = otherTours.map(t => t._id);
        const otherBookings = await Booking.find({
          tour: { $in: otherTourIds },
          status: { $ne: 'Cancelled' }
        });

        for (const date of bookingDates) {
          const conflict = otherBookings.find(b => {
            const start = new Date(b.startDate);
            start.setHours(0, 0, 0, 0);
            return start.getTime() === date.getTime();
          });

          if (conflict) {
            return res.status(400).json({
              message: `Phương tiện đang bận trong thời gian này (ngày ${date.toLocaleDateString('vi-VN')})`
            });
          }
        }
      }
    }

    tour.vehicle = vehicle._id;
    await tour.save();

    const updatedTour = await Tour.findById(tourId)
      .populate('vehicle', 'type capacity plateNumber driverName image status')
      .lean();

    return res.json({
      message: 'Phương tiện được gán cho tour thành công',
      tour: updatedTour
    });
  } catch (err) {
    console.error('Assign vehicle error:', err);
    next(err);
  }
};