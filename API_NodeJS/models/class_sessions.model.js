const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM class_sessions WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM class_sessions WHERE class_session_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO class_sessions SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE class_sessions SET ? WHERE class_session_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE class_sessions SET deleted_at = NOW() WHERE class_session_id = ?', [id]);
  }
};

module.exports = Model;