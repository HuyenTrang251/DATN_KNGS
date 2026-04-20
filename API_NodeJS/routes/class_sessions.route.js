const express = require('express');
const router = express.Router();
const Controller = require('../controllers/class_sessions.controller');
const { authentic } = require('../middleware/authentic');

// 1. Route lấy lớp của tôi (Gia sư/Học viên) - PHẢI ĐỂ LÊN ĐẦU
router.get('/my-classes', authentic(), Controller.getMyClasses);

// 2. Route Admin lấy tất cả
router.get('/admin', authentic([1]), Controller.adminGetAll);

// 3. Route xác nhận hoàn thành (Học viên xác nhận để GS cộng điểm)
router.post('/:id/confirm-complete', authentic([3]), Controller.confirmComplete);

// 4. Các route CRUD cơ bản
// router.get('/:id', Controller.getById);
// router.post('/', Controller.create);
router.put('/:id', Controller.update);
// router.delete('/:id', Controller.delete);

module.exports = router;