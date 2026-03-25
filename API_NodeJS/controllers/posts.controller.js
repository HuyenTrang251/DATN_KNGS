const Service = require('../services/posts.service');
const Model = require('../models/posts.model');

module.exports = {

  getAll: async (req, res) => {
    try {
        const data = await Model.getAllAdmin(); 
        res.json(data);
    } catch (e) {
        res.status(500).send(e.message);
    }
  },

  getApproved: async (req, res) => {
    try {

      const data = await Service.findApproved();
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  getStudentPosts: async (req, res) => {
    try {
        const userId = req.user.id; 

        if (!userId) {
            return res.status(401).send("Không xác định được danh tính người dùng");
        }

        const data = await Service.findStudentPosts(userId);
        res.json(data);
    } catch (e) {
        console.error("🔥 Lỗi getStudentPosts:", e.message);
        res.status(500).send(e.message);
    }
  },

  getTutorApplications: async (req, res) => {
    try {
        const userId = req.user.id; 
        if (!userId) {
            return res.status(401).json({ message: "Không xác định được danh tính gia sư" });
        }
        const data = await Service.findTutorApplications(userId);
        res.json(data);
    } catch (e) {
        console.error("🔥 Lỗi getTutorApplications:", e.message);
        res.status(500).send(e.message);
    }
  },

   // API Duyệt trạng thái từ trang Admin
  updateStatus: async (req, res) => {
    try {
      const postId = req.params.id;
      const { status, reason, commissionPercent, supportPercent } = req.body;
      const adminId = req.user.id; // Lấy ID admin từ Token

      if (status === 'approved') {
        // Nếu duyệt: tính phí và lưu bảng offer
        const result = await Service.approveAndCalculateFee(postId, commissionPercent, supportPercent, adminId);
        return res.json({ message: "Đã duyệt và tính phí", data: result });
      } 
      
      if (status === 'rejected') {
        // Nếu từ chối: lưu lý do
        await Service.rejectPost(postId, reason, adminId);
        return res.json({ message: "Đã từ chối bài đăng" });
      }

      // Các trạng thái khác (pending, cancelled...)
      await Model.update(postId, { status });
      res.json({ message: "Cập nhật trạng thái thành công" });

    } catch (e) {
      console.error("🔥 Error Post Controller:", e.message);
      res.status(500).json({ message: e.message });
    }
  },

  getById: async (req, res) => {
    try {

      const data = await Service.findOne(req.params.id);
      res.json(data);

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  create: async (req, res) => {
    try {
      // req.user.id lấy từ middleware authentic
      const userId = req.user.id; 
      const postData = req.body;

      // Gọi service để xử lý toàn bộ logic
      const result = await Service.add(userId, postData);

      res.status(201).json({
        message: "Đăng bài thành công! Bài viết của bạn đang chờ phê duyệt.",
        data: result
      });

    } catch (e) {
      console.error("🔥 Lỗi PostController:", e.message);
      
      // Nếu lỗi do không tìm thấy học viên thì trả về 403, còn lại trả về 400
      const status = e.message.includes("không có hồ sơ") ? 403 : 400;
      res.status(status).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {

      await Service.edit(req.params.id, req.body);
      res.send('Updated successfully');

    } catch (e) {
      res.status(500).send(e.message);
    }
  },

  delete: async (req, res) => {
    try {

      await Service.remove(req.params.id);
      res.send('Deleted successfully');

    } catch (e) {
      res.status(500).send(e.message);
    }
  }

};