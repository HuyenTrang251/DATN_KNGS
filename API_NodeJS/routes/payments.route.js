const express = require('express');
const router = express.Router();
const Controller = require('../controllers/payments.controller');
const {authentic, authorize} = require('../middleware/authentic');

// Duyệt thanh toán cần đăng nhập quyền Admin (role 1)
router.put('/:id', authentic([1]), Controller.update);

router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);
router.post('/', Controller.create);
router.put('/:id', Controller.update);
router.delete('/:id', Controller.delete);

module.exports = router;