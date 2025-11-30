const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header)
      return res.status(401).json({ message: "Không có token" });

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      if (roles.length && !roles.some(r => decoded.roles.includes(r))) {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }

      next();

    } catch (err) {
      res.status(401).json({ message: "Token không hợp lệ" });
    }
  };
};
