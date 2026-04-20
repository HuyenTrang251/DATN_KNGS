const Model = require('../models/class_sessions.model');
const db = require('../common/db');

module.exports = {
  // Gia sư hoặc Học viên lấy danh sách lớp đang dạy/đang học
  getMyClasses: async (req, res) => {
    try {
      const userId = req.user.id; 
      const roleId = req.user.role_id;

      let profileId;
      if (roleId == 2) {
        const rows = await db.query('SELECT tutor_id FROM tutors WHERE user_id = ?', [userId]);
        if (!rows || rows.length === 0) return res.status(404).send("Hồ sơ gia sư không tồn tại");
        profileId = rows[0].tutor_id;
      } else {
        const rows = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
        if (!rows || rows.length === 0) return res.status(404).send("Hồ sơ học viên không tồn tại");
        profileId = rows[0].student_id;
      }

      // Gọi model với 3 tham số: role, id bảng phụ, id user từ token
      const data = await Model.getByRole(roleId == 2 ? 'tutor' : 'student', profileId, userId);
      res.json(data);
    } catch (e) {
      console.error("🔥 Lỗi getMyClasses:", e.message);
      res.status(500).send(e.message);
    }
  },

  // Admin lấy hết
  adminGetAll: async (req, res) => {
    try {
      // SỬA TÊN HÀM TẠI ĐÂY: Gọi đúng adminGetAllDetailed
      const data = await Model.adminGetAllDetailed(); 
      res.json(data);
    } catch (e) {
      console.error("🔥 Lỗi adminGetAll Controller:", e.message);
      res.status(500).json({ error: e.message });
    }
  },

  // Học viên xác nhận hoàn thành để cộng điểm cho gia sư
  confirmComplete: async (req, res) => {
    const conn = await db.getConnection(); // Lấy kết nối để làm Transaction
    try {
      await conn.beginTransaction();
      const sessionId = req.params.id;

      // 1. Lấy thông tin lớp học để biết Tutor là ai
      const [sessions] = await conn.execute(
        'SELECT * FROM class_sessions WHERE class_session_id = ?', 
        [sessionId]
      );
      const session = sessions[0];
      if (!session) throw new Error("Không tìm thấy lớp học");

      // 2. Cập nhật trạng thái lớp sang 'success'
      await conn.execute(
        'UPDATE class_sessions SET status = "success" WHERE class_session_id = ?', 
        [sessionId]
      );

      // 3. Cộng 10 điểm cho gia sư
      await conn.execute(
        'UPDATE tutors SET accumulated_points = accumulated_points + 10 WHERE tutor_id = ?', 
        [session.tutor_id]
      );

      // 4. Lưu vào bảng point_history
      await conn.execute(
        'INSERT INTO point_history (tutor_id, amount, reason) VALUES (?, ?, ?)', 
        [session.tutor_id, 10, `Học viên xác nhận hoàn thành lớp #${sessionId}`]
      );

      await conn.commit(); // Hoàn tất mọi việc
      res.json({ message: "Xác nhận thành công! Gia sư đã được cộng 10 điểm uy tín." });
    } catch (e) {
      await conn.rollback(); // Nếu 1 trong các bước trên lỗi, hủy hết để tránh sai dữ liệu
      console.error("🔥 Lỗi confirmComplete:", e.message);
      res.status(500).json({ error: e.message });
    } finally {
      conn.release(); // Giải phóng kết nối
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, cancel_reason } = req.body;

      // Gọi hàm updateStatus trong Model
      await Model.updateStatus(id, status, cancel_reason);
      
      res.json({ message: "Cập nhật trạng thái lớp thành công" });
    } catch (e) {
      console.error("🔥 Lỗi update class_session:", e.message);
      res.status(500).send(e.message);
    }
  }
};