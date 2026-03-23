const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM tutor_subject_level WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM tutor_subject_level WHERE tutor_subject_level_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO tutor_subject_level SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE tutor_subject_level SET ? WHERE tutor_subject_level_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE tutor_subject_level SET deleted_at = NOW() WHERE tutor_subject_level_id = ?', [id]);
  },

  // Lấy danh sách môn dạy theo tutor_id
  getByTutorId: async (tutorId) => {
    const sql = `
      SELECT tsl.*, s.name as subject_name 
      FROM tutor_subject_level tsl
      JOIN subjects s ON tsl.subject_id = s.subject_id
      WHERE tsl.tutor_id = ? AND tsl.deleted_at IS NULL`;
    return await db.query(sql, [tutorId]);
  }
};

module.exports = Model;