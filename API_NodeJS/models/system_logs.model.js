const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM system_logs WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM system_logs WHERE system_log_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO system_logs SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE system_logs SET ? WHERE system_log_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE system_logs SET deleted_at = NOW() WHERE system_log_id = ?', [id]);
  }
};

module.exports = Model;