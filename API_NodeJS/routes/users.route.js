const express = require('express');
const router = express.Router();
const Controller = require('../controllers/users.controller');
const { authentic } = require('../middleware/authentic'); // Middleware xác thực token
const { uploadAvatar } = require('../middleware/multerConfig'); 

router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);
// router.post('/', Controller.create); // Đăng ký
router.post('/add-employee', authentic([1]), Controller.addEmployee); // thêm nhân viên
// Admin cập nhật trạng thái user 
router.put('/status/:id', authentic([1]), Controller.updateStatus);
router.put('/:id', authentic(), Controller.updateProfile); // Sửa profile (cần login)
router.delete('/:id', authentic([1]), Controller.delete); // Chỉ admin mới được xóa

// Route riêng cho đổi mật khẩu
router.post('/change-password', authentic(), Controller.changePassword);
// Route này dùng chung cho cả Học viên, Gia sư, Admin (chỉ cần login)
router.post('/upload-avatar', authentic(), uploadAvatar, Controller.updateAvatar);

router.get('/admin/dashboard-summary', authentic([1]), Controller.getAdminDashboardCounts);
router.get('/admin/pending-counts', authentic([1]), Controller.getAdminBadgeCounts);
module.exports = router;