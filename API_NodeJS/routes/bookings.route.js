const express = require('express');
const router = express.Router();
const Controller = require('../controllers/bookings.controller');
const { authentic } = require('../middleware/authentic');

// Student (role_id = 3)
router.post('/invite', authentic([3]), Controller.createBooking);
router.put('/update/:id', authentic([3]), Controller.updateBooking);
router.delete('/:id', authentic([3]), Controller.deleteBooking);
router.put('/cancel/:id', authentic([3]), Controller.cancelBooking);
router.get('/my-bookings', authentic([3]), (req, res) => {
    Model.getByStudent(req.user.student_id).then(d => res.json(d));
});

// Tutor (role_id = 2)
router.get('/invitations', authentic([2]), (req, res) => {
    Model.getByTutor(req.user.tutor_id).then(d => res.json(d));
});
router.put('/respond/:id', authentic([2]), Controller.respondBooking);

module.exports = router;