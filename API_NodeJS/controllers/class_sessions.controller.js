const Model = require('../models/class_sessions.model');
const db = require('../common/db');
const TutorModel = require('../services/tutors.service');

module.exports = {
  // Gia sư hoặc Học viên lấy danh sách lớp đang dạy/đang học
  getMyClasses: async (req, res) => {
    try {
      const userId = req.user.id; 
      const roleId = req.user.role_id;

      const profileId = await Model.findProfileIdByUser(userId, roleId);
      
      if (!profileId) {
        return res.status(404).json({ message: "Không tìm thấy hồ sơ người dùng" });
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
      const data = await Model.adminGetAllDetailed(); 
      res.json(data);
    } catch (e) {
      console.error("🔥 Lỗi adminGetAll Controller:", e.message);
      res.status(500).json({ error: e.message });
    }
  },

  // Học viên xác nhận hoàn thành để cộng điểm cho gia sư
  confirmComplete: async (req, res) => {
    const conn = await Model.getConnection(); // Lấy kết nối để làm Transaction
    try {
      await conn.beginTransaction();
      const sessionId = req.params.id;

      // 1. Lấy dữ liệu lớp
      const session = await Model.getRawById(sessionId, conn);
      if (!session) throw new Error("Không tìm thấy lớp học");
      if (session.status !== 'completed') throw new Error("Gia sư chưa gửi yêu cầu hoàn thành lớp");

      // 2. Cập nhật trạng thái lớp thành công (success)
      await Model.updateStatus(sessionId, "success", null, conn);

      // 3. Gọi Model xử lý ĐIỂM + LỊCH SỬ (2 trong 1)
      // Hàm này đã bao gồm lệnh INSERT vào point_history mà bạn nhắc tới
      await TutorModel.adjustPoints(
        session.tutor_id, 
        10, 
        `Học viên xác nhận hoàn thành lớp #${sessionId}`, 
        conn
      );

      await conn.commit();
      res.json({ success: true, message: "Xác nhận thành công và đã cộng điểm uy tín!" });

    } catch (e) {
      await conn.rollback();
      console.error("🔥 Lỗi confirmComplete:", e.message);
      res.status(500).json({ error: e.message });
    } finally {
      conn.release();
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, cancel_reason } = req.body;
      const session = await Model.getRawById(id);

      if (!session) {
        return res.status(404).json({ error: "Không tìm thấy lớp học" });
      }

      if (status === 'completed') {
        if (req.user?.role_id !== 2) {
          return res.status(403).json({ error: "Chỉ gia sư mới có thể gửi yêu cầu hoàn thành lớp" });
        }

        if (session.status !== 'ongoing') {
          return res.status(400).json({ error: "Chỉ lớp đang diễn ra mới có thể báo hoàn thành" });
        }
      }

      // Logic trừ điểm khi hủy (Vẫn gọi Model xử lý)
      if (status === 'cancelled') {
          if (session.status === 'cancelled') {
              return res.status(400).json({ error: "Lớp học này đã bị hủy trước đó" });
          }

          await TutorModel.adjustPoints(session.tutor_id, -5, `Hủy lớp #${id}: ${cancel_reason || 'Không có lý do'}`);
      }

      // Gọi hàm updateStatus trong Model
      await Model.updateStatus(id, status, cancel_reason);
      
      res.json({ message: "Cập nhật trạng thái lớp thành công" });
    } catch (e) {
      console.error("🔥 Lỗi update class_session:", e.message);
      res.status(500).send(e.message);
    }
  }
};