const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục upload nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '..', 'uploads', 'reviews');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // chống lỗi file không có phần mở rộng
    const safeExt = ext || '.jpg';

    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  }
});

// Filter file
const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpeg|jpg|png)$/;

  if (!file.originalname) {
    return cb(new Error("Invalid file"));
  }

  const ext = path.extname(file.originalname).toLowerCase();

  // kiểm tra extension
  if (!allowed.test(ext)) {
    return cb(new Error("Only .jpeg, .jpg, .png files are allowed"));
  }

  cb(null, true);
};

// Multer instance
const uploadReview = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = uploadReview;
