// middlewares/admin.js
// Usage:
// const auth = require('../middlewares/auth');
// const admin = require('../middlewares/admin');
// router.post(..., auth, admin, handler);

module.exports = (req, res, next) => {
  try {
    // Kiểm tra xem middleware auth() đã gán req.user chưa
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized: Missing authentication'
      });
    }

    // Kiểm tra định dạng roles
    if (!Array.isArray(user.roles)) {
      return res.status(400).json({
        message: 'Invalid role data format'
      });
    }

    // Kiểm tra quyền admin
    const hasAdminRole = user.roles.some(
      (role) => typeof role === 'string' && role.toLowerCase() === 'admin'
    );

    if (!hasAdminRole) {
      return res.status(403).json({
        message: 'Access denied: Admin role required'
      });
    }

    // Nếu hợp lệ → cho phép đi tiếp
    next();

  } catch (err) {
    console.error('Admin middleware error:', err);
    next(err);
  }
};
