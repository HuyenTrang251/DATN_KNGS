const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM point_history WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM point_history WHERE point_history_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO point_history SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE point_history SET ? WHERE point_history_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE point_history SET deleted_at = NOW() WHERE point_history_id = ?', [id]);
  }
};

module.exports = Model;