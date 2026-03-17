const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM students WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM students WHERE student_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO students SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE students SET ? WHERE student_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE students SET deleted_at = NOW() WHERE student_id = ?', [id]);
  }
};

module.exports = Model;