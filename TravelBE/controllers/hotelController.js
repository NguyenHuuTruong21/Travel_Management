const slugify = require('slugify');
const Hotel = require('../models/Hotel');
const Tour = require('../models/Tour');

// Create Hotel (Amdin)
exports.createHotel = async (req, res, next) => {
  try {
    const { name, address, amenities, pricePerNight, stars } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Tên và địa chỉ là bắt buộc' });
    }

    const exist = await Hotel.findOne({ name });
    if (exist) return res.status(400).json({ message: 'Tên khách sạn đã tồn tại' });

    // Validate price
    if (pricePerNight !== undefined && Number(pricePerNight) < 0) {
      return res.status(400).json({ message: 'Giá phòng không hợp lệ' });
    }

    // Validate images
    let images = [];
    if (req.files?.length > 0) {
      images = req.files.map(f => `/uploads/hotels/${f.filename}`);
    }
    if (images.length === 0) {
      return res.status(400).json({ message: 'Cần ít nhất 1 ảnh minh họa' });
    }

    const hotel = await Hotel.create({
      name,
      slug: slugify(name, { lower: true }),
      address,
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []),
      pricePerNight: Number(pricePerNight || 0),
      images,
      stars: Number(stars || 3)
    });

    return res.status(201).json({
      message: 'Khách sạn đã được thêm thành công',
      hotelId: hotel._id,
      hotel
    });

  } catch (err) {
    console.error('Create hotel error:', err);
    next(err);
  }
};

// Upload Hotel (Admin)
exports.updateHotel = async (req, res, next) => {
  try {
    const id = req.params.id;

    const hotel = await Hotel.findById(id);
    if (!hotel || hotel.status === 'deleted') {
      return res.status(404).json({ message: 'Khách sạn không tồn tại' });
    }

    const { name, address, amenities, pricePerNight, stars, description } = req.body;

    // Validate duplicate name
    if (name && name !== hotel.name) {
      const dup = await Hotel.findOne({ name, _id: { $ne: id } });
      if (dup) return res.status(400).json({ message: 'Tên khách sạn đã tồn tại' });

      hotel.name = name;
      hotel.slug = slugify(name, { lower: true });
    }

    // Check if hotel is attached to active tours
    const attachedActiveTours = await Tour.findOne({ 'hotels.hotel': hotel._id, status: 'active' });
    const isLocked = attachedActiveTours ? true : false;

    // Address cannot change if hotel is in active tour
    if (address) {
      if (isLocked) {
        return res.status(400).json({ message: 'Không thể thay đổi địa chỉ khi khách sạn đang được sử dụng trong tour đang diễn ra' });
      }
      hotel.address = address;
    }

    // Amenities
    if (amenities !== undefined) {
      try {
        hotel.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      } catch (jsonErr) {
        return res.status(400).json({ message: 'Dữ liệu tiện ích (amenities) không đúng định dạng JSON' });
      }
    }

    // Price validation
    if (pricePerNight !== undefined) {
      if (Number(pricePerNight) < 0) {
        return res.status(400).json({ message: 'Giá phòng không hợp lệ' });
      }
      hotel.pricePerNight = Number(pricePerNight);
    }

    // Stars
    if (stars !== undefined) {
      const numStars = Number(stars);
      if (numStars < 1 || numStars > 5) {
        return res.status(400).json({ message: 'Số sao phải từ 1–5' });
      }
      hotel.stars = numStars;
    }

    if (description !== undefined) {
      hotel.description = description;
    }

    // Merge new uploaded images
    if (req.files?.length > 0) {
      const uploadedImages = req.files.map(f => `/uploads/hotels/${f.filename}`);
      hotel.images = [...hotel.images, ...uploadedImages];
    }

    await hotel.save();

    return res.json({
      message: 'Cập nhật thông tin khách sạn thành công',
      hotel
    });

  } catch (err) {
    console.error('Update hotel error:', err);
    next(err);
  }
};


// Delete Hotel (Admin) - soft delete or full delete depending on attachment
exports.deleteHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const hotel = await Hotel.findById(id);

    if (!hotel) return res.status(404).json({ message: 'Khách sạn không tồn tại' });

    const isAttached = await Tour.findOne({ 'hotels.hotel': hotel._id, status: 'active' });

    if (isAttached) {
      hotel.status = 'inactive';
      await hotel.save();
      return res.json({ message: 'Khách sạn đang gắn với tour. Đã chuyển sang trạng thái ngừng hoạt động.' });
    }

    await Hotel.deleteOne({ _id: id });

    return res.json({ message: 'Khách sạn đã được xoá thành công.' });

  } catch (err) {
    console.error('Delete hotel error:', err);
    next(err);
  }
};

// List Hotels (Admin/Public)
exports.listHotels = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, minPrice, maxPrice, stars, status, sort } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (minPrice) filter.pricePerNight = { ...(filter.pricePerNight || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.pricePerNight = { ...(filter.pricePerNight || {}), $lte: Number(maxPrice) };

    if (stars) filter.stars = Number(stars);

    let query = Hotel.find(filter);

    if (sort === 'price_asc') query = query.sort({ pricePerNight: 1 });
    else if (sort === 'price_desc') query = query.sort({ pricePerNight: -1 });
    else if (sort === 'stars_desc') query = query.sort({ stars: -1 });

    const total = await Hotel.countDocuments(filter);
    const data = await query
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data
    });

  } catch (err) {
    console.error('List hotel error:', err);
    next(err);
  }
};

// Get Hotel Datail
exports.getHotel = async (req, res, next) => {
  try {
    const id = req.params.id;

    const hotel = await Hotel.findById(id);
    if (!hotel || hotel.status === 'deleted') {
      return res.status(404).json({ message: 'Khách sạn không tồn tại' });
    }

    return res.json({ hotel });

  } catch (err) {
    console.error('Get hotel detail error:', err);
    next(err);
  }
};