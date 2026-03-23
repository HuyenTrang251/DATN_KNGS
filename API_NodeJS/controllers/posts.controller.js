const Service = require('../services/posts.service');
const { validate } = require('../validations/posts.validation');

module.exports = {

  getAll: async (req, res) => {
    try {

      const data = await Service.findAll();
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  getApproved: async (req, res) => {
    try {

      const data = await Service.findApproved();
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  getStudentPosts: async (req, res) => {
    try {

      const data = await Service.findStudentPosts(req.user.user_id);
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  getTutorApplications: async (req, res) => {
    try {

      const data = await Service.findTutorApplications(req.user.user_id);
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status, reason } = req.body;

      await Service.updateStatus(
        req.params.id,
        status,
        reason,
        req.user.user_id
      );

      res.json({ message: "Cập nhật trạng thái thành công" });

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  getById: async (req, res) => {
    try {

      const data = await Service.findOne(req.params.id);
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  create: async (req, res) => {
    try {

      const { error } = validate(req.body);
      if (error)
        return res.status(400).send(error.details[0].message);

      const result = await Service.add(req.body);
      res.status(201).json(result);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  update: async (req, res) => {
    try {

      await Service.edit(req.params.id, req.body);
      res.send('Updated successfully');

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  delete: async (req, res) => {
    try {

      await Service.remove(req.params.id);
      res.send('Deleted successfully');

    } catch (e) {
      res.status(500).send(e.message);
    }
  }

};