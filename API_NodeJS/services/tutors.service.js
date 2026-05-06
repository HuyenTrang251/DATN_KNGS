// const Model = require('../models/tutors.model');

// const Service = {
//   // Cập nhật Profile "All-in-one" (Sửa thông tin bất kỳ trong 5 bảng)
//   updateFullProfile: async (userId, data) => {
//     const connection = await db.getConnection();
//     await connection.beginTransaction();

//     try {
//       const { user_info, tutor_info, locations, subjects, availabilities } = data;

//       // 1. Cập nhật bảng Users (Họ tên, SĐT, giới tính...)
//       if (user_info) {
//         await connection.query('UPDATE users SET ? WHERE user_id = ?', [user_info, userId]);
//       }

//       // 2. Xử lý bảng Tutors (Lấy hoặc tạo mới nếu gia sư vừa đăng nhập lần đầu)
//       let [tutorRows] = await connection.query('SELECT tutor_id FROM tutors WHERE user_id = ?', [userId]);
//       let tutorId;
      
//       if (tutorRows.length === 0) {
//         const [insertRes] = await connection.query('INSERT INTO tutors SET ?, user_id = ?', [tutor_info || {}, userId]);
//         tutorId = insertRes.insertId;
//       } else {
//         tutorId = tutorRows[0].tutor_id;
//         if (tutor_info) await connection.query('UPDATE tutors SET ? WHERE tutor_id = ?', [tutor_info, tutorId]);
//       }

//       // 3. Cập nhật các bảng phụ (Xóa cũ - Thêm mới)
//       // Địa điểm dạy
//       if (locations) {
//         await connection.query('DELETE FROM tutor_teaching_locations WHERE tutor_id = ?', [tutorId]);
//         for (let addr of locations) {
//           await connection.query('INSERT INTO tutor_teaching_locations (tutor_id, address) VALUES (?, ?)', [tutorId, addr]);
//         }
//       }

//       // Môn dạy & Học phí
//       if (subjects) {
//         await connection.query('DELETE FROM tutor_subject_level WHERE tutor_id = ?', [tutorId]);
//         for (let sub of subjects) {
//           await connection.query('INSERT INTO tutor_subject_level SET ?, tutor_id = ?', [sub, tutorId]);
//         }
//       }

//       // Lịch trống
//       if (availabilities) {
//         await connection.query('DELETE FROM tutor_availabilities WHERE tutor_id = ?', [tutorId]);
//         for (let avai of availabilities) {
//           await connection.query('INSERT INTO tutor_availabilities SET ?, tutor_id = ?', [avai, tutorId]);
//         }
//       }

//       await connection.commit();
//       return { success: true };
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   },

//   // Logic cấp tích xanh (Kiểm tra đủ 5 bảng)
//   verifyBlueTick: async (tutorId) => {
//     const sql = `
//       SELECT 
//         (SELECT COUNT(*) FROM tutor_teaching_locations WHERE tutor_id = ?) as loc,
//         (SELECT COUNT(*) FROM tutor_subject_level WHERE tutor_id = ?) as sub,
//         (SELECT COUNT(*) FROM tutor_availabilities WHERE tutor_id = ?) as avai,
//         t.cv_url, t.experience
//       FROM tutors t WHERE t.tutor_id = ?`;
//     const [res] = await db.query(sql, [tutorId, tutorId, tutorId, tutorId]);
    
//     if (res.loc > 0 && res.sub > 0 && res.avai > 0 && res.cv_url && res.experience) {
//       return await db.query('UPDATE tutors SET is_verified = 1, verified_at = NOW() WHERE tutor_id = ?', [tutorId]);
//     }
//     throw new Error("Chưa đủ thông tin 5 bảng hoặc thiếu CV để cấp tích xanh");
//   }, 
  
//   updateMedia: async (userId, mediaData) => {
//       // mediaData = { cv_url: '...', intro_video_url: '...' }
//       const db = require('../common/db');
//       const sql = `UPDATE tutors SET ? WHERE user_id = ?`;
//       return await db.query(sql, [mediaData, userId]);
//   },
// };

// module.exports = Service;

const Model = require('../models/tutors.model');
const db = require('../common/db');

