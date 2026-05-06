// const db = require('../common/db');

// const Model = {
//   // 1. Admin: Lấy tất cả gia sư kèm chi tiết 5 bảng
//   getAllDetailed: async () => {
//     const sql = `
//       SELECT u.user_id, u.full_name, u.email, u.phone, u.avatar, u.status as user_status,
//              t.tutor_id, t.experience, t.education, t.certificates, t.cv_url, t.approval_status, t.is_verified,
//              (SELECT GROUP_CONCAT(address SEPARATOR '||') FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
//              (SELECT GROUP_CONCAT(CONCAT(s.name, ':', tsl.level, ':', tsl.tuition) SEPARATOR '||') 
//               FROM tutor_subject_level tsl JOIN subjects s ON tsl.subject_id = s.subject_id WHERE tsl.tutor_id = t.tutor_id) as subjects,
//              (SELECT GROUP_CONCAT(CONCAT(day_of_week, ':', start_time, '-', end_time) SEPARATOR '||') 
//               FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
//       FROM tutors t
//       RIGHT JOIN users u ON t.user_id = u.user_id
//       WHERE u.role_id = 2 AND u.deleted_at IS NULL`;
//     return await db.query(sql);
//   },

//   // 2. Public: Lấy gia sư đã duyệt hiển thị danh sách
//   getApprovedList: async () => {
//     const sql = `
//       SELECT 
//         u.full_name, u.avatar, u.address as home_address,
//         t.tutor_id, t.experience, t.education, t.is_verified,
//         -- Sử dụng IFNULL để tránh giá trị null làm sập code split ở sau
//         (SELECT IFNULL(GROUP_CONCAT(address SEPARATOR '||'), '') 
//          FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
        
//         -- Thêm tutor_subject_level_id vào chuỗi để dùng cho chức năng Mời dạy
//         (SELECT IFNULL(GROUP_CONCAT(CONCAT(s.name, '|', tsl.level, '|', CAST(tsl.tuition AS UNSIGNED), '|', tsl.tutor_subject_level_id) SEPARATOR '||'), '')
//          FROM tutor_subject_level tsl 
//          JOIN subjects s ON tsl.subject_id = s.subject_id 
//          WHERE tsl.tutor_id = t.tutor_id) as subject_details,
        
//         (SELECT IFNULL(GROUP_CONCAT(CONCAT(day_of_week, '|', start_time, '-', end_time) SEPARATOR '||'), '') 
//          FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
//       FROM tutors t
//       JOIN users u ON t.user_id = u.user_id
//       WHERE t.approval_status = 'approved' 
//         AND u.status = 'active' 
//         AND t.deleted_at IS NULL`;
    
//     return await db.query(sql);
//   },

//   getByUserId: async (userId) => {
//     const rows = await db.query('SELECT * FROM tutors WHERE user_id = ?', [userId]);
//     return rows[0];
//   }
// };

// module.exports = Model;

const db = require('../common/db');

