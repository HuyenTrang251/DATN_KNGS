const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM payments WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM payments WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO payments SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE payments SET ? WHERE id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE payments SET deleted_at = NOW() WHERE id = ?', [id]);
  }
};

module.exports = Model;