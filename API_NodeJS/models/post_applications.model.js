const db = require('../common/db');

const Model = {
  getByPostId: async (postId) => {
    const sql = `
      SELECT 
        pa.post_application_id, pa.post_id, pa.tutor_id, pa.status, pa.created_at,
        u.full_name, u.avatar, t.education, t.experience
      FROM post_applications pa
      JOIN tutors t ON pa.tutor_id = t.tutor_id
      JOIN users u ON t.user_id = u.user_id
      WHERE pa.post_id = ? AND pa.deleted_at IS NULL
      ORDER BY pa.created_at DESC
    `;
    // THÊM [rows] để bóc tách dữ liệu
    const rows = await db.query(sql, [postId]);
    return rows; 
  },
  
  updateStatus: async (id, status) => {
    const sql = 'UPDATE post_applications SET status = ? WHERE post_application_id = ?';
    return await db.query(sql, [status, id]);
  },
  
  getTutorIdByUserId: async (userId) => {
    // Luôn bóc tách [rows] từ db.query
    const [rows] = await db.query(
      'SELECT tutor_id FROM tutors WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );
    return rows; // Trả về mảng để Service tự xử lý cho an toàn
  },

  checkExist: async (postId, tutorId) => {
    const [rows] = await db.query(
      'SELECT * FROM post_applications WHERE post_id = ? AND tutor_id = ? AND deleted_at IS NULL',
      [postId, tutorId]
    );
    // SỬA TẠI ĐÂY: Thêm kiểm tra rows có tồn tại không trước khi đọc length
    return rows && rows.length > 0; 
  },

  create: async (data) => {
    // Dùng mảng tham số để tránh lỗi cú pháp SQL
    const sql = 'INSERT INTO post_applications (post_id, tutor_id, status) VALUES (?, ?, ?)';
    const params = [data.post_id, data.tutor_id, data.status || 'pending'];
    return await db.query(sql, params);
  }
};

module.exports = Model;