const Model = require('../models/post_applications.model');

const Service = {
  addApplication: async (userId, postId) => {
    // 1. Lấy dữ liệu
    const result = await Model.getTutorIdByUserId(userId);

    // 2. Lấy tutorId (Hỗ trợ cả mảng và object)
    let tutorId = null;
    if (Array.isArray(result) && result.length > 0) {
      tutorId = result[0].tutor_id;
    } else if (result && result.tutor_id) {
      tutorId = result.tutor_id;
    }

    if (!tutorId) {
      throw new Error("Tài khoản của bạn chưa cập nhật hồ sơ Gia sư.");
    }

    // 3. Kiểm tra trùng lặp (Hàm này vừa được sửa ở Model)
    const isApplied = await Model.checkExist(postId, tutorId);
    if (isApplied) {
      throw new Error("Bạn đã gửi yêu cầu nhận lớp này rồi.");
    }

    // 4. Lưu vào database
    return await Model.create({ post_id: postId, tutor_id: tutorId, status: 'pending' });
  },
};

module.exports = Service;