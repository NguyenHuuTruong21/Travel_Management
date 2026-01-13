const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization;

      // Không có header Authorization
      if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Thiếu hoặc sai định dạng token" });
      }

      const token = header.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra token không chứa user hoặc roles
      if (!decoded) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      // Ghi vào req.user để middleware khác sử dụng
      req.user = decoded;

      // Trường roles phải là array
      if (decoded.roles && !Array.isArray(decoded.roles)) {
        return res.status(400).json({ message: "Token role không đúng định dạng" });
      }

      // Kiểm tra quyền (nếu middleware truyền roles)
      if (Array.isArray(roles) && roles.length > 0) {
        const hasPermission = roles.some(
          (role) => decoded.roles?.some(r =>
            typeof r === "string" &&
            r.toLowerCase() === role.toLowerCase()
          )
        );

        if (!hasPermission) {
          return res.status(403).json({ message: "Không có quyền truy cập" });
        }
      }

      next();

    } catch (err) {
      console.error("Auth middleware error:", err);
      return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
    }
  };
};
