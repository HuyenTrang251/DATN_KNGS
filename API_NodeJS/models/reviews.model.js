const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM reviews WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM reviews WHERE review_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO reviews SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE reviews SET ? WHERE review_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE reviews SET deleted_at = NOW() WHERE review_id = ?', [id]);
  }
};

module.exports = Model;