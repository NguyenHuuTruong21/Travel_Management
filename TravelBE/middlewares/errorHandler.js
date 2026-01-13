// middlewares/errorHandler.js

module.exports = (err, req, res, next) => {
  // Log chi tiết lỗi giúp debugging
  console.error("ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Nếu response đã gửi → không gửi gì thêm
  if (res.headersSent) {
    return next(err);
  }

  // Xử lý lỗi HTTP có status riêng → ví dụ: 400, 401, 403, 404, 409,...
  if (err.statusCode || err.status) {
    return res.status(err.statusCode || err.status).json({
      success: false,
      message: err.message || "Request error",
    });
  }

  // Trường hợp lỗi từ MongoDB (Validation Error / Cast Error)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Lỗi trùng dữ liệu MongoDB
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: `Duplicate field: ${Object.keys(err.keyValue).join(", ")}`,
    });
  }

  // Lỗi JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token đã hết hạn",
    });
  }

  // Lỗi server mặc định
  res.status(500).json({
    success: false,
    message: err.message || "Lỗi server",
  });
};
