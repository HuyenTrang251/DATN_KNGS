const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM notifications WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM notifications WHERE notification_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO notifications SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE notifications SET ? WHERE notification_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE notifications SET deleted_at = NOW() WHERE notification_id = ?', [id]);
  }
};

module.exports = Model;