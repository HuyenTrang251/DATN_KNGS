const Model = require('../models/bookings.model');
const PaymentModel = require('../models/payments.model');

const REFUND_REVIEW_WINDOW_DAYS = 5;

const isWithinRefundWindow = (payment) => {
  if (!payment?.updated_at) return false;

  const paymentTime = new Date(payment.updated_at).getTime();
  const deadline = paymentTime + REFUND_REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() <= deadline;
};

module.exports = {
  // --- NHÓM ADMIN ---
  adminGetAll: async (req, res) => {
    try {
      const data = await Model.getAllForAdmin();
      res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  },

  getDetailById: async (req, res) => {
    try {
      const data = await Model.getDetailById(req.params.id);
      if (!data) return res.status(404).json({ message: "Không tìm thấy" });
      
      // Console log ở Backend để kiểm tra xem có trường has_pending_payment chưa
      console.log("✅ Dữ liệu chi tiết gửi về FE:", {
        id: data.booking_id,
        has_payment: data.has_pending_payment,
        payment_id: data.payment_id
      });
      
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  adminUpdateStatus: async (req, res) => {
    try {
      const { status, cancel_reason } = req.body;
      // Gọi hàm updateStatus tường minh trong Model để tránh lỗi SQL
      await Model.updateStatus(req.params.id, status, req.user.id, cancel_reason);
      res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },

  // --- NHÓM HỌC VIÊN ---
  studentGetMyBookings: async (req, res) => {
    console.log("--- [DEBUG CONTROLLER STUDENT] User từ Token:", req.user);
    try {
      // 1. Lấy ID từ token (Trong login bạn lưu là 'id')
      const userId = req.user.id; 

      // 2. Tìm student_id
      const studentRes = await Model.getStudentIdByUserId(userId);
      
      // Kiểm tra mảng hoặc object để lấy student_id
      let studentId = null;
      if (Array.isArray(studentRes) && studentRes.length > 0) {
        studentId = studentRes[0].student_id;
      } else if (studentRes && studentRes.student_id) {
        studentId = studentRes.student_id;
      }

      console.log("--- [DEBUG CONTROLLER STUDENT] studentId tìm thấy:", studentId);

      if (!studentId) {
        return res.status(404).json({ message: "Không tìm thấy hồ sơ học viên" });
      }

      // 3. Lấy dữ liệu đặt lịch
      const data = await Model.getByStudent(studentId);
      res.json(data);

    } catch (e) {
      console.error("🔥 LỖI TẠI CONTROLLER HỌC VIÊN:", e.message);
      res.status(500).json({ error: e.message });
    }
  },

  createBooking: async (req, res) => {
    try {
      const studentRes = await Model.getStudentIdByUserId(req.user.id);
      if (!studentRes || studentRes.length === 0) return res.status(403).send("Bạn cần có hồ sơ Học viên để thực hiện chức năng này");

      const hoursPerSession = Number(req.body.hours_per_session);
      const sessionsPerWeek = Number(req.body.sessions_per_week);

      if (!Number.isInteger(hoursPerSession) || hoursPerSession < 1 || hoursPerSession > 99) {
        return res.status(400).json({ error: "Số giờ mỗi buổi phải là số nguyên từ 1 đến 99" });
      }

      if (!Number.isInteger(sessionsPerWeek) || sessionsPerWeek < 1 || sessionsPerWeek > 99) {
        return res.status(400).json({ error: "Số buổi mỗi tuần phải là số nguyên từ 1 đến 99" });
      }

      const data = {
        ...req.body,
        student_id: studentRes[0].student_id,
        hours_per_session: hoursPerSession,
        sessions_per_week: sessionsPerWeek,
        status: 'approved'
      };
      await Model.create(data);
      res.status(201).json({ message: "Gửi lời mời dạy thành công!" });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },

  studentCancel: async (req, res) => {
    try {
      const booking = await Model.getDetailById(req.params.id);
      if (!booking) return res.status(404).send("Không tìm thấy yêu cầu");

      if (booking.status === 'pending' || booking.status === 'approved') {
        // Cập nhật thông qua Model (Không dùng db.query trực tiếp ở Controller)
        await Model.update(req.params.id, { status: 'cancelled' });
        return res.json({ message: "Đã hủy yêu cầu thành công" });
      }
      res.status(400).json({ error: "Không thể hủy yêu cầu ở trạng thái hiện tại" });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },

  deleteBooking: async (req, res) => {
    try {
      const booking = await Model.getDetailById(req.params.id);
      if (!booking || booking.status !== 'pending') return res.status(403).send("Chỉ có thể xóa yêu cầu đang chờ duyệt");
      await Model.delete(req.params.id);
      res.json({ message: "Đã xóa yêu cầu thành công" });
    } catch (e) { res.status(500).send(e.message); }
  },

  // --- NHÓM GIA SƯ ---
  tutorGetInvitations: async (req, res) => {
    console.log("--- [DEBUG CONTROLLER] Request nhận được. User từ Token:", req.user);
    try {
      // 1. Lấy ID người dùng từ Token (id: 29)
      const userId = req.user.id; 
      if (!userId) throw new Error("Token không hợp lệ hoặc thiếu ID người dùng");

      // 2. Tìm tutor_id
      const tutorRes = await Model.getTutorIdByUserId(userId);
      console.log("--- [DEBUG CONTROLLER] Kết quả từ Model.getTutorIdByUserId:", tutorRes);

      // Xử lý lấy ID linh hoạt
      let tutorId = null;
      if (Array.isArray(tutorRes) && tutorRes.length > 0) {
        tutorId = tutorRes[0].tutor_id;
      } else if (tutorRes && tutorRes.tutor_id) {
        tutorId = tutorRes.tutor_id;
      }

      console.log("--- [DEBUG CONTROLLER] tutorId cuối cùng dùng để query:", tutorId);

      if (!tutorId) {
        return res.status(404).json({ message: "Không tìm thấy hồ sơ gia sư gắn với tài khoản này" });
      }

      // 3. Lấy dữ liệu
      const data = await Model.getByTutor(tutorId);
      
      // Xử lý bảo mật SĐT (giống logic bạn muốn)
      const formattedData = data.map(item => ({
        ...item,
        student_phone: item.payment_status === 'success' ? item.student_phone_raw : 'Ẩn (Chờ thanh toán)'
      }));

      res.json(formattedData);

    } catch (e) {
      console.error("🔥 LỖI TẠI CONTROLLER GIA SƯ:", e.message);
      res.status(500).json({ error: e.message });
    }
  },

  tutorRespond: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // FE gửi lên 'agreed' hoặc 'rejected'

      // 1. Kiểm tra đầu vào
      if (!status) {
        return res.status(400).json({ error: "Thiếu trạng thái phản hồi" });
      }

      // 2. Logic Mapping: Chuyển 'agreed' của FE thành 'connecting' của DB
      // Giải thích: Bảng bookings của bạn dùng ENUM 'connecting' để chỉ trạng thái gia sư đồng ý và chờ nộp phí/duyệt phí.
      let dbStatus = status;
      if (status === 'agreed') {
        dbStatus = 'connecting';
      }

      // 3. Kiểm tra tính hợp lệ của giá trị ENUM trước khi xuống Database
      const validStatuses = ['rejected', 'connecting'];
      if (!validStatuses.includes(dbStatus)) {
        return res.status(400).json({ error: "Trạng thái phản hồi không hợp lệ" });
      }

      // 4. Kiểm tra sự tồn tại của yêu cầu đặt lịch
      const booking = await Model.getDetailById(id);
      if (!booking) {
        return res.status(404).json({ error: "Không tìm thấy yêu cầu đặt lịch này" });
      }

      // 5. Kiểm tra logic nghiệp vụ: 
      // Gia sư chỉ được phản hồi khi bài đăng đang ở trạng thái 'approved' (Admin đã duyệt bài)
      if (booking.status !== 'approved') {
        return res.status(400).json({ error: "Yêu cầu này đã được xử lý hoặc không còn hiệu lực" });
      }

      // 6. Cập nhật trạng thái vào Database thông qua Model
      await Model.update(id, { status: dbStatus });

      // 7. Trả về thông báo thành công tùy theo hành động
      const successMessage = dbStatus === 'connecting' 
        ? "Bạn đã đồng ý nhận lớp. Vui lòng tiến hành thanh toán phí để xem số điện thoại học viên."
        : "Bạn đã từ chối lời mời dạy này.";

      res.json({ message: successMessage, status: dbStatus });

    } catch (e) {
      console.error("🔥 Lỗi nghiêm trọng tại tutorRespond Controller:", e.message);
      res.status(500).json({ error: "Lỗi hệ thống: " + e.message });
    }
  },

  tutorConfirmConnect: async (req, res) => {
    try {
      const bookingId = req.params.id;
      const { action } = req.body; // Lấy 'success' hoặc 'cancel' gửi từ Frontend

      console.log(`>>> Gia sư xác nhận Booking #${bookingId} với hành động: ${action}`);

      // 1. Kiểm tra yêu cầu đặt lịch có tồn tại không
      const booking = await Model.getDetailById(bookingId);
      if (!booking) return res.status(404).send("Yêu cầu không tồn tại");

      // ================== TRƯỜNG HỢP 1: LIÊN HỆ THÀNH CÔNG ==================
      if (action === 'success') {
        
        // A. Cập nhật trạng thái booking thành công
        await Model.update(bookingId, { 
          status: 'success', 
          connected_at: new Date() 
        });
        
        // B. Tạo lớp học mới vào bảng class_sessions
        await Model.createClassSession({
          student_id: booking.student_id,
          tutor_id: booking.tutor_id,
          booking_id: booking.booking_id,
          status: 'ongoing' // Lớp học đang diễn ra
        });

        return res.json({ message: "Xác nhận kết nối thành công! Lớp học đã được tạo." });
      } 
      
      // ================== TRƯỜNG HỢP 2: LIÊN HỆ THẤT BẠI ==================
      else if (action === 'cancel') {
        const payment = await PaymentModel.getLatestSuccessByBooking(booking.booking_id);
        const refundEligible = isWithinRefundWindow(payment);
        const cancelReason = refundEligible
          ? "Gia sư không liên hệ được học viên. Thanh toán vẫn trong 5 ngày, admin xem xét hoàn tiền."
          : "Gia sư không liên hệ được học viên. Đã quá 5 ngày từ lúc thanh toán thành công, không hoàn tiền.";
        
        // Cập nhật trạng thái hủy và lưu lý do mặc định
        await Model.update(bookingId, { 
          status: 'cancelled', 
          cancel_reason: cancelReason 
        });

        return res.json({
          message: refundEligible
            ? "Đã ghi nhận liên hệ thất bại. Yêu cầu đã được hủy và admin sẽ xem xét hoàn tiền."
            : "Đã ghi nhận liên hệ thất bại. Yêu cầu đã được hủy và không đủ điều kiện hoàn tiền vì đã quá 5 ngày từ lúc thanh toán thành công.",
          refundEligible
        });
      } 
      
      // Trường hợp Frontend gửi lên action lạ
      else {
        return res.status(400).json({ error: "Hành động không hợp lệ" });
      }

    } catch (e) { 
        console.error("🔥 Lỗi tại tutorConfirmConnect:", e.message);
        res.status(500).json({ error: e.message }); 
    }
  }
};