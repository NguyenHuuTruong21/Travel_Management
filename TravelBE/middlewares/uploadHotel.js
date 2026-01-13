const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads/hotels nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '..', 'uploads', 'hotels');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        // Ngăn lỗi file không có đuôi
        const safeExt = ext || '.png';

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
        cb(null, fileName);
    }
});

// Lọc file
const fileFilter = (req, file, cb) => {
    const allowed = /\.(jpeg|jpg|png|gif)$/i;
    const ext = path.extname(file.originalname).toLowerCase();

    // Ngăn lỗi crash nếu không có đuôi file
    if (!ext) {
        return cb(new Error('File không hợp lệ. Vui lòng chọn ảnh .jpeg, .jpg, .png hoặc .gif'), false);
    }

    // Kiểm tra loại file
    if (!allowed.test(ext)) {
        return cb(new Error('Chỉ cho phép file ảnh JPEG/JPG/PNG/GIF'), false);
    }

    cb(null, true);
};

// Multer middleware
const uploadHotel = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = uploadHotel;
