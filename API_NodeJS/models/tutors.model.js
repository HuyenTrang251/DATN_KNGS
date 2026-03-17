const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM tutors WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM tutors WHERE tutor_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO tutors SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE tutors SET ? WHERE tutor_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE tutors SET deleted_at = NOW() WHERE tutor_id = ?', [id]);
  }
};

module.exports = Model;