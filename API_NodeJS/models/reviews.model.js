const db = require('../common/db');

const Model = {
  // Kiểm tra thông tin lớp học để xác định người được đánh giá
  getSessionParties: async (sessionId) => {
    const sql = `
      SELECT cs.student_id, cs.tutor_id, u_s.user_id as student_user_id, u_t.user_id as tutor_user_id 
      FROM class_sessions cs
      JOIN students s ON cs.student_id = s.student_id
      JOIN users u_s ON s.user_id = u_s.user_id
      JOIN tutors t ON cs.tutor_id = t.tutor_id
      JOIN users u_t ON t.user_id = u_t.user_id
      WHERE cs.class_session_id = ?`;
    const rows = await db.query(sql, [sessionId]);
    return rows[0];
  },

  // Tạo đánh giá
  create: async (data) => {
    const sql = `INSERT INTO reviews (class_session_id, reviewer_id, reviewed_user_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
    return await db.query(sql, [data.class_session_id, data.reviewer_id, data.reviewed_user_id, data.rating, data.comment]);
  },

  // Sửa đánh giá
  update: async (id, data) => {
    const sql = `UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?`;
    return await db.query(sql, [data.rating, data.comment, id]);
  },

  // Xóa đánh giá
  delete: async (id) => {
    return await db.query('UPDATE reviews SET deleted_at = NOW() WHERE review_id = ?', [id]);
  },

  // Lấy chi tiết 1 đánh giá để check quyền
  getById: async (id) => {
    const sql = 'SELECT * FROM reviews WHERE review_id = ? AND deleted_at IS NULL';
    const rows = await db.query(sql, [id]); 
    // Vì db.query của bạn đã bóc tách sẵn results, nên return rows[0]
    return rows[0]; 
  },
  // ADMIN: Lấy tất cả đánh giá của các lớp thành công
  getAllForAdmin: async () => {
    const sql = `
      SELECT r.*, 
             u_rer.full_name AS reviewer_name, u_red.full_name AS reviewed_name,
             s.name AS subject_name
      FROM reviews r
      JOIN users u_rer ON r.reviewer_id = u_rer.user_id
      JOIN users u_red ON r.reviewed_user_id = u_red.user_id
      JOIN class_sessions cs ON r.class_session_id = cs.class_session_id
      LEFT JOIN posts p ON cs.post_id = p.post_id
      LEFT JOIN subjects s ON p.subject_id = s.subject_id
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC`;
    return await db.query(sql);
  }
};

module.exports = Model;