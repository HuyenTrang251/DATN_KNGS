const Model = require('../models/tutors.model');

const Service = {
  // Cập nhật Profile "All-in-one" (Sửa thông tin bất kỳ trong 5 bảng)
  updateFullProfile: async (userId, data) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const { user_info, tutor_info, locations, subjects, availabilities } = data;

      // 1. Cập nhật bảng Users (Họ tên, SĐT, giới tính...)
      if (user_info) {
        await connection.query('UPDATE users SET ? WHERE user_id = ?', [user_info, userId]);
      }

      // 2. Xử lý bảng Tutors (Lấy hoặc tạo mới nếu gia sư vừa đăng nhập lần đầu)
      let [tutorRows] = await connection.query('SELECT tutor_id FROM tutors WHERE user_id = ?', [userId]);
      let tutorId;
      
      if (tutorRows.length === 0) {
        const [insertRes] = await connection.query('INSERT INTO tutors SET ?, user_id = ?', [tutor_info || {}, userId]);
        tutorId = insertRes.insertId;
      } else {
        tutorId = tutorRows[0].tutor_id;
        if (tutor_info) await connection.query('UPDATE tutors SET ? WHERE tutor_id = ?', [tutor_info, tutorId]);
      }

      // 3. Cập nhật các bảng phụ (Xóa cũ - Thêm mới)
      // Địa điểm dạy
      if (locations) {
        await connection.query('DELETE FROM tutor_teaching_locations WHERE tutor_id = ?', [tutorId]);
        for (let addr of locations) {
          await connection.query('INSERT INTO tutor_teaching_locations (tutor_id, address) VALUES (?, ?)', [tutorId, addr]);
        }
      }

      // Môn dạy & Học phí
      if (subjects) {
        await connection.query('DELETE FROM tutor_subject_level WHERE tutor_id = ?', [tutorId]);
        for (let sub of subjects) {
          await connection.query('INSERT INTO tutor_subject_level SET ?, tutor_id = ?', [sub, tutorId]);
        }
      }

      // Lịch trống
      if (availabilities) {
        await connection.query('DELETE FROM tutor_availabilities WHERE tutor_id = ?', [tutorId]);
        for (let avai of availabilities) {
          await connection.query('INSERT INTO tutor_availabilities SET ?, tutor_id = ?', [avai, tutorId]);
        }
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Logic cấp tích xanh (Kiểm tra đủ 5 bảng)
  verifyBlueTick: async (tutorId) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM tutor_teaching_locations WHERE tutor_id = ?) as loc,
        (SELECT COUNT(*) FROM tutor_subject_level WHERE tutor_id = ?) as sub,
        (SELECT COUNT(*) FROM tutor_availabilities WHERE tutor_id = ?) as avai,
        t.cv_url, t.experience
      FROM tutors t WHERE t.tutor_id = ?`;
    const [res] = await db.query(sql, [tutorId, tutorId, tutorId, tutorId]);
    
    if (res.loc > 0 && res.sub > 0 && res.avai > 0 && res.cv_url && res.experience) {
      return await db.query('UPDATE tutors SET is_verified = 1, verified_at = NOW() WHERE tutor_id = ?', [tutorId]);
    }
    throw new Error("Chưa đủ thông tin 5 bảng hoặc thiếu CV để cấp tích xanh");
  }, 
  
  updateMedia: async (userId, mediaData) => {
      // mediaData = { cv_url: '...', intro_video_url: '...' }
      const db = require('../common/db');
      const sql = `UPDATE tutors SET ? WHERE user_id = ?`;
      return await db.query(sql, [mediaData, userId]);
  },
};

module.exports = Service;