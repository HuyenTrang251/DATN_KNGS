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
    const post = await Model.getById(postId);
    if (!post) throw new Error("Không tìm thấy bài đăng");

    // Quy tắc: Học phí 1 buổi * số buổi/tuần * 4 tuần (1 tháng) * % hoa hồng
    const monthlyTuition = parseFloat(post.tuition_fee_per_session) * parseInt(post.sessions_per_week) * 4;
    const feeReceive = monthlyTuition * (parseFloat(commissionPercent) / 100);

    // 1. Update trạng thái bài đăng
    await Model.update(postId, {
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date(),
      cancel_reason: null
    });

    // 2. Lưu vào bảng offer
    await Model.saveOffer(postId, feeReceive, supportPercent);

    return { feeReceive };
  },

  // Từ chối bài đăng
  rejectPost: async (postId, reason, adminId) => {
    return await Model.update(postId, {
      status: 'rejected',
      cancel_reason: reason,
      approved_by: adminId,
      approved_at: new Date()
    });
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

   // Hàm add nhận thêm userId để xử lý lấy student_id
  add: async (userId, postData) => {
    // 1. Gọi model lấy dữ liệu
    const result = await Model.getStudentIdByUserId(userId);

    // 2. Lấy student_id một cách an toàn (Handle cả mảng và object)
    let studentId = null;
    if (Array.isArray(result) && result.length > 0) {
      studentId = result[0].student_id; // Trường hợp trả về mảng
    } else if (result && result.student_id) {
      studentId = result.student_id; // Trường hợp trả về object đơn lẻ
    }

    // 3. Nếu không tìm thấy studentId, chặn lại và báo lỗi
    if (!studentId) {
      throw new Error("Không tìm thấy hồ sơ Học viên cho tài khoản này.");
    }

    // 4. Chuẩn bị dữ liệu để lưu
    const finalData = {
      student_id: studentId,
      subject_id: Number(postData.subject_id),
      grade: postData.grade,
      student_quantity: Number(postData.student_quantity) || 1,
      hours_per_session: parseFloat(postData.hours_per_session) || 2,
      sessions_per_week: Number(postData.sessions_per_week) || 2,
      tutor_type: postData.tutor_type || 'all',
      teaching_mode: postData.teaching_mode || 'offline',
      tuition_fee_per_session: parseFloat(postData.tuition_fee_per_session) || 0,
      contact_phone: postData.contact_phone,
      preferred_gender: postData.preferred_gender || 'none',
      address: postData.address,
      note: postData.note,
      status: 'pending'
    };

    return await Model.create(finalData);
  },

  edit: async (id, postData) => {
    // CHỈ LỌC RA những trường có trong cấu trúc bảng posts
    const updateData = {
      subject_id: Number(postData.subject_id),
      grade: postData.grade,
      student_quantity: Number(postData.student_quantity),
      hours_per_session: parseFloat(postData.hours_per_session),
      sessions_per_week: Number(postData.sessions_per_week),
      tutor_type: postData.tutor_type,
      teaching_mode: postData.teaching_mode,
      tuition_fee_per_session: parseFloat(postData.tuition_fee_per_session),
      contact_phone: postData.contact_phone,
      preferred_gender: postData.preferred_gender,
      address: postData.address,
      note: postData.note
    };

    // Loại bỏ các trường undefined để tránh lỗi SQL
    Object.keys(updateData).forEach(key => 
      (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]
    );

    return await Model.update(id, updateData);
  },

  remove: async (id) => {
    return await Model.delete(id);
  }
};

module.exports = Service;