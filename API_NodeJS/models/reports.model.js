const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM reports WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM reports WHERE report_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO reports SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE reports SET ? WHERE report_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE reports SET deleted_at = NOW() WHERE report_id = ?', [id]);
  }
};

module.exports = Model;