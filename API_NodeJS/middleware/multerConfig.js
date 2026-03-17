const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Cấu hình chung ---
// Định nghĩa đường dẫn. Sử dụng path.join để tương thích với mọi hệ điều hành.
const uploadsDir = path.join(__dirname, '../uploads'); // Thư mục 'uploads' ở gốc dự án
const cvsDir = path.join(__dirname, '../uploadsCV');     // Thư mục 'uploadsCV' ở gốc dự án

// Đảm bảo các thư mục tồn tại, nếu không thì tạo mới
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(cvsDir)) fs.mkdirSync(cvsDir, { recursive: true });


// --- Định nghĩa các Storage Engine ---

// Storage cho ảnh đại diện (avatar)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'img-' + Date.now() + path.extname(file.originalname));
  },
});

// Storage cho file CV
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = 'cv-' + Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


// --- Tạo và Export các Middleware ---

// Middleware để xử lý upload một file ảnh đại diện duy nhất (trường 'img')
const uploadAvatar = multer({
  storage: avatarStorage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file 5MB
//   fileFilter: (req, file, cb) => {
//     // Chỉ cho phép upload file ảnh
//     const filetypes = /jpeg|jpg|png|gif/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('Lỗi: Chỉ cho phép tải lên tệp ảnh!'));
//   }
}).single('img');

// Middleware để xử lý upload một file CV duy nhất (trường 'cv')
const uploadCV = multer({
  storage: cvStorage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file 10MB
//   fileFilter: (req, file, cb) => {
//     // Chỉ cho phép upload file văn bản
//     const filetypes = /pdf|doc|docx/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('Lỗi: Chỉ cho phép tải lên tệp PDF, DOC, DOCX!'));
//   }
}).single('cv');


// Middleware để xử lý nhiều loại file cùng lúc (khi tạo/cập nhật profile tutor)
const uploadTutorProfileFiles = multer({
}).fields([
    { name: 'img', maxCount: 1 }, // Tên field cho ảnh đại diện
    { name: 'cv', maxCount: 1 }      // Tên field cho CV
]);


// Export tất cả các middleware đã tạo
module.exports = {
    uploadAvatar,
    uploadCV,
    uploadTutorMedia: uploadTutorProfileFiles, // Gán tên cũ sang tên mới cho khớp với Route
};