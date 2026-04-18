const express = require('express');
const router = express.Router();
const Controller = require('../controllers/students.controller');
const { authentic } = require('../middleware/authentic');

router.get('/', Controller.getAll);        // GET /api/students
router.get('/:id', authentic(), Controller.getByIdUser);      // GET /api/students/7
router.put('/:id', authentic(), Controller.update);           // PUT /api/students/7 (Update thông tin cả 2 bảng)

module.exports = router;