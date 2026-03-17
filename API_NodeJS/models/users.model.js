const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM users WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  // create: async (data) => {
  //   return await db.query('INSERT INTO users SET ?', data);
  // },

  create: async (data) => {
    // data lúc này là: { role_id, full_name, email, phone, password }
    // SQL sẽ tự hiểu là: INSERT INTO users (role_id, full_name, email, phone, password) VALUES (...)
    const sql = 'INSERT INTO users SET ?';
    return await db.query(sql, data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE users SET ? WHERE user_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE users SET deleted_at = NOW() WHERE user_id = ?', [id]);
  }
};

module.exports = Model;