const Model = {
  // Lấy chi tiết 1 gia sư theo ID (Dùng cho trang Chi tiết của Admin/User)
  getById: async (tutorId) => {
    const sql = `
      SELECT u.*, t.*,
        (SELECT GROUP_CONCAT(address SEPARATOR '||') FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
        (SELECT GROUP_CONCAT(CONCAT_WS('#', s.name, tsl.level, tsl.tuition, tsl.tutor_subject_level_id) SEPARATOR '||') 
         FROM tutor_subject_level tsl JOIN subjects s ON tsl.subject_id = s.subject_id WHERE tsl.tutor_id = t.tutor_id) as subjects,
        (SELECT GROUP_CONCAT(CONCAT_WS('#', day_of_week, DATE_FORMAT(start_time, '%H:%i'), DATE_FORMAT(end_time, '%H:%i')) SEPARATOR '||') 
         FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
      FROM tutors t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.tutor_id = ? AND u.deleted_at IS NULL`;
    const rows = await db.query(sql, [tutorId]);
    return rows[0];
  },

  // Lấy chi tiết theo User ID (Dùng cho trang Profile của chính gia sư)
  getByUserId: async (userId) => {
    const sql = `
      SELECT u.full_name, u.email, u.phone, u.avatar, u.gender, u.date_of_birth, u.address as home_address,
             t.*,
             (SELECT GROUP_CONCAT(address SEPARATOR '||') FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
             (SELECT GROUP_CONCAT(CONCAT_WS('#', subject_id, level, tuition) SEPARATOR '||') FROM tutor_subject_level WHERE tutor_id = t.tutor_id) as subjects,
             (SELECT GROUP_CONCAT(CONCAT_WS('#', day_of_week, start_time, end_time) SEPARATOR '||') FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
      FROM users u
      LEFT JOIN tutors t ON u.user_id = t.user_id
      WHERE u.user_id = ?`;
    const rows = await db.query(sql, [userId]);
    return rows[0];
  },

  getAllDetailed: async () => {
    const sql = `
      SELECT u.user_id, u.full_name, u.email, u.phone, u.avatar, u.status as user_status,
             t.tutor_id, t.experience, t.education, t.cv_url, t.intro_video_url, t.approval_status, t.accumulated_points, t.is_verified,
             (SELECT id FROM payments WHERE tutor_id = t.tutor_id AND payment_type = 'verify_profile' AND status = 'pending' LIMIT 1) as verify_payment_id,
             (SELECT GROUP_CONCAT(address SEPARATOR '||') FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
             (SELECT GROUP_CONCAT(CONCAT_WS('#', s.name, tsl.level, tsl.tuition) SEPARATOR '||') 
              FROM tutor_subject_level tsl JOIN subjects s ON tsl.subject_id = s.subject_id WHERE tsl.tutor_id = t.tutor_id) as subjects,
             (SELECT GROUP_CONCAT(CONCAT_WS('#', day_of_week, DATE_FORMAT(start_time, '%H:%i'), DATE_FORMAT(end_time, '%H:%i')) SEPARATOR '||') 
              FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
      FROM tutors t
      JOIN users u ON t.user_id = u.user_id
      WHERE u.deleted_at IS NULL`;
    return await db.query(sql);
  },

  getApprovedList: async () => {
    const sql = `
      SELECT u.full_name, u.avatar, u.address as home_address, t.tutor_id, t.experience, t.education, t.is_verified,
        (SELECT IFNULL(GROUP_CONCAT(address SEPARATOR '||'), '') FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
        (SELECT IFNULL(GROUP_CONCAT(CONCAT_WS('#', s.name, tsl.level, CAST(tsl.tuition AS UNSIGNED), tsl.tutor_subject_level_id) SEPARATOR '||'), '')
         FROM tutor_subject_level tsl JOIN subjects s ON tsl.subject_id = s.subject_id WHERE tsl.tutor_id = t.tutor_id) as subject_details,
        (SELECT IFNULL(GROUP_CONCAT(CONCAT_WS('#', day_of_week, DATE_FORMAT(start_time, '%H:%i'), DATE_FORMAT(end_time, '%H:%i')) SEPARATOR '||'), '') 
         FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
      FROM tutors t JOIN users u ON t.user_id = u.user_id
      WHERE t.approval_status = 'approved' AND u.status = 'active' AND t.deleted_at IS NULL`;
    return await db.query(sql);
  },

  getPointHistoryByTutorId: async (tutorId) => {
    const sql = `
        SELECT * FROM point_history 
        WHERE tutor_id = ? 
        ORDER BY created_at DESC
    `;
    return await db.query(sql, [tutorId]);
  },

  getBasicTutorInfo: async (userId) => {
    const sql = 'SELECT tutor_id FROM tutors WHERE user_id = ? AND deleted_at IS NULL';
    const rows = await db.query(sql, [userId]);
    return rows[0];
  },

  updateVerifyStatus: async (tutorId, isVerified) => {
    return await db.query(
      'UPDATE tutors SET is_verified = ?, approval_status = "approved" WHERE tutor_id = ?', 
      [isVerified, tutorId]
    );
  }
};

module.exports = Model;