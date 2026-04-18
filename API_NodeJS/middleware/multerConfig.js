const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đường dẫn các thư mục
const avatarsDir = path.join(__dirname, '../uploads/avatars');
const cvsDir = path.join(__dirname, '../uploads/cvs');
const videosDir = path.join(__dirname, '../uploads/videos');

// Tạo thư mục nếu chưa có
[avatarsDir, cvsDir, videosDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- Dùng 1 Storage thông minh cho việc upload nhiều loại file ---
const dynamicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tự động chọn thư mục dựa trên tên field gửi từ FE
    if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else if (file.fieldname === 'cv') {
      cb(null, cvsDir);
    } else if (file.fieldname === 'video') {
      cb(null, videosDir);
    } else {
      cb(new Error('Field không hợp lệ'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // Đặt tiền tố cho file để dễ nhận diện
    if (file.fieldname === 'avatar') cb(null, `img-${uniqueSuffix}${ext}`);
    else if (file.fieldname === 'cv') cb(null, `cv-${uniqueSuffix}${ext}`);
    else if (file.fieldname === 'video') cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

// Middleware xử lý nhiều field cùng lúc
const uploadTutorMedia = multer({ 
    storage: dynamicStorage 
}).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

module.exports = {
    uploadAvatar: multer({ storage: dynamicStorage }).single('avatar'), // Dùng chung storage cho đồng bộ
    uploadCV: multer({ storage: dynamicStorage }).single('cv'),
    uploadTutorMedia // Xuất cái này ra để dùng trong tutor.route.js
};