const Service = require('../services/system_logs.service');
const { validate } = require('../validations/system_logs.validation');

module.exports = {
  getAll: async (req, res) => {
    try { const data = await Service.findAll(); res.json(data); } catch (e) { res.status(500).send(e.message); }
  },
  getById: async (req, res) => {
    try { const data = await Service.findOne(req.params.id); res.json(data); } catch (e) { res.status(500).send(e.message); }
  },
  create: async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      const result = await Service.add(req.body);
      res.status(201).json(result);
    } catch (e) { res.status(500).send(e.message); }
  },
  update: async (req, res) => {
    try { await Service.edit(req.params.id, req.body); res.send('Updated successfully'); } catch (e) { res.status(500).send(e.message); }
  },
  delete: async (req, res) => {
    try { await Service.remove(req.params.id); res.send('Deleted successfully'); } catch (e) { res.status(500).send(e.message); }
  }
};