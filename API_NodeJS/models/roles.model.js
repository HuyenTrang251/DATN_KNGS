const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM roles WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM roles WHERE role_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO roles SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE roles SET ? WHERE role_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE roles SET deleted_at = NOW() WHERE role_id = ?', [id]);
  }
};

module.exports = Model;