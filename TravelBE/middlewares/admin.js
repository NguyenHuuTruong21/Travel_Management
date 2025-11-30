// Usage: const admin = require('../middlewares/admin'); router.post(..., auth(), admin, handler)
module.exports = (req, res, next) => {
  try {
    // auth middleware must set req.user with id and roles
    const user = req.user;
    if (!user || !user.roles) return res.status(401).json({ message: 'Unauthorized' });
    if (!user.roles.includes('admin')) return res.status(403).json({ message: 'Require admin role' });
    next();
  } catch (err) {
    next(err);
  }
};