const express = require('express');
const router = express.Router();
const Controller = require('../controllers/students.controller');

router.get('/', Controller.getAll);        // GET /api/students
router.get('/:id', Controller.getById);    // GET /api/students/7
router.put('/:id', Controller.update);     // PUT /api/students/7 (Update thông tin cả 2 bảng)


module.exports = router;