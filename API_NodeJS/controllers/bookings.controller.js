const Model = require('../models/bookings.model');

module.exports = {
  createBooking: async (req, res) => {
    try {
      // Lấy ID người dùng từ token (đã qua middleware)
      const userId = req.user.id; 
      
      // Lấy dữ liệu từ body của yêu cầu
      const { 
        tutor_id, 
        tutor_subject_level_id, 
        hours_per_session, 
        sessions_per_week, 
        teaching_mode 
      } = req.body;

      // --- BƯỚC 1: LẤY STUDENT_ID ---
      // Đặt tên biến thống nhất là 'students'
      const students = await Model.getStudentIdByUserId(userId);

      // --- BƯỚC 2: KIỂM TRA DỮ LIỆU ---
      // Kiểm tra xem 'students' có tồn tại không và xử lý cả dạng mảng lẫn object
      let studentId = null;
      if (Array.isArray(students) && students.length > 0) {
        studentId = students[0].student_id;
      } else if (students && students.student_id) {
        studentId = students.student_id;
      }

      // Nếu không tìm thấy studentId, báo lỗi 404
      if (!studentId) {
        return res.status(404).json({ 
          error: "Không tìm thấy hồ sơ Học viên. Vui lòng cập nhật thông tin học viên trước khi mời dạy!" 
        });
      }

      // --- BƯỚC 3: CHUẨN BỊ DỮ LIỆU ĐỂ LƯU ---
      const data = {
        student_id: studentId,
        tutor_id: Number(tutor_id),
        tutor_subject_level_id: Number(tutor_subject_level_id),
        hours_per_session: Number(hours_per_session) || 2, // Mặc định 2 giờ nếu thiếu
        sessions_per_week: Number(sessions_per_week) || 2, // Mặc định 2 buổi nếu thiếu
        teaching_mode: teaching_mode || 'offline',
        status: 'pending'
      };

      // --- BƯỚC 4: LƯU VÀO DATABASE ---
      await Model.create(data);

      return res.status(201).json({ message: "Đã gửi lời mời dạy thành công!" });

    } catch (e) {
      // In lỗi ra terminal của Backend để dev kiểm tra
      console.error("🔥 Lỗi chi tiết tại Controller:", e);
      
      // Trả về lỗi cho Frontend hiện alert
      return res.status(500).json({ 
        error: "Gửi yêu cầu thất bại: " + (e.sqlMessage || e.message) 
      });
    }
  },

  updateBooking: async (req, res) => {
    try {
      const booking = await Model.getById(req.params.id);
      if (!booking || booking.status !== 'pending') return res.status(403).send("Không thể sửa yêu cầu đã được xử lý");
      await Model.update(req.params.id, req.body);
      res.json({ message: "Cập nhật thành công" });
    } catch (e) { res.status(500).send(e.message); }
  },

  deleteBooking: async (req, res) => {
    try {
      const booking = await Model.getById(req.params.id);
      if (!booking || booking.status !== 'pending') return res.status(403).send("Không thể xóa yêu cầu đã được xử lý");
      await Model.delete(req.params.id);
      res.json({ message: "Đã xóa yêu cầu" });
    } catch (e) { res.status(500).send(e.message); }
  },

  cancelBooking: async (req, res) => {
    try {
      const booking = await Model.getById(req.params.id);
      if (booking.status === 'approved') {
        await Model.update(req.params.id, { status: 'cancelled' });
        return res.json({ message: "Học viên đã hủy yêu cầu mời dạy" });
      }
      res.status(400).send("Trạng thái hiện tại không được phép hủy");
    } catch (e) { res.status(500).send(e.message); }
  },

  respondBooking: async (req, res) => {
    try {
      const { status } = req.body; // 'success' (đồng ý) hoặc 'rejected' (từ chối)
      const booking = await Model.getById(req.params.id);
      if (booking.status !== 'approved') return res.status(400).send("Yêu cầu chưa được duyệt bởi Admin");
      await Model.update(req.params.id, { status });
      res.json({ message: "Đã phản hồi lời mời dạy" });
    } catch (e) { res.status(500).send(e.message); }
  }
};