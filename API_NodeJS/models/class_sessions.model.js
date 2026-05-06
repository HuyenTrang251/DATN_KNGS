const db = require('../common/db');

const Model = {
  // Lấy danh sách kèm thông tin tên tuổi để hiển thị lên Card FE
  getByRole: async (role, profileId, userId) => {
    const filterField = role === 'student' ? 'student_id' : 'tutor_id';

    const sql = `
      SELECT 
        cs.class_session_id, cs.status, cs.created_at, cs.cancel_reason,
        u_s.full_name AS student_name, u_s.phone AS student_phone,
        u_t.full_name AS tutor_name, u_t.phone AS tutor_phone,
        -- Lấy tên môn học từ 1 trong 2 nguồn
        COALESCE(sub_p.name, sub_b.name) AS subject_name,
        COALESCE(p.grade, tsl.level) AS grade,
        COALESCE(p.address, u_s.address) AS address,
        COALESCE(p.tuition_fee_per_session, tsl.tuition) AS tuition,
        COALESCE(p.student_quantity, 1) AS student_quantity,
        COALESCE(p.hours_per_session, b.hours_per_session) AS hours_per_session,
        COALESCE(p.sessions_per_week, b.sessions_per_week) AS sessions_per_week,
        p.note,
        -- Đánh giá hiện tại
        r.review_id, r.rating, r.comment,
        -- Kiểm tra xem đã từng xóa đánh giá chưa
        (SELECT COUNT(*) FROM reviews 
         WHERE class_session_id = cs.class_session_id 
         AND reviewer_id = ? 
         AND deleted_at IS NOT NULL) AS is_review_locked
      FROM class_sessions cs
      JOIN students st ON cs.student_id = st.student_id
      JOIN users u_s ON st.user_id = u_s.user_id
      JOIN tutors t ON cs.tutor_id = t.tutor_id
      JOIN users u_t ON t.user_id = u_t.user_id
      -- Nguồn từ bài đăng
      LEFT JOIN posts p ON cs.post_id = p.post_id
      LEFT JOIN subjects sub_p ON p.subject_id = sub_p.subject_id
      -- Nguồn từ đặt lịch
      LEFT JOIN bookings b ON cs.booking_id = b.booking_id
      LEFT JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
      LEFT JOIN subjects sub_b ON tsl.subject_id = sub_b.subject_id
      -- Join lấy review chưa xóa của chính mình
      LEFT JOIN reviews r ON r.class_session_id = cs.class_session_id 
           AND r.reviewer_id = ? 
           AND r.deleted_at IS NULL
      WHERE cs.${filterField} = ? AND cs.deleted_at IS NULL
      ORDER BY cs.created_at DESC
    `;
    
    // Tổng cộng có 3 dấu ?: 1 cho is_review_locked, 1 cho reviews r, 1 cho filterField
    return await db.query(sql, [userId, userId, profileId]);
  },

  // Admin lấy tất cả
  adminGetAllDetailed: async () => {
    const sql = `
      SELECT 
        cs.class_session_id, cs.status, cs.created_at, cs.cancel_reason, cs.post_id, cs.booking_id,
        -- Thông tin Học viên (Lấy từ bảng users qua bảng students)
        u_s.full_name AS student_name, 
        u_s.phone AS student_phone, 
        u_s.email AS student_email, 
        u_s.address AS student_address,
        -- Thông tin Gia sư (Lấy từ bảng users qua bảng tutors)
        u_t.full_name AS tutor_name, 
        u_t.phone AS tutor_phone, 
        u_t.email AS tutor_email,
        -- Lấy Môn học, Lớp, Học phí và Địa chỉ dạy (Dùng COALESCE để kiểm tra cả 2 nguồn Post/Booking)
        COALESCE(sub_p.name, sub_b.name, 'N/A') AS subject_name,
        COALESCE(p.grade, tsl.level, 'N/A') AS grade,
        COALESCE(p.tuition_fee_per_session, tsl.tuition, 0) AS tuition,
        COALESCE(p.address, u_s.address, 'Chưa xác định') AS teaching_address,
        -- Lấy đánh giá 2 chiều
        (SELECT rating FROM reviews WHERE class_session_id = cs.class_session_id AND reviewer_id = u_s.user_id AND deleted_at IS NULL) AS student_rating,
        (SELECT comment FROM reviews WHERE class_session_id = cs.class_session_id AND reviewer_id = u_s.user_id AND deleted_at IS NULL) AS student_comment,
        (SELECT rating FROM reviews WHERE class_session_id = cs.class_session_id AND reviewer_id = u_t.user_id AND deleted_at IS NULL) AS tutor_rating,
        (SELECT comment FROM reviews WHERE class_session_id = cs.class_session_id AND reviewer_id = u_t.user_id AND deleted_at IS NULL) AS tutor_comment
      FROM class_sessions cs
      JOIN students st ON cs.student_id = st.student_id
      JOIN users u_s ON st.user_id = u_s.user_id
      JOIN tutors t ON cs.tutor_id = t.tutor_id
      JOIN users u_t ON t.user_id = u_t.user_id
      -- JOIN với nguồn Bài đăng
      LEFT JOIN posts p ON cs.post_id = p.post_id
      LEFT JOIN subjects sub_p ON p.subject_id = sub_p.subject_id
      -- JOIN với nguồn Đặt lịch
      LEFT JOIN bookings b ON cs.booking_id = b.booking_id
      LEFT JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
      LEFT JOIN subjects sub_b ON tsl.subject_id = sub_b.subject_id
      WHERE cs.deleted_at IS NULL 
      ORDER BY cs.created_at DESC
    `;
    return await db.query(sql);
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status, reason = null) => {
    return await db.query('UPDATE class_sessions SET status = ?, cancel_reason = ? WHERE class_session_id = ?', [status, reason, id]);
  },

  // Hàm tạo lớp học mới từ bài đăng
  createFromPost: async (data) => {
    const sql = `
      INSERT INTO class_sessions (student_id, tutor_id, post_id, status) 
      VALUES (?, ?, ?, 'ongoing')
    `;
    return await db.query(sql, [data.student_id, data.tutor_id, data.post_id]);
  },

  // Tìm ID Học viên hoặc Gia sư dựa trên UserID
  findProfileIdByUser: async (userId, roleId) => {
    let sql, idField;
    if (roleId == 2) {
      sql = 'SELECT tutor_id FROM tutors WHERE user_id = ?';
      idField = 'tutor_id';
    } else {
      sql = 'SELECT student_id FROM students WHERE user_id = ?';
      idField = 'student_id';
    }
    const rows = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0][idField] : null;
  },

  // Lấy dữ liệu thô của 1 session (dùng cho logic xử lý)
  getRawById: async (id, connection = null) => {
    const sql = 'SELECT * FROM class_sessions WHERE class_session_id = ?';
    const executor = connection || db;
    const rows = await executor.query(sql, [id]);
    return rows[0];
  },

  // Quản lý kết nối (Hàm dùng cho Transaction)
  getConnection: () => db.getConnection()
};

module.exports = Model;