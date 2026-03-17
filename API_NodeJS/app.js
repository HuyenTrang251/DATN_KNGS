/**
 * PROJECT: HỆ THỐNG KẾT NỐI GIA SƯ
 * KIẾN TRÚC: MODEL - SERVICE - CONTROLLER - ROUTE
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const createError = require('http-errors');
const fs = require('fs');

const app = express();

// --- 1. CẤU HÌNH CƠ BẢN ---
app.use(cors({
    origin: '*', // Cho phép tất cả các nguồn truy cập (CORS)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- 2. ĐẢM BẢO THƯ MỤC UPLOAD TỒN TẠI ---
const folders = ['uploads/avatars', 'uploads/cvs', 'uploads/videos'];
folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

// --- 3. PHỤC VỤ FILE TĨNH (STATIC FILES) ---
// API trả về tên file, Frontend truy cập qua URL này
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));
app.use('/uploads/cvs', express.static(path.join(__dirname, 'uploads/cvs')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));
app.use(express.static(path.join(__dirname, 'public')));

// --- 4. IMPORT CONTROLLERS HỆ THỐNG ---
const authController = require('./controllers/auth.controller.js');
// const userController = require('./controllers/users.controller');

// --- 5. IMPORT ROUTERS (Tương ứng các bảng trong Database) ---
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/users.route');
const tutorRouter = require('./routes/tutors.route');
const studentRouter = require('./routes/students.route');
const subjectRouter = require('./routes/subjects.route');
const postRouter = require('./routes/posts.route');
const bookingRouter = require('./routes/bookings.route');
const paymentRouter = require('./routes/payments.route');
const reviewRouter = require('./routes/reviews.route');
const reportRouter = require('./routes/reports.route');
const roleRouter = require('./routes/roles.route');
const notificationRouter = require('./routes/notifications.route');
const availabilityRouter = require('./routes/tutor_availabilities.route');

// --- 6. ĐỊNH NGHĨA ROUTE API ---

// Route nghiệp vụ (Đã bao gồm xác thực/phân quyền bên trong từng Route)
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/students', studentRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/posts', postRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/reports', reportRouter);
app.use('/api/roles', roleRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/availabilities', availabilityRouter);

// Mặc định
app.get('/', (req, res) => {
    res.json({ message: "API Kết nối Gia sư đang hoạt động ổn định!" });
});

// --- 7. XỬ LÝ LỖI (ERROR HANDLING) ---

// Catch 404
app.use((req, res, next) => {
    next(createError(404, "Đường dẫn không tồn tại trên hệ thống!"));
});

// Error handler tổng (Cho các lỗi 400, 401, 403, 500)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(">>> ERROR LOG:", err.message);
    
    res.status(status).json({
        success: false,
        status: status,
        message: err.message,
        // Chỉ hiện chi tiết lỗi khi đang ở chế độ dev
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// --- 8. KHỞI CHẠY SERVER ---
// console.log("PORT ENV:", process.env.PORT);
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 SERVER RUNNING AT: http://localhost:${PORT}`);
    console.log(`🔑 SECRET_KEY STATUS: ${process.env.SECRET_KEY ? 'READY' : 'MISSING'}`);
    console.log(`================================================`);
});

module.exports = app;