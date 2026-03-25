const express = require('express');
const router = express.Router();
const Controller = require('../controllers/post_applications.controller');
const { authentic } = require('../middleware/authentic');

router.post('/', authentic([2]), Controller.create);

// Lấy danh sách ứng tuyển theo post_id
router.get('/:postId', Controller.getByPostId);

// Cập nhật trạng thái ứng tuyển (Học viên phản hồi)
router.put('/:id/status', authentic(), Controller.updateStatus);

module.exports = router;