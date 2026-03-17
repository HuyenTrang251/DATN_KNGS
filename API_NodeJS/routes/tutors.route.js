const express = require('express');
const router = express.Router();
const Controller = require('../controllers/tutors.controller');
const { uploadTutorMedia } = require('../middleware/multerConfig');
const authentic = require('../middleware/authentic');

console.log("-----------------------------------------");
console.log("DANH SÁCH HÀM TRONG TUTOR CONTROLLER:");
console.log(Controller); 
console.log("-----------------------------------------");

// Cho phép upload ảnh và CV khi tạo/cập nhật Profile gia sư
router.put('/:id', 
    authentic(['admin', 'tutor']), // Chỉ admin hoặc chính gia sư đó mới được sửa
    uploadTutorMedia, 
    Controller.update
);

// Chỉ Gia sư mới có quyền upload CV và Video giới thiệu
router.post('/upload-media', 
    authentic(['tutor']), 
    uploadTutorMedia, 
    Controller.updateMedia
);
router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);
router.post('/', Controller.create);
router.put('/:id', Controller.update);
router.delete('/:id', Controller.delete);

module.exports = router;