const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM tutor_teaching_locations WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM tutor_teaching_locations WHERE tutor_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO tutor_teaching_locations SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE tutor_teaching_locations SET ? WHERE tutor_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE tutor_teaching_locations SET deleted_at = NOW() WHERE tutor_id = ?', [id]);
  }
};

module.exports = Model;