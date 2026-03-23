const db = require('../common/db');

const Model = {
  // 1. Admin: Lấy tất cả gia sư kèm chi tiết 5 bảng
  getAllDetailed: async () => {
    const sql = `
      SELECT u.user_id, u.full_name, u.email, u.phone, u.avatar, u.status as user_status,
             t.tutor_id, t.experience, t.education, t.certificates, t.cv_url, t.approval_status, t.is_verified,
             (SELECT GROUP_CONCAT(address SEPARATOR '||') FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
             (SELECT GROUP_CONCAT(CONCAT(s.name, ':', tsl.level, ':', tsl.tuition) SEPARATOR '||') 
              FROM tutor_subject_level tsl JOIN subjects s ON tsl.subject_id = s.subject_id WHERE tsl.tutor_id = t.tutor_id) as subjects,
             (SELECT GROUP_CONCAT(CONCAT(day_of_week, ':', start_time, '-', end_time) SEPARATOR '||') 
              FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
      FROM tutors t
      RIGHT JOIN users u ON t.user_id = u.user_id
      WHERE u.role_id = 2 AND u.deleted_at IS NULL`;
    return await db.query(sql);
  },

  // 2. Public: Lấy gia sư đã duyệt hiển thị danh sách
  getApprovedList: async () => {
    const sql = `
      SELECT 
        u.full_name, u.avatar, u.address as home_address,
        t.tutor_id, t.experience, t.education, t.is_verified,
        -- Sử dụng IFNULL để tránh giá trị null làm sập code split ở sau
        (SELECT IFNULL(GROUP_CONCAT(address SEPARATOR '||'), '') 
         FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as locations,
        
        -- Thêm tutor_subject_level_id vào chuỗi để dùng cho chức năng Mời dạy
        (SELECT IFNULL(GROUP_CONCAT(CONCAT(s.name, '|', tsl.level, '|', CAST(tsl.tuition AS UNSIGNED), '|', tsl.tutor_subject_level_id) SEPARATOR '||'), '')
         FROM tutor_subject_level tsl 
         JOIN subjects s ON tsl.subject_id = s.subject_id 
         WHERE tsl.tutor_id = t.tutor_id) as subject_details,
        
        (SELECT IFNULL(GROUP_CONCAT(CONCAT(day_of_week, '|', start_time, '-', end_time) SEPARATOR '||'), '') 
         FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as schedules
      FROM tutors t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.approval_status = 'approved' 
        AND u.status = 'active' 
        AND t.deleted_at IS NULL`;
    
    return await db.query(sql);
  },

  getByUserId: async (userId) => {
    const rows = await db.query('SELECT * FROM tutors WHERE user_id = ?', [userId]);
    return rows[0];
  }
};

module.exports = Model;