const db = require('../common/db');

const Model = {
  // ADMIN: Lấy tất cả, đếm số tiền đang chờ duyệt cho từng booking
  getAllForAdmin: async () => {
    const sql = `
      SELECT b.*, 
             u_s.full_name AS student_name, u_s.phone AS student_phone, u_s.address AS student_address,
             u_t.full_name AS tutor_name, u_t.phone AS tutor_phone,
             sj.name AS subject_name, tsl.level, tsl.tuition,
             pay.status AS payment_status, pay.id AS payment_id,
             -- Đánh dấu nếu có thanh toán đang chờ duyệt
             (SELECT COUNT(*) FROM payments WHERE booking_id = b.booking_id AND status = 'pending') AS has_pending_payment
      FROM bookings b
      JOIN students s ON b.student_id = s.student_id
      JOIN users u_s ON s.user_id = u_s.user_id
      JOIN tutors t ON b.tutor_id = t.tutor_id
      JOIN users u_t ON t.user_id = u_t.user_id
      JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
      JOIN subjects sj ON tsl.subject_id = sj.subject_id
      LEFT JOIN payments pay ON b.booking_id = pay.booking_id AND pay.payment_type = 'receive_booking'
      WHERE b.deleted_at IS NULL
      ORDER BY has_pending_payment DESC, b.created_at DESC`;
    return await db.query(sql);
  },

  // Lấy chi tiết kèm đầy đủ Contact (Dùng cho Modal Xem chi tiết)
  getDetailById: async (id) => {
    const sql = `
      SELECT b.*, 
             u_s.full_name AS student_name, u_s.phone AS student_phone, u_s.address AS student_address, u_s.email AS student_email,
             u_t.full_name AS tutor_name, u_t.phone AS tutor_phone, u_t.email AS tutor_email,
             sj.name AS subject_name, tsl.level, tsl.tuition,
             pay.status AS payment_status, pay.id AS payment_id, pay.transaction_code,
             -- BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ HIỆN NÚT Ở FRONTEND
             (SELECT COUNT(*) FROM payments WHERE pay.booking_id = b.booking_id AND pay.status = 'pending') AS has_pending_payment
      FROM bookings b
      JOIN students s ON b.student_id = s.student_id
      JOIN users u_s ON s.user_id = u_s.user_id
      JOIN tutors t ON b.tutor_id = t.tutor_id
      JOIN users u_t ON t.user_id = u_t.user_id
      JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
      JOIN subjects sj ON tsl.subject_id = sj.subject_id
      LEFT JOIN payments pay ON b.booking_id = pay.booking_id
      WHERE b.booking_id = ?`;
    const rows = await db.query(sql, [id]);
    return rows[0];
  },

  // HỌC VIÊN: Lấy danh sách cá nhân
  // getByStudent: async (studentId) => {
  //   const sql = `
  //     SELECT b.*, u_t.full_name AS tutor_name, u_t.avatar AS tutor_avatar, 
  //            sj.name AS subject_name, tsl.tuition
  //     FROM bookings b
  //     JOIN tutors t ON b.tutor_id = t.tutor_id
  //     JOIN users u_t ON t.user_id = u_t.user_id
  //     JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
  //     JOIN subjects sj ON tsl.subject_id = sj.subject_id
  //     WHERE b.student_id = ? AND b.deleted_at IS NULL`;
  //   return await db.query(sql, [studentId]);
  // },

  getByStudent: async (studentId) => {
    const sql = `
      SELECT b.*, u_t.full_name AS tutor_name, u_t.avatar AS tutor_avatar, 
             sj.name AS subject_name, tsl.level, tsl.tuition
      FROM bookings b
      JOIN tutors t ON b.tutor_id = t.tutor_id
      JOIN users u_t ON t.user_id = u_t.user_id
      JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
      JOIN subjects sj ON tsl.subject_id = sj.subject_id
      WHERE b.student_id = ? AND b.deleted_at IS NULL
      ORDER BY b.created_at DESC
    `;
    const rows = await db.query(sql, [studentId]);
    return rows;
  },

  // GIA SƯ: Lấy lời mời + Check trạng thái thanh toán
  // getByTutor: async (tutorId) => {
  //   const sql = `
  //     SELECT 
  //       b.*, 
  //       u_s.full_name AS student_name, 
  //       u_s.address AS student_address, 
  //       u_s.phone AS student_phone_raw, -- SĐT gốc để xử lý
  //       sj.name AS subject_name, 
  //       tsl.level, 
  //       tsl.tuition,
  //       pay.status AS payment_status -- Trạng thái tiền từ bảng payments
  //     FROM bookings b
  //     JOIN students s ON b.student_id = s.student_id
  //     JOIN users u_s ON s.user_id = u_s.user_id
  //     JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
  //     JOIN subjects sj ON tsl.subject_id = sj.subject_id
  //     -- LEFT JOIN để lấy trạng thái nộp tiền của gia sư cho booking này
  //     LEFT JOIN payments pay ON b.booking_id = pay.booking_id AND pay.payment_type = 'receive_booking'
  //     WHERE b.tutor_id = ? 
  //     AND b.status != 'pending' -- Chỉ hiện khi Admin đã duyệt bài
  //     AND b.deleted_at IS NULL
  //     ORDER BY b.created_at DESC
  //   `;
  //   const rows = await db.query(sql, [tutorId]);
    
  //   // Logic bảo mật: Nếu chưa duyệt tiền thì che SĐT ngay từ Backend
  //   return rows.map(item => ({
  //       ...item,
  //       student_phone: item.payment_status === 'success' ? item.student_phone_raw : 'Ẩn (Chờ thanh toán)'
  //   }));
  // },

  getByTutor: async (tutorId) => {
    console.log("--- [DEBUG MODEL] Đang lấy danh sách mời dạy cho tutorId:", tutorId);
    const sql = `
      SELECT b.*, u_s.full_name AS student_name, u_s.address AS student_address, 
             u_s.phone AS student_phone_raw,
             sj.name AS subject_name, tsl.level, tsl.tuition,
             pay.status AS payment_status
      FROM bookings b
      LEFT JOIN students s ON b.student_id = s.student_id
      LEFT JOIN users u_s ON s.user_id = u_s.user_id
      LEFT JOIN tutor_subject_level tsl ON b.tutor_subject_level_id = tsl.tutor_subject_level_id
      LEFT JOIN subjects sj ON tsl.subject_id = sj.subject_id
      LEFT JOIN payments pay ON pay.id = (
        SELECT p2.id
        FROM payments p2
        WHERE p2.booking_id = b.booking_id
          AND p2.payment_type = 'receive_booking'
          AND p2.deleted_at IS NULL
        ORDER BY p2.id DESC
        LIMIT 1
      )
      WHERE b.tutor_id = ? AND b.status != 'pending' AND b.deleted_at IS NULL
    `;
    const rows = await db.query(sql, [tutorId]);
    console.log("--- [DEBUG MODEL] Số lượng bản ghi tìm thấy:", rows ? rows.length : 0);
    return rows;
  },

  // Tạo lớp học thành công
  createClassSession: async (data) => {
    const sql = `INSERT INTO class_sessions (student_id, tutor_id, booking_id, status) VALUES (?, ?, ?, ?)`;
    return await db.query(sql, [data.student_id, data.tutor_id, data.booking_id, 'ongoing']);
  },

  // Cập nhật điểm uy tín
  addPoints: async (tutorId, amount, reason) => {
    // 1. Cập nhật cộng dồn điểm ở bảng tutors
    await db.query(
      'UPDATE tutors SET accumulated_points = accumulated_points + ? WHERE tutor_id = ?', 
      [amount, tutorId]
    );
    // 2. Lưu lịch sử vào bảng point_history
    const sqlHistory = 'INSERT INTO point_history (tutor_id, amount, reason) VALUES (?, ?, ?)';
    return await db.query(sqlHistory, [tutorId, amount, reason]);
  },

  // Cập nhật tường minh tránh lỗi syntax
  updateStatus: async (id, status, adminId, reason = null) => {
    const sql = `UPDATE bookings SET status = ?, approved_by = ?, approved_at = NOW(), cancel_reason = ? WHERE booking_id = ?`;
    return await db.query(sql, [status, adminId, reason, id]);
  },

  update: async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const sql = `UPDATE bookings SET ${fields} WHERE booking_id = ?`;
    
    // Gọi db.query (vốn là pool.execute đã bóc tách)
    return await db.query(sql, values);
  },

  // Lấy Tutor ID từ User ID
  getTutorIdByUserId: async (userId) => {
    console.log("--- [DEBUG MODEL] Bắt đầu tìm tutor_id cho userId:", userId);
    const sql = "SELECT tutor_id FROM tutors WHERE user_id = ? AND deleted_at IS NULL";
    
    // db.query của bạn đã bóc tách sẵn mảng kết quả
    const rows = await db.query(sql, [userId]); 
    
    console.log("--- [DEBUG MODEL] Kết quả trả về từ DB:", rows);
    return rows; 
  },

  getStudentIdByUserId: async (userId) => {
    const rows = await db.query("SELECT student_id FROM students WHERE user_id = ? AND deleted_at IS NULL", [userId]);
    return rows;
  },

  create: async (data) => {
    // Viết câu lệnh SQL tường minh từng cột
    const sql = `
      INSERT INTO bookings 
      (student_id, tutor_id, tutor_subject_level_id, hours_per_session, sessions_per_week, teaching_mode, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Truyền tham số dưới dạng mảng tương ứng với các dấu hỏi chấm
    const params = [
      data.student_id,
      data.tutor_id,
      data.tutor_subject_level_id,
      data.hours_per_session,
      data.sessions_per_week,
      data.teaching_mode,
      data.status
    ];

    return await db.query(sql, params);
  },

  delete: async (id) => {
    return await db.query('UPDATE bookings SET deleted_at = NOW() WHERE booking_id = ?', [id]);
  },
};

module.exports = Model;