const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM posts WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM posts WHERE post_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO posts SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE posts SET ? WHERE post_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE posts SET deleted_at = NOW() WHERE post_id = ?', [id]);
  }
};

module.exports = Model;