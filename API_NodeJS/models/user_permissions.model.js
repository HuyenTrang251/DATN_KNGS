const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM user_permissions WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM user_permissions WHERE user_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO user_permissions SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE user_permissions SET ? WHERE user_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE user_permissions SET deleted_at = NOW() WHERE user_id = ?', [id]);
  }
};

module.exports = Model;