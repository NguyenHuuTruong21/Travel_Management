const Hotel = require('../models/Hotel');
const Tour = require('../models/Tour');

// Create Hotel (Amdin)
exports.createHotel = async (req, res, next) => {
    try {
        const { name, address, amenities, pricePerNight, stars} = req.body;

        if (!name || !address) return res.status(400).json({ message: 'Tên và địa chỉ bắt buộc' });

        const exist = await Hotel.findOne({ name });
        if (exist) return res.status(400).json({ message: 'Tên khách sạn đã tồn tại' });

        const images = [];
        if (req.files && req.files.length) req.files.forEach(f => images.push(`/uploads/hotels/${f.filename}`));
        if(images.length === 0) return res.status(400).json({ message: 'Cần ít nhất 1 ảnh minh họa' });

        if (Number(pricePerNight) < 0) return res.status(400).json({ message: 'Giá phòng không hợp lệ' });

        const hotel = await Hotel.create({
            name,
            slug: slugify(name, { lower: true }),
            address,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []),
            pricePerNight: Number(pricePerNight || 0),
            images,
            stars: Number(stars || 3)
        });

        res.status(201).json({ message: 'Khách sạn đã được thêm thành công', hotelId: hotel._id, hotel });
    }
    catch (err) {
        next(err);
    }
}

// Upload Hotel (Admin)
exports.updateHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const h = await Hotel.findById(id);
    if (!h || h.status === 'deleted') return res.status(404).json({ message: 'Khách sạn không tồn tại' });

    const { name, address, amenities, pricePerNight, stars } = req.body;

    if (name && name !== h.name) {
      const dup = await Hotel.findOne({ name, _id: { $ne: id } });
      if (dup) return res.status(400).json({ message: 'Tên khách sạn trùng với khách sạn khác' });
      h.name = name;
      h.slug = slugify(name, { lower: true });
    }

    // If hotel is attached to any ongoing tour, restrict certain updates
    const toursUsing = await Tour.find({ 'hotels.hotel': h._id, status: 'active' }).limit(1);
    const isAttachedActive = toursUsing && toursUsing.length > 0;

    if (address && !isAttachedActive) h.address = address;
    else if (address && isAttachedActive) {
      // restrict address change
      // you may still allow update of some fields: leave as is or set flag
    }

    if (typeof amenities !== 'undefined') h.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    if (typeof pricePerNight !== 'undefined') {
      if (Number(pricePerNight) < 0) return res.status(400).json({ message: 'Giá phòng không hợp lệ' });
      h.pricePerNight = Number(pricePerNight);
    }
    if (typeof stars !== 'undefined') h.stars = Number(stars);

    // images: merge uploaded images
    if (req.files && req.files.length) {
      const imgs = req.files.map(f => `/uploads/hotels/${f.filename}`);
      h.images = h.images.concat(imgs);
    }

    await h.save();
    res.json({ message: 'Cập nhật thông tin khách sạn thành công', hotel: h });
  } catch (err) {
    next(err);
  }
};

// Delete Hotel (Admin) - soft delete or full delete depending on attachment
exports.deleteHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: 'Khách sạn không tồn tại' });

    // check if hotel is attached to active tours
    const attached = await Tour.findOne({ 'hotels.hotel': hotel._id, status: 'active' });
    if (attached) {
      hotel.status = 'inactive';
      await hotel.save();
      return res.json({ message: 'Khách sạn đang gắn với tour diễn ra. Đã chuyển sang trạng thái ngừng hoạt động.' });
    }

    // not attached -> delete
    await Hotel.deleteOne({ _id: id });
    return res.json({ message: 'Khách sạn đã được xoá thành công.' });
  } catch (err) {
    next(err);
  }
};

// List Hotels (Admin/Public)
exports.listHotels = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, minPrice, maxPrice, stars, status, sort } = req.query;
    const filter = {};
    if (typeof status !== 'undefined') filter.status = status;
    if (minPrice) filter.pricePerNight = { ...(filter.pricePerNight||{}), $gte: Number(minPrice) };
    if (maxPrice) filter.pricePerNight = { ...(filter.pricePerNight||{}), $lte: Number(maxPrice) };
    if (stars) filter.stars = Number(stars);

    let query = Hotel.find(filter);

    if (sort === 'price_asc') query = query.sort({ pricePerNight: 1 });
    else if (sort === 'price_desc') query = query.sort({ pricePerNight: -1 });
    else if (sort === 'stars_desc') query = query.sort({ stars: -1 });

    const total = await Hotel.countDocuments(filter);
    const data = await query.skip((page-1)*limit).limit(Number(limit)).lean();

    res.json({ page: Number(page), totalPages: Math.ceil(total/limit), total, data });
  } catch (err) {
    next(err);
  }
};

// Get Hotel Datail
exports.getHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const hotel = await Hotel.findById(id);
    if (!hotel || hotel.status === 'deleted') return res.status(404).json({ message: 'Khách sạn không tồn tại' });
    res.json({ hotel });
  } catch (err) {
    next(err);
  }
};