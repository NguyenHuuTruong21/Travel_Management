module.exports = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Lỗi server" });
};
