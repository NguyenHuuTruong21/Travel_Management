const SystemLog = require('../models/SystemLog');

// Hàm ghi log hành động Admin/Quan trọng
module.exports.logAdminAction = async ({ action, actor, target = null, details = '', ipAddress = '' }) => {
    try {
        await SystemLog.create({
            action,
            actor,
            target,
            details,
            ipAddress
        });
    }
    catch (err) {
        console.error('Failed to write System Log:', err);
    }
}