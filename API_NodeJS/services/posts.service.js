const Model = require('../models/posts.model');

const Service = {
  // Lấy tất cả bài đăng (đã JOIN với bảng offer)
  findAll: async () => {
    return await Model.getAll();
  },

  // Lấy bài đăng đã duyệt (đã JOIN với bảng offer)
  findApproved: async () => {
    return await Model.getApproved();
  },

  // Hàm xử lý nghiệp vụ duyệt bài và tính phí
  approveAndCalculateFee: async (postId, commissionPercent, supportPercent, adminId) => {
    // 1. Lấy thông tin chi tiết bài đăng từ Model để lấy giá tiền và số buổi
    const post = await Model.getById(postId);
    if (!post) {
      throw new Error("Không tìm thấy bài đăng");
    }

    // 2. Logic tính phí (Business Logic)
    const monthlyTuition = post.tuition_fee_per_session * post.sessions_per_week * 4;
    const feeReceive = monthlyTuition * (commissionPercent / 100);

    // 3. Gọi Model để cập nhật trạng thái bài đăng
    const updatePostData = {
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date()
    };
    await Model.update(postId, updatePostData);

    // 4. Gọi Model để lưu hoặc cập nhật thông tin vào bảng offer
    // Lưu ý: Bạn cần thêm hàm saveOffer vào file Model (xem bên dưới)
    await Model.saveOffer(postId, feeReceive, supportPercent);

    return { monthlyTuition, feeReceive };
  },

  // Các hàm cũ của bạn
  findStudentPosts: async (userId) => {
    return await Model.getByStudent(userId);
  },

  findTutorApplications: async (userId) => {
    return await Model.getTutorApplications(userId);
  },

  updateStatus: async (postId, status, reason, adminId) => {
    const allowedStatus = ['approved', 'rejected', 'pending'];
    if (!allowedStatus.includes(status)) {
      throw new Error("Trạng thái không hợp lệ");
    }
    const data = {
      status,
      approved_by: adminId,
      approved_at: new Date()
    };
    if (status === 'rejected') {
      data.cancel_reason = reason;
    }
    await Model.update(postId, data);
  },

  findOne: async (id) => {
    return await Model.getById(id);
  },

  add: async (data) => {
    return await Model.create(data);
  },

  edit: async (id, data) => {
    return await Model.update(id, data);
  },

  remove: async (id) => {
    return await Model.delete(id);
  }
};

module.exports = Service;