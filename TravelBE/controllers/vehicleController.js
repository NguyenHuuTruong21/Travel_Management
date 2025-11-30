const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

const VEHICLE_TYPES = ['bus', 'minivan', 'electric', 'boat', 'train', 'car'];

const normalizePlate = plate => (plate || '').trim().toUpperCase();

const hasUpcomingTours = async vehicleId => {
  const tours = await Tour.find({ vehicle: vehicleId }).select('_id');
  if (!tours.length) return false;

  const now = new Date();
  const count = await Booking.countDocuments({
    tour: { $in: tours.map(t => t._id) },
    startDate: { $gte: now },
    status: { $ne: 'Cancelled' }
  });

  return count > 0;
};

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

    const normalizedPlate = normalizePlate(plateNumber);
    const exist = await Vehicle.findOne({ plateNumber: normalizedPlate });
    if (exist) {
      return res.status(400).json({ message: 'Biển số đã tồn tại' });
    }

    let image = '';
    if (req.file) {
      image = `/uploads/vehicles/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

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

    const {
      type,
      capacity,
      plateNumber,
      driverName,
      status
    } = req.body;

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
      if (Number(capacity) <= 0) return res.status(400).json({ message: 'Sức chứa phải > 0' });
      if (upcoming && Number(capacity) !== vehicle.capacity) {
        return res.status(400).json({ message: 'Không thể đổi sức chứa khi phương tiện đang phục vụ tour' });
      }
      vehicle.capacity = Number(capacity);
    }

    if (plateNumber) {
      const normalizedPlate = normalizePlate(plateNumber);
      const exist = await Vehicle.findOne({ plateNumber: normalizedPlate, _id: { $ne: id } });
      if (exist) {
        return res.status(400).json({ message: 'Biển số đã tồn tại' });
      }
      vehicle.plateNumber = normalizedPlate;
    }

    if (driverName !== undefined) {
      vehicle.driverName = driverName;
    }

    if (status) {
      vehicle.status = status;
    }

    if (req.file) {
      vehicle.image = `/uploads/vehicles/${req.file.filename}`;
    } else if (req.body.image) {
      vehicle.image = req.body.image;
    }

    await vehicle.save();

    return res.json({ message: 'Cập nhật phương tiện thành công.', vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Biển số đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

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

    const toursUsingVehicle = await Tour.find({ vehicle: vehicle._id });

    if (toursUsingVehicle.length > 0) {
      const upcoming = await hasUpcomingTours(vehicle._id);
      if (upcoming) {
        vehicle.status = 'inactive';
        await vehicle.save();
        return res.json({ message: 'Phương tiện đã bị ngừng hoạt động', vehicle });
      }

      // No upcoming bookings, detach from tours before delete
      await Tour.updateMany(
        { vehicle: vehicle._id },
        { $unset: { vehicle: 1 } }
      );
    }

    await Vehicle.deleteOne({ _id: id });
    return res.json({ message: 'Xoá phương tiện thành công.' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.listVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      minCapacity,
      maxCapacity,
      q
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (minCapacity) filter.capacity = { ...(filter.capacity || {}), $gte: Number(minCapacity) };
    if (maxCapacity) filter.capacity = { ...(filter.capacity || {}), $lte: Number(maxCapacity) };
    if (q) filter.$or = [
      { plateNumber: new RegExp(q, 'i') },
      { driverName: new RegExp(q, 'i') }
    ];

    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Attach number of tours referencing each vehicle
    const vehicleIds = vehicles.map(v => v._id);
    const tourCounts = await Tour.aggregate([
      { $match: { vehicle: { $in: vehicleIds } } },
      { $group: { _id: '$vehicle', count: { $sum: 1 } } }
    ]);
    const countMap = tourCounts.reduce((acc, cur) => {
      acc[cur._id.toString()] = cur.count;
      return acc;
    }, {});

    const data = vehicles.map(v => ({
      ...v,
      toursCount: countMap[v._id.toString()] || 0
    }));

    return res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data
    });
  } catch (error) {
    console.error('List vehicles error:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


