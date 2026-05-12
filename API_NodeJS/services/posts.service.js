const Model = require('../models/posts.model');
const ClassModel = require('../models/class_sessions.model');
const PostAppModel = require('../models/post_applications.model');
const PaymentModel = require('../models/payments.model');

const REFUND_REVIEW_WINDOW_DAYS = 5;

const isWithinRefundWindow = (payment) => {
  if (!payment?.updated_at) return false;

  const paymentTime = new Date(payment.updated_at).getTime();
  const deadline = paymentTime + REFUND_REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() <= deadline;
};


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
    const updateData = {};

    // Danh sách các trường hợp lệ trong bảng posts
    const allowedFields = [
        'subject_id', 'grade', 'student_quantity', 'hours_per_session', 
        'sessions_per_week', 'tutor_type', 'teaching_mode', 
        'tuition_fee_per_session', 'contact_phone', 'preferred_gender', 
        'address', 'note', 'status', 'cancel_reason'
    ];

    // Chỉ thêm vào updateData nếu trường đó có trong postData gửi lên
    allowedFields.forEach(field => {
        if (postData[field] !== undefined) {
            // Ép kiểu nếu là trường số
            if (['subject_id', 'student_quantity', 'sessions_per_week'].includes(field)) {
                updateData[field] = Number(postData[field]);
            } else if (['hours_per_session', 'tuition_fee_per_session'].includes(field)) {
                updateData[field] = parseFloat(postData[field]);
            } else {
                updateData[field] = postData[field];
            }
        }
    });

    if (Object.keys(updateData).length === 0) {
        throw new Error("Không có dữ liệu để cập nhật");
    }

    return await Model.update(id, updateData);
  },

  remove: async (id) => {
    return await Model.delete(id);
  },

  finalize: async (postId, action) => {
    const post = await Model.getById(postId);
    if (!post) throw new Error("Bài đăng không tồn tại");

    if (action === 'success') {
      // 1. Tìm xem gia sư nào đã được 'agreed' cho bài này
      const agreedTutor = await PostAppModel.getAgreedTutor(postId);
      
      if (!agreedTutor) {
        throw new Error("Không tìm thấy gia sư đã được đồng ý cho lớp này để khởi tạo.");
      }

      // 2. Cập nhật trạng thái bài đăng
      await Model.update(postId, { 
        status: 'success', 
        connected_at: new Date() 
      });

      // 3. Tạo lớp học chính thức (Truyền student_id từ post và tutor_id từ post_applications)
      await ClassModel.createFromPost({
        student_id: post.student_id,
        tutor_id: agreedTutor.tutor_id,
        post_id: postId
      });

      return { message: "Kết nối lớp và tạo hồ sơ giảng dạy thành công!" };
    } 
    
    else if (action === 'cancel') {
      const agreedTutor = await PostAppModel.getAgreedTutor(postId);
      const payment = agreedTutor
        ? await PaymentModel.getLatestSuccessByPost(postId, agreedTutor.tutor_id)
        : null;
      const refundEligible = isWithinRefundWindow(payment);
      const cancelReason = refundEligible
        ? "Gia sư không liên hệ được học viên. Thanh toán vẫn trong 5 ngày, admin xem xét hoàn tiền."
        : "Gia sư không liên hệ được học viên. Đã quá 5 ngày từ lúc thanh toán thành công, không hoàn tiền.";

      await Model.update(postId, { 
        status: 'cancelled', 
        cancel_reason: cancelReason 
      });
      return {
        message: refundEligible
          ? "Đã hủy yêu cầu. Admin sẽ xem xét hoàn tiền cho giao dịch này."
          : "Đã hủy yêu cầu. Giao dịch không đủ điều kiện hoàn tiền vì đã quá 5 ngày từ lúc thanh toán thành công.",
        refundEligible
      };
    }
  }
};

module.exports = Service;