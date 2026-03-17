const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM post_applications WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM post_applications WHERE post_application_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO post_applications SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE post_applications SET ? WHERE post_application_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE post_applications SET deleted_at = NOW() WHERE post_application_id = ?', [id]);
  }
};

module.exports = Model;