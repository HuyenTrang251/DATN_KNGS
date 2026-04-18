const express = require('express');
const router = express.Router();
const Controller = require('../controllers/bookings.controller');
const { authentic } = require('../middleware/authentic');

// ADMIN
router.get('/', authentic([1]), Controller.adminGetAll);
router.get('/detail/:id', authentic([1]), Controller.getDetailById); // Khớp hàm mới thêm
router.put('/update-status/:id', authentic([1]), Controller.adminUpdateStatus);

// STUDENT
router.post('/invite', authentic([3]), Controller.createBooking);
router.get('/my-bookings', authentic([3]), Controller.studentGetMyBookings);
router.put('/cancel/:id', authentic([3]), Controller.studentCancel); // Khớp hàm đã mở khóa
router.delete('/:id', authentic([3]), Controller.deleteBooking);

// TUTOR
router.get('/invitations', authentic([2]), Controller.tutorGetInvitations);
router.put('/respond/:id', authentic([2]), Controller.tutorRespond);
router.post('/confirm-connection/:id', authentic([2]), Controller.tutorConfirmConnect); // Khớp hàm đã mở khóa

module.exports = router;