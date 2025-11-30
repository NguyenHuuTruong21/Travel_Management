const Guide = require('../models/Guide');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Create guide (Admin)
exports.createGuide = async (req, res) => {
  try {
    const { name, experience, languages, description, certificates } = req.body;

    // Validation
    if (!name) return res.status(400).json({ message: 'Tên hướng dẫn viên là bắt buộc' });
    if (experience === undefined || Number(experience) < 0) {
      return res.status(400).json({ message: 'Kinh nghiệm phải >= 0 năm' });
    }
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({ message: 'Phải có ít nhất 1 ngôn ngữ' });
    }

    // Check duplicate name
    const exist = await Guide.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
    }

    // Handle avatar upload
    let avatar = '';
    if (req.file) {
      avatar = `/uploads/guides/${req.file.filename}`;
    } else if (req.body.avatar) {
      avatar = req.body.avatar;
    } else {
      return res.status(400).json({ message: 'Ảnh đại diện là bắt buộc' });
    }

    const guide = await Guide.create({
      name,
      experience: Number(experience),
      languages: Array.isArray(languages) ? languages : [languages],
      avatar,
      description: description || '',
      certificates: certificates ? (Array.isArray(certificates) ? certificates : [certificates]) : []
    });

    return res.status(201).json({ 
      message: 'Hướng dẫn viên đã được thêm thành công.',
      id: guide._id,
      guide 
    });
  } catch (error) {
    console.error('Create guide error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Update guide (Admin)
exports.updateGuide = async (req, res) => {
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
    }).populate('guide');

    // Check if there are bookings with startDate >= now
    const upcomingBookings = await Booking.find({
      tour: { $in: ongoingTours.map(t => t._id) },
      startDate: { $gte: now },
      status: { $ne: 'Cancelled' }
    });

    const hasOngoingTours = upcomingBookings.length > 0;

    const { name, experience, languages, description, certificates } = req.body;

    // If guide has ongoing tours, restrict name and avatar changes
    if (hasOngoingTours) {
      if (name && name !== guide.name) {
        return res.status(400).json({ 
          message: 'Không thể thay đổi tên khi hướng dẫn viên đang gắn tour đang diễn ra' 
        });
      }
    }

    // Check duplicate name if changing
    if (name && name !== guide.name) {
      const exist = await Guide.findOne({ name, _id: { $ne: id } });
      if (exist) {
        return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
      }
      guide.name = name;
    }

    if (experience !== undefined) {
      if (Number(experience) < 0) {
        return res.status(400).json({ message: 'Kinh nghiệm phải >= 0 năm' });
      }
      guide.experience = Number(experience);
    }

    if (languages) {
      guide.languages = Array.isArray(languages) ? languages : [languages];
    }

    if (description !== undefined) {
      guide.description = description;
    }

    if (certificates !== undefined) {
      guide.certificates = Array.isArray(certificates) ? certificates : [certificates];
    }

    // Handle avatar update
    if (req.file) {
      // If has ongoing tours, warn but allow (or restrict based on requirement)
      if (hasOngoingTours) {
        // Still allow but could add warning
      }
      guide.avatar = `/uploads/guides/${req.file.filename}`;
    } else if (req.body.avatar) {
      guide.avatar = req.body.avatar;
    }

    await guide.save();

    return res.json({ 
      message: 'Cập nhật thông tin hướng dẫn viên thành công.',
      guide 
    });
  } catch (error) {
    console.error('Update guide error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tên hướng dẫn viên đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Delete guide (Admin)
exports.deleteGuide = async (req, res) => {
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
    const toursWithGuide = await Tour.find({ guide: guide._id });
    
    if (toursWithGuide.length > 0) {
      // Check if any tour has upcoming bookings
      const now = new Date();
      const upcomingBookings = await Booking.find({
        tour: { $in: toursWithGuide.map(t => t._id) },
        startDate: { $gte: now },
        status: { $ne: 'Cancelled' }
      });

      if (upcomingBookings.length > 0) {
        // Mark as inactive instead of deleting
        guide.status = 'inactive';
        await guide.save();
        return res.json({ 
          message: 'Hướng dẫn viên đã bị ngừng hoạt động',
          guide 
        });
      } else {
        // No upcoming bookings, can delete but first remove from tours
        await Tour.updateMany(
          { guide: guide._id },
          { $unset: { guide: 1 } }
        );
        await Guide.deleteOne({ _id: id });
        return res.json({ message: 'Xoá thành công.' });
      }
    } else {
      // Guide not assigned to any tour, can delete
      await Guide.deleteOne({ _id: id });
      return res.json({ message: 'Xoá thành công.' });
    }
  } catch (error) {
    console.error('Delete guide error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// List guides (Admin)
exports.listGuides = async (req, res) => {
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

    if (status) {
      filter.status = status;
    }

    if (language) {
      filter.languages = { $in: [language] };
    }

    if (minExperience !== undefined) {
      filter.experience = { $gte: Number(minExperience) };
    }

    if (q) {
      filter.name = new RegExp(q, 'i');
    }

    const total = await Guide.countDocuments(filter);
    
    const guides = await Guide.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Get tours count for each guide
    const guidesWithToursCount = await Promise.all(
      guides.map(async (guide) => {
        const toursCount = await Tour.countDocuments({ guide: guide._id });
        return {
          ...guide,
          toursCount
        };
      })
    );

    return res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data: guidesWithToursCount
    });
  } catch (error) {
    console.error('List guides error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get guide schedule (Admin)
exports.getGuideSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });
    }

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });
    }

    // Get assigned tours to show conflicts
    const assignedTours = await Tour.find({ guide: guide._id })
      .select('_id name')
      .lean();

    return res.json({
      schedule: guide.schedule || [],
      assignedTours: assignedTours
    });
  } catch (error) {
    console.error('Get guide schedule error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Update guide schedule (Admin)
exports.updateGuideSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });
    }

    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });
    }

    const { schedule } = req.body; // Array of { date, startTime, endTime, isAvailable }

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Schedule phải là một mảng' });
    }

    // Validate schedule slots
    for (const slot of schedule) {
      if (!slot.date) {
        return res.status(400).json({ message: 'Mỗi slot phải có date' });
      }
    }

    // Check for conflicts with assigned tours
    const assignedTours = await Tour.find({ guide: guide._id })
      .populate('guide')
      .lean();

    if (assignedTours.length > 0) {
      // Get bookings for these tours
      const tourIds = assignedTours.map(t => t._id);
      const bookings = await Booking.find({
        tour: { $in: tourIds },
        status: { $ne: 'Cancelled' }
      }).lean();

      // Check if any new schedule slot conflicts with existing bookings
      for (const slot of schedule) {
        if (slot.isAvailable === false) continue; // Skip unavailable slots

        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);

        for (const booking of bookings) {
          const bookingDate = new Date(booking.startDate);
          bookingDate.setHours(0, 0, 0, 0);

          if (bookingDate.getTime() === slotDate.getTime()) {
            return res.status(400).json({ 
              message: `Không thể ghi lịch trùng với tour đã gán (ngày ${slotDate.toLocaleDateString('vi-VN')})` 
            });
          }
        }
      }
    }

    guide.schedule = schedule;
    await guide.save();

    return res.json({ 
      message: 'Lịch trống được cập nhật thành công',
      schedule: guide.schedule 
    });
  } catch (error) {
    console.error('Update guide schedule error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get single guide (for public/display)
exports.getGuide = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Guide ID không hợp lệ' });
    }

    const guide = await Guide.findById(id).lean();
    if (!guide || guide.status === 'inactive') {
      return res.status(404).json({ message: 'Hướng dẫn viên không tồn tại' });
    }

    // Get tours count
    const toursCount = await Tour.countDocuments({ guide: guide._id });

    return res.json({
      guide: {
        ...guide,
        toursCount
      }
    });
  } catch (error) {
    console.error('Get guide error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

