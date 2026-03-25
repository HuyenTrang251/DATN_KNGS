const Service = require('../services/post_applications.service');
const Model = require('../models/post_applications.model');

module.exports = {
  // Lấy danh sách gia sư ứng tuyển theo bài đăng (Học viên xem)
  getByPostId: async (req, res) => {
    try {
      const data = await Model.getByPostId(req.params.postId);
      res.json(data);
    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  // Học viên phản hồi (Đồng ý/Từ chối)
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body; // 'agreed' hoặc 'rejected'
      await Model.updateStatus(req.params.id, status);
      res.json({ message: "Phản hồi thành công" });
    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  create: async (req, res) => {
    console.log("--- [DEBUG CONTROLLER] Request nhận được. User từ Token:", req.user);
    try {
      const userId = req.user.id; // Kiểm tra xem token của bạn là .id hay .user_id
      const { post_id } = req.body;

      if (!post_id) return res.status(400).json({ message: "Thiếu mã lớp học" });

      await Service.addApplication(userId, post_id);
      res.status(201).json({ message: "Đã gửi yêu cầu nhận lớp thành công!" });
    } catch (e) {
      console.error("--- [DEBUG CONTROLLER] Lỗi cuối cùng:", e.message);
      res.status(400).json({ message: e.message });
    }
  }
};