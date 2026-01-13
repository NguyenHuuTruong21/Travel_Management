const Guide = require('../models/Guide');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Create guide (Admin)
exports.createGuide = async (req, res, next) => {
  try {
    const { name, phone, email, experience, languages, description, certificates } = req.body;

    // Validation
    if (!name) return res.status(400).json({ message: 'Tên hướng dẫn viên là bắt buộc' });
    if (experience === undefined || Number(experience) < 0) {
      return res.status(400).json({ message: 'Kinh nghiệm phải >= 0 năm' });
    }
    const languageArr = Array.isArray(languages) ? languages : [languages].filter(Boolean);
    if (languageArr.length === 0)
      return res.status(400).json({ message: 'Phải có ít nhất 1 ngôn ngữ' });

    // Check duplicate name
    const exist = await Guide.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
    }

    // Image
    let avatar = req.file
      ? `/uploads/guides/${req.file.filename}`
      : req.body.avatar || null;

    if (!avatar) return res.status(400).json({ message: 'Ảnh đại diện là bắt buộc' });

    const guide = await Guide.create({
      name,
      phone,
      email,
      experience: Number(experience),
      languages: languageArr,
      avatar,
      description: description || '',
      certificates: Array.isArray(certificates)
        ? certificates
        : [certificates].filter(Boolean)
    });

    return res.status(201).json({
      message: 'Hướng dẫn viên đã được thêm thành công.',
      data: guide
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
    next(err);
  }
};

// Update guide (Admin)
exports.updateGuide = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });
    }

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });
    }

    // Check if guide is assigned to ongoing tours
    const now = new Date();
    const ongoingTours = await Tour.find({
      guide: guide._id,
      status: 'active'
    });

    // Check if there are bookings with startDate >= now
    const upcomingBookings = await Booking.find({
      tour: { $in: ongoingTours.map(t => t._id) },
      startDate: { $gte: now },
      status: { $ne: 'Cancelled' }
    });

    const locked = upcomingBookings.length > 0;

    const { name, phone, email, experience, languages, description, certificates, status } = req.body;

    // Restrict change name if guide is active in tours
    if (locked && name && name !== guide.name)
      return res.status(400).json({ message: 'Không thể đổi tên khi đang có tour diễn ra' });

    // Duplicate name check
    if (name && name !== guide.name) {
      const exists = await Guide.findOne({ name, _id: { $ne: id } });
      if (exists) return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
      guide.name = name;
    }

    if (phone !== undefined) guide.phone = phone;
    if (email !== undefined) guide.email = email;
    if (status !== undefined) guide.status = status;

    if (experience !== undefined) {
      if (Number(experience) < 0)
        return res.status(400).json({ message: 'Kinh nghiệm phải >= 0 năm' });
      guide.experience = Number(experience);
    }

    if (languages)
      guide.languages = Array.isArray(languages)
        ? languages
        : [languages].filter(Boolean);

    if (description !== undefined)
      guide.description = description;

    if (certificates !== undefined)
      guide.certificates = Array.isArray(certificates)
        ? certificates
        : [certificates].filter(Boolean);

    if (req.file)
      guide.avatar = `/uploads/guides/${req.file.filename}`;
    else if (req.body.avatar)
      guide.avatar = req.body.avatar;

    await guide.save();

    res.json({
      message: 'Cập nhật thông tin hướng dẫn viên thành công.',
      data: guide
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
    next(err);
  }
};


// Delete guide (Admin)
exports.deleteGuide = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });
    }

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });
    }

    // Check if guide is assigned to tours
    const tours = await Tour.find({ guide: id });

    // Has assigned tours?
    if (tours.length > 0) {
      const now = new Date();
      const upcoming = await Booking.find({
        tour: { $in: tours.map(t => t._id) },
        startDate: { $gte: now },
        status: { $ne: 'Cancelled' }
      });

      if (upcoming.length > 0) {
        guide.status = 'inactive';
        await guide.save();

        return res.json({
          message: 'Hướng dẫn viên có tour sắp diễn ra — chuyển sang trạng thái inactive.',
          data: guide
        });
      }

      // No upcoming bookings → unassign and delete
      await Tour.updateMany({ guide: id }, { $unset: { guide: 1 } });
    }

    await Guide.deleteOne({ _id: id });

    res.json({ message: 'Xoá hướng dẫn viên thành công.' });
  } catch (err) {
    next(err);
  }
};

// List guides (Admin)
exports.listGuides = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      language,
      minExperience,
      status,
      q // search by name
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (language) filter.languages = { $in: [language] };
    if (minExperience) filter.experience = { $gte: Number(minExperience) };
    if (q) filter.name = new RegExp(q, 'i');

    const total = await Guide.countDocuments(filter);
    const guides = await Guide.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const data = await Promise.all(
      guides.map(async g => ({
        ...g,
        toursCount: await Tour.countDocuments({ guide: g._id })
      }))
    );

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
      data
    });
  } catch (err) {
    next(err);
  }
};

// Get guide schedule (Admin)
exports.getGuideSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
    }

    // Get assigned tours to show conflicts
    const assignedTours = await Tour.find({ guide: id })
      .select('_id name')
      .lean();

    return res.json({
      schedule: guide.schedule || [],
      assignedTours
    });
  } catch (error) {
    next(err);
  }
};

// Update guide schedule (Admin)
exports.updateGuideSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });

    const guide = await Guide.findById(id);
    if (!guide)
      return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });

    const { schedule } = req.body;

    if (!Array.isArray(schedule))
      return res.status(400).json({ message: 'Schedule phải là mảng' });

    schedule.forEach(s => {
      if (!s.date)
        throw new Error('Mỗi slot phải có date');
    });

    // Validate conflict
    const tours = await Tour.find({ guide: id });
    if (tours.length > 0) {
      const bookings = await Booking.find({
        tour: { $in: tours.map(t => t._id) },
        status: { $ne: 'Cancelled' }
      });

      for (const slot of schedule) {
        if (slot.isAvailable === false) continue;

        const slotDate = new Date(slot.date).setHours(0, 0, 0, 0);

        for (const b of bookings) {
          const bDate = new Date(b.startDate).setHours(0, 0, 0, 0);
          if (slotDate === bDate)
            return res.status(400).json({
              message: `Lịch trùng ngày có tour đã đặt (${new Date(slotDate).toLocaleDateString('vi-VN')})`
            });
        }
      }
    }

    guide.schedule = schedule;
    await guide.save();

    res.json({
      message: 'Cập nhật lịch thành công.',
      schedule: guide.schedule
    });
  } catch (err) {
    next(err);
  }
};

// Get single guide (for public/display)
exports.getGuide = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });

    const guide = await Guide.findById(id).lean();
    if (!guide || guide.status === 'inactive')
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });

    const toursCount = await Tour.countDocuments({ guide: id });

    res.json({
      guide: {
        ...guide,
        toursCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// Public List Guides
exports.getPublicGuides = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, language } = req.query;
    const filter = { status: 'active' };

    if (language) filter.languages = { $in: [language] };

    const total = await Guide.countDocuments(filter);
    const guides = await Guide.find(filter)
      .select('-phone -email -schedule') // Hide private info
      .sort({ experience: -1 }) // Show experienced guides first
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      data: guides,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};
