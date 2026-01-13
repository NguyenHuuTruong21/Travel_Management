const Setting = require('../models/Setting');
const SystemLog = require('../models/SystemLog');

// GET /api/admin/settings
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Setting.find().lean();

        // Seed default settings if empty
        if (settings.length === 0) {
            const defaults = [
                { key: 'site_name', value: 'Travel Management', description: 'Tên hiển thị của website', type: 'string' },
                { key: 'contact_email', value: 'admin@example.com', description: 'Email liên hệ chính', type: 'string' },
                { key: 'hotline', value: '1900 1234', description: 'Số hotline hiển thị', type: 'string' },
                { key: 'maintenance_mode', value: 'false', description: 'Bảo trì hệ thống', type: 'boolean' }
            ];

            await Setting.insertMany(defaults);
            settings = await Setting.find().lean();
        }

        return res.json({
            success: true,
            count: settings.length,
            data: settings
        });
    } catch (err) {
        console.error('Error getSettings:', err);
        return next(err);
    }
};

// PUT /api/admin/settings
exports.updateSetting = async (req, res, next) => {
    try {
        const { key, value, description, type } = req.body;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: 'Key is required'
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Missing user'
            });
        }

        const adminId = req.user.id;

        // Validate type
        const VALID_TYPES = ['string', 'number', 'boolean', 'json'];
        const finalType = VALID_TYPES.includes(type) ? type : 'string';

        let setting = await Setting.findOne({ key });

        // Nếu tồn tại → update
        if (setting) {
            const oldValue = setting.value;

            setting.value = value;
            if (description !== undefined) setting.description = description;
            if (type !== undefined) setting.type = finalType;

            setting.lastUpdatedBy = adminId;
            await setting.save();

            await SystemLog.create({
                action: 'UPDATE_SETTING',
                actor: adminId,
                target: setting._id,
                details: {
                    key,
                    oldValue,
                    newValue: value
                },
                ipAddress: req.ip
            });
        }
        // Nếu chưa → tạo mới
        else {
            setting = await Setting.create({
                key,
                value,
                description: description || '',
                type: finalType,
                lastUpdatedBy: adminId
            });

            await SystemLog.create({
                action: 'CREATE_SETTING',
                actor: adminId,
                target: setting._id,
                details: { key, value },
                ipAddress: req.ip
            });
        }

        return res.json({
            success: true,
            message: 'Setting saved successfully',
            data: setting
        });

    } catch (err) {
        console.error('Error updateSetting:', err);
        return next(err);
    }
};
