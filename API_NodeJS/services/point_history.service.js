const Model = require('../models/point_history.model');

const Service = {
  getTutorHistory: async (userId) => {
    const sql = `
      SELECT ph.* FROM point_history ph
      JOIN tutors t ON ph.tutor_id = t.tutor_id
      WHERE t.user_id = ?
      ORDER BY ph.created_at DESC`;
    return await db.query(sql, [userId]);
  },
  findAll: async () => await Model.getAll(),
  findOne: async (id) => await Model.getById(id),
  add: async (data) => await Model.create(data),
  edit: async (id, data) => await Model.update(id, data),
  remove: async (id) => await Model.delete(id)
};

module.exports = Service;