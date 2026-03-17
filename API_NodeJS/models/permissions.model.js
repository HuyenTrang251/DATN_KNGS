const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM permissions WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM permissions WHERE permission_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO permissions SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE permissions SET ? WHERE permission_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE permissions SET deleted_at = NOW() WHERE permission_id = ?', [id]);
  }
};

module.exports = Model;