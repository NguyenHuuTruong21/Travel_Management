const mongoose = require('mongoose');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');

// Helper to log system actions
const logAction = async (action, actorId, target, details, req) => {
    try {
        await SystemLog.create({
            action,
            actor: actorId,
            target,
            details,
            ipAddress: req.ip || req.connection?.remoteAddress || ''
        });
    } catch (e) {
        console.error('Failed to log action', e);
    }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 20);
        const { role, status, search } = req.query;

        const filter = {};
        if (role) filter.roles = role;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .select('-password -refreshTokens -verificationToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            total,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// PUT /api/admin/users/:id/ban
exports.banUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // optional reason
        const adminId = req.user.id;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent banning other admins (unless super admin logic exists, simplified here)
        if (user.roles.includes('admin') && String(user._id) !== String(adminId)) {
            return res.status(403).json({ message: 'Cannot ban another admin' });
        }
        user.locked = !user.locked; // Toggle lock
        if (user.locked) {
            user.refreshTokens = []; // Force logout
        }

        await user.save();

        await logAction(
            user.locked ? 'BAN_USER' : 'UNBAN_USER',
            adminId,
            user._id,
            { reason, userEmail: user.email },
            req
        );

        res.json({
            message: user.locked ? 'User has been banned' : 'User has been unbanned',
            user: { _id: user._id, locked: user.locked, status: user.status }
        });

    } catch (err) {
        next(err);
    }
};

// GET /api/admin/logs
exports.getSystemLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 20);
        const skip = (page - 1) * limit;

        const [total, logs] = await Promise.all([
            SystemLog.countDocuments(),
            SystemLog.find()
                .populate('actor', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            total,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};
