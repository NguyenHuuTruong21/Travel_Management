const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '..', 'uploads', 'users');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const safeExt = ext.toLowerCase();

        // Tránh trường hợp file không có extension hoặc extension lạ
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;

        cb(null, filename);
    }
});

// Filter file upload
const fileFilter = (req, file, cb) => {
    const allowed = /\.(jpeg|jpg|png|gif|webp)$/i;
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowed.test(ext)) {
        return cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, WEBP allowed'), false);
    }

    cb(null, true);
};

// Cấu hình multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Giới hạn 2MB cho avatar
    }
});

module.exports = upload;
