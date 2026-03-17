const express = require('express');
const router = express.Router();
const Controller = require('../controllers/users.controller');
const authentic = require('../middleware/authentic'); // Middleware xác thực token
const { uploadAvatar } = require('../middleware/multerConfig'); 

router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);
// router.post('/', Controller.create); // Đăng ký
router.post('/add-employee', authentic(['admin']), Controller.addEmployee); // thêm nhân viên
router.put('/:id', authentic(), Controller.update); // Sửa profile (cần login)
router.delete('/:id', authentic(['admin']), Controller.delete); // Chỉ admin mới được xóa

// Route riêng cho đổi mật khẩu
router.post('/change-password', authentic(), Controller.changePassword);
// Route này dùng chung cho cả Học viên, Gia sư, Admin (chỉ cần login)
router.post('/upload-avatar', authentic(), uploadAvatar, Controller.updateAvatar);

module.exports = router;