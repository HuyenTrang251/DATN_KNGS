const express = require('express');
const router = express.Router();
const Controller = require('../controllers/reviews.controller');
const { authentic } = require('../middleware/authentic');

// Lấy tất cả đánh giá (Admin)
router.get('/admin', authentic([1]), Controller.adminGetAll);

// Thao tác của người dùng
router.post('/', authentic([2, 3]), Controller.create);    // Học viên/Gia sư đánh giá
router.put('/:id', authentic([2, 3]), Controller.update);  // Sửa đánh giá
router.delete('/:id', authentic([1, 2, 3]), Controller.delete); // Admin hoặc chủ nhân xóa

module.exports = router;