const router = require('express').Router();
const Controller = require('../controllers/posts.controller');
const {authentic, authorize} = require('../middleware/authentic');

router.get('/', Controller.getAll);

router.get('/my-posts', authentic(), Controller.getStudentPosts);

router.get('/approved', Controller.getApproved);

router.get('/my-applications', authentic(), Controller.getTutorApplications);

router.put('/:id/status', authentic(), authorize([1]), Controller.updateStatus);

router.get('/:id', Controller.getById);

router.post('/', authentic(), Controller.create);

router.put('/:id', authentic(), Controller.update);

router.delete('/:id', authentic(), Controller.delete);

module.exports = router;