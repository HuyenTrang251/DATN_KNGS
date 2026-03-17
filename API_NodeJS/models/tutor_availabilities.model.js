const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM tutor_availabilities WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM tutor_availabilities WHERE tutor_availabilities_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO tutor_availabilities SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE tutor_availabilities SET ? WHERE tutor_availabilities_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE tutor_availabilities SET deleted_at = NOW() WHERE tutor_availabilities_id = ?', [id]);
  }
};

module.exports = Model;