const Service = {
  findOne: async (id) => await Model.getById(id),
  findOwnProfile: async (userId) => await Model.getByUserId(userId),

  updateFullProfile: async (userId, data) => {
    const connection = await db.getConnection(); // Lấy connection từ pool
    try {
      await connection.beginTransaction();
      const { user_info, tutor_info, locations, subjects, availabilities } = data;

      // 1. Cập nhật bảng users (Chuẩn hóa home_address -> address)
      if (user_info) {
        const userUpdate = {
          phone: user_info.phone,
          gender: user_info.gender,
          date_of_birth: user_info.date_of_birth,
          address: user_info.home_address // Map đúng tên cột trong DB
        };
        // Loại bỏ các trường undefined
        Object.keys(userUpdate).forEach(key => userUpdate[key] === undefined && delete userUpdate[key]);
        
        await connection.query('UPDATE users SET ? WHERE user_id = ?', [userUpdate, userId]);
      }

      // 2. Cập nhật bảng tutors
      let [tutorRows] = await connection.query('SELECT tutor_id FROM tutors WHERE user_id = ?', [userId]);
      let tutorId;
      if (tutorRows.length === 0) {
        const [res] = await connection.query('INSERT INTO tutors SET ?, user_id = ?', [tutor_info || {}, userId]);
        tutorId = res.insertId;
      } else {
        tutorId = tutorRows[0].tutor_id;
        if (tutor_info) await connection.query('UPDATE tutors SET ? WHERE tutor_id = ?', [tutor_info, tutorId]);
      }

      // 3. Cập nhật các bảng phụ (Xóa và thêm mới)
      if (locations) {
        await connection.query('DELETE FROM tutor_teaching_locations WHERE tutor_id = ?', [tutorId]);
        for (let addr of locations) {
          if (addr.trim()) await connection.query('INSERT INTO tutor_teaching_locations (tutor_id, address) VALUES (?, ?)', [tutorId, addr]);
        }
      }

      if (subjects) {
        await connection.query('DELETE FROM tutor_subject_level WHERE tutor_id = ?', [tutorId]);
        for (let sub of subjects) {
          if (sub.subject_id) {
            await connection.query('INSERT INTO tutor_subject_level (tutor_id, subject_id, level, tuition) VALUES (?, ?, ?, ?)', 
            [tutorId, sub.subject_id, sub.level, sub.tuition]);
          }
        }
      }

      if (availabilities) {
        await connection.query('DELETE FROM tutor_availabilities WHERE tutor_id = ?', [tutorId]);
        for (let avai of availabilities) {
          if (avai.start_time && avai.end_time) {
            await connection.query('INSERT INTO tutor_availabilities (tutor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)', 
            [tutorId, avai.day_of_week, avai.start_time, avai.end_time]);
          }
        }
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error("🔥 Lỗi Transaction:", error.message);
      throw error;
    } finally {
      connection.release();
    }
  },

  verifyBlueTick: async (tutorId, adminId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cập nhật tích xanh cho gia sư
        const [res] = await db.query(`
          SELECT (SELECT COUNT(*) FROM tutor_teaching_locations WHERE tutor_id = t.tutor_id) as loc,
                (SELECT COUNT(*) FROM tutor_subject_level WHERE tutor_id = t.tutor_id) as sub,
                (SELECT COUNT(*) FROM tutor_availabilities WHERE tutor_id = t.tutor_id) as avai,
                t.cv_url, t.experience
          FROM tutors t WHERE t.tutor_id = ?`, [tutorId]);

        if (res && res.loc > 0 && res.sub > 0 && res.avai > 0 && res.cv_url && res.experience) {
          return await db.query('UPDATE tutors SET is_verified = 1, verified_at = NOW() WHERE tutor_id = ?', [tutorId]);
        }
        throw new Error("Thông tin chưa đủ 5 bảng hoặc thiếu CV để cấp tích xanh");

        // 2. Tìm và cập nhật trạng thái thanh toán nộp 200k sang success
        await connection.query(
            "UPDATE payments SET status = 'success', approved_by = ?, approved_at = NOW() WHERE tutor_id = ? AND payment_type = 'verify_profile' AND status = 'pending'",
            [adminId, tutorId]
        );

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally { connection.release(); }
  },

  adjustPoints: async (tutorId, amount, reason, connection = null) => {
    const sqlUpdate = `UPDATE tutors SET accumulated_points = accumulated_points + ? WHERE tutor_id = ?`;
    const sqlLog = `INSERT INTO point_history (tutor_id, amount, reason) VALUES (?, ?, ?)`;
    
    const executor = connection || db; // Dùng connection nếu đang trong transaction
    
    await executor.query(sqlUpdate, [amount, tutorId]);
    await executor.query(sqlLog, [tutorId, amount, reason]);
  },

  getTutorPointHistory: async (userId) => {
    // 1. Tìm thông tin gia sư từ user_id (lấy từ token)
    const tutor = await Model.getBasicTutorInfo(userId);
    if (!tutor) {
      throw new Error("Không tìm thấy hồ sơ Gia sư của bạn");
    }

    // 2. Gọi Model lấy danh sách lịch sử điểm
    return await Model.getPointHistoryByTutorId(tutor.tutor_id);
  }
};

module.exports = Service;