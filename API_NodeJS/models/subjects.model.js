const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM subjects WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM subjects WHERE subject_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO subjects SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE subjects SET ? WHERE subject_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE subjects SET deleted_at = NOW() WHERE subject_id = ?', [id]);
  }
};

module.exports = Model;