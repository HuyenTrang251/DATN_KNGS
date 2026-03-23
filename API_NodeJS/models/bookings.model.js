const db = require('../common/db');

const Model = {
  getById: async (id) => {
    const rows = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    return rows[0];
  },
  
  getStudentIdByUserId: async (userId) => {
    const sql = "SELECT student_id FROM students WHERE user_id = ? AND deleted_at IS NULL";
    const [rows] = await db.query(sql, [userId]); 
    // Console log ở đây để kiểm tra trên màn hình Terminal của Node.js
    console.log("Dữ liệu từ DB trả về cho User ID " + userId + ":", rows);
    return rows; // Phải trả về mảng [] hoặc [{student_id: ...}]
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

  update: async (id, data) => {
    return await db.query('UPDATE bookings SET ? WHERE booking_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE bookings SET deleted_at = NOW() WHERE booking_id = ?', [id]);
  },

  // Lấy booking của Học viên
  getByStudent: async (studentId) => {
    return await db.query('SELECT b.*, u.full_name as tutor_name FROM bookings b JOIN tutors t ON b.tutor_id = t.tutor_id JOIN users u ON t.user_id = u.user_id WHERE b.student_id = ? AND b.deleted_at IS NULL', [studentId]);
  },

  // Lấy booking mời Gia sư
  getByTutor: async (tutorId) => {
    return await db.query('SELECT b.*, u.full_name as student_name FROM bookings b JOIN students s ON b.student_id = s.student_id JOIN users u ON s.user_id = u.user_id WHERE b.tutor_id = ? AND b.status != "pending" AND b.deleted_at IS NULL', [tutorId]);
  }
};

module.exports = Model;