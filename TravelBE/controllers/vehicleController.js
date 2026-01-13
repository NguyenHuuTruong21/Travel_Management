const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

const VEHICLE_TYPES = ['bus', 'minivan', 'electric', 'boat', 'train', 'car'];
const VEHICLE_STATUS = ['active', 'inactive', 'maintenance'];

const normalizePlate = plate => (
  (plate || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
);

const hasUpcomingTours = async (vehicleId) => {
  try {
    const tours = await Tour.find({ vehicle: vehicleId }).select('_id').lean();
    if (!tours.length) return false;

    const now = new Date();
    const count = await Booking.countDocuments({
      tour: { $in: tours.map(t => t._id) },
      startDate: { $gte: now },
      status: { $ne: 'Cancelled' }
    });

    return count > 0;
  } catch (err) {
    console.error('hasUpcomingTours error:', err);
    return false;
  }
};


// CREATE
exports.createVehicle = async (req, res) => {
  try {
    const { type, capacity, plateNumber, driverName, status } = req.body;

    if (!type || !VEHICLE_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Loại xe không hợp lệ' });
    }
    if (!capacity || Number(capacity) <= 0) {
      return res.status(400).json({ message: 'Sức chứa phải > 0' });
    }
    if (!plateNumber) {
      return res.status(400).json({ message: 'Biển số là bắt buộc' });
    }

    if (status && !VEHICLE_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái phương tiện không hợp lệ' });
    }

    const normalizedPlate = normalizePlate(plateNumber);
    const exist = await Vehicle.findOne({ plateNumber: normalizedPlate }).lean();
    if (exist) {
      return res.status(400).json({ message: 'Biển số đã tồn tại' });
    }

    // Handle image
    let image = req.file
      ? `/uploads/vehicles/${req.file.filename}`
      : (req.body.image || '');

    const vehicle = await Vehicle.create({
      type,
      capacity: Number(capacity),
      plateNumber: normalizedPlate,
      driverName: driverName || '',
      image,
      status: status || 'active'
    });

    return res.status(201).json({
      message: 'Phương tiện đã được thêm thành công.',
      id: vehicle._id,
      vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Biển số đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// UPDATE
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Vehicle ID không hợp lệ' });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Phương tiện không tồn tại' });
    }

    const { type, capacity, plateNumber, driverName, status } = req.body;

    const upcoming = await hasUpcomingTours(vehicle._id);

    if (type) {
      if (!VEHICLE_TYPES.includes(type)) {
        return res.status(400).json({ message: 'Loại xe không hợp lệ' });
      }
      if (upcoming && type !== vehicle.type) {
        return res.status(400).json({ message: 'Không thể đổi loại xe khi đang gắn tour diễn ra' });
      }
      vehicle.type = type;
    }

    if (capacity !== undefined) {
      if (Number(capacity) <= 0) {
        return res.status(400).json({ message: 'Sức chứa phải > 0' });
      }
      if (upcoming && Number(capacity) !== vehicle.capacity) {
        return res.status(400).json({ message: 'Không thể đổi sức chứa khi phương tiện đang phục vụ tour' });
      }
      vehicle.capacity = Number(capacity);
    }

    if (plateNumber) {
      const normalizedPlate = normalizePlate(plateNumber);
      const exist = await Vehicle.findOne({
        plateNumber: normalizedPlate,
        _id: { $ne: id }
      }).lean();

      if (exist) {
        return res.status(400).json({ message: 'Biển số đã tồn tại' });
      }
      vehicle.plateNumber = normalizedPlate;
    }

    if (driverName !== undefined) {
      vehicle.driverName = driverName;
    }

    if (status) {
      if (!VEHICLE_STATUS.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái phương tiện không hợp lệ' });
      }

      if (upcoming && status === 'inactive') {
        return res.status(400).json({ message: 'Phương tiện đang phục vụ tour, không thể ngừng hoạt động' });
      }

      vehicle.status = status;
    }

    if (req.file) {
      vehicle.image = `/uploads/vehicles/${req.file.filename}`;
    } else if (req.body.image) {
      vehicle.image = req.body.image;
    }

    await vehicle.save();

    return res.json({
      message: 'Cập nhật phương tiện thành công.',
      vehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Biển số đã tồn tại' });
    }

    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// DELETE
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Vehicle ID không hợp lệ' });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Phương tiện không tồn tại' });
    }

    const toursUsingVehicle = await Tour.find({ vehicle: vehicle._id }).lean();

    if (toursUsingVehicle.length > 0) {
      const upcoming = await hasUpcomingTours(vehicle._id);

      if (upcoming) {
        vehicle.status = 'inactive';
        await vehicle.save();
        return res.json({ message: 'Phương tiện đã bị ngừng hoạt động do đang phục vụ tour', vehicle });
      }

      // Detach vehicle from tours
      await Tour.updateMany(
        { vehicle: vehicle._id },
        { $unset: { vehicle: "" } }
      );
    }

    await Vehicle.deleteOne({ _id: id });

    return res.json({ message: 'Xoá phương tiện thành công.' });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// LIST
exports.listVehicles = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      type,
      status,
      minCapacity,
      maxCapacity,
      q
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    // fix capacity filter (allow 0)
    if (minCapacity !== undefined) {
      filter.capacity = { ...(filter.capacity || {}), $gte: Number(minCapacity) };
    }
    if (maxCapacity !== undefined) {
      filter.capacity = { ...(filter.capacity || {}), $lte: Number(maxCapacity) };
    }

    if (q) {
      const search = new RegExp(q, 'i');
      filter.$or = [
        { plateNumber: search },
        { driverName: search }
      ];
    }

    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter)
      .sort({ _id: -1 })     // sửa createdAt → dùng _id cho ổn định
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Count tours
    const ids = vehicles.map(v => v._id);

    const tourCounts = await Tour.aggregate([
      { $match: { vehicle: { $in: ids } } },
      { $group: { _id: '$vehicle', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    tourCounts.forEach(t => {
      countMap[t._id.toString()] = t.count;
    });

    const data = vehicles.map(v => ({
      ...v,
      toursCount: countMap[v._id.toString()] || 0
    }));

    return res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data
    });

  } catch (error) {
    console.error('List vehicles error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get single vehicle (Admin)
exports.getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'ID không hợp lệ' });

    const vehicle = await Vehicle.findById(id).lean();
    if (!vehicle) return res.status(404).json({ message: 'Không tìm thấy phương tiện' });

    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// Public List Vehicles
exports.getPublicVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, type } = req.query;
    const filter = { status: 'active' };

    if (type) filter.type = type;

    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      data: vehicles,
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
