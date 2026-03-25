// const express = require('express');
// const router = express.Router();
// const Controller = require('../controllers/tutors.controller');
// const { uploadTutorMedia } = require('../middleware/multerConfig');
// const { authentic } = require('../middleware/authentic');

// console.log("-----------------------------------------");
// console.log("DANH SÁCH HÀM TRONG TUTOR CONTROLLER:");
// console.log(Controller); 
// console.log("-----------------------------------------");

// // // Cho phép upload ảnh và CV khi tạo/cập nhật Profile gia sư
// // router.put('/:id', 
// //     authentic(['admin', 'tutor']), // Chỉ admin hoặc chính gia sư đó mới được sửa
// //     uploadTutorMedia, 
// //     Controller.update
// // );

// // Chỉ Gia sư mới có quyền upload CV và Video giới thiệu
// router.post('/upload-media', 
//     authentic(['tutor']), 
//     uploadTutorMedia, 
//     Controller.updateMedia
// );
// // Public
// router.get('/approved', Controller.getPublicList);

// // Admin
// router.get('/', authentic([1]), Controller.getAllAdmin);
// router.put('/verify/:id', authentic([1]), Controller.verifyTutor);
// router.put('/lock/:userId', authentic([1]), Controller.lockAccount);
// router.put('/approve-status/:id', authentic([1]), (req, res) => {
//     // API duyệt gia sư đơn giản
//     db.query('UPDATE tutors SET approval_status = ? WHERE tutor_id = ?', [req.body.status, req.params.id]);
// });

// // Tutor
// router.put('/profile', authentic([2]), Controller.updateProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const Controller = require('../controllers/tutors.controller');
const { uploadTutorMedia } = require('../middleware/multerConfig');
const { authentic } = require('../middleware/authentic');

// Public
router.get('/approved', Controller.getPublicList);
router.get('/detail/:id', Controller.getById);

// Tutor
router.get('/me', authentic([2]), Controller.getOwnProfile);
router.put('/profile', authentic([2]), Controller.updateProfile);
router.post('/upload-media', authentic([2]), uploadTutorMedia, Controller.updateMedia);

// Admin
router.get('/', authentic([1]), Controller.getAllAdmin);
router.put('/approve-status/:id', authentic([1]), Controller.approveStatus);
router.put('/verify/:id', authentic([1]), Controller.verifyTutor);

module.exports = router;