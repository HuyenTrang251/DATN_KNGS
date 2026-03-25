const Model = require('../models/payments.model');

const Service = {
  create: async (req, res) => {
    try {
      const { tutor_id, post_id, booking_id, payment_type, amount, transaction_code } = req.body;

      // Chuẩn bị dữ liệu sạch
      const paymentData = {
        tutor_id: Number(tutor_id),
        post_id: post_id ? Number(post_id) : null,
        booking_id: booking_id ? Number(booking_id) : null,
        payment_type: payment_type, // 'verify_profile', 'receive_job', 'receive_booking'
        amount: parseFloat(amount),
        transaction_code: transaction_code,
        status: 'pending'
      };

      const result = await Service.add(paymentData);
      res.status(201).json({ message: "Gửi thông tin thanh toán thành công", result });
      
    } catch (e) {
      // IN LỖI RA TERMINAL ĐỂ KIỂM TRA (Ví dụ: trùng transaction_code hoặc sai ENUM)
      console.error("🔥 Lỗi tạo Payment:", e.sqlMessage || e.message);
      
      res.status(500).json({ 
        message: "Lỗi hệ thống database", 
        error: e.sqlMessage || e.message 
      });
    }
  },

  // Hàm xử lý duyệt
  approvePayment: async (id, status, adminId) => {
    // console.log("--- [DEBUG SERVICE] ---");
    // console.log("Truyền sang Model với thứ tự: id, status, adminId");
    
    // Gọi Model: Phải khớp với định dạng hàm ở Model
    return await Model.updateStatus(id, status, adminId);
  },
  
  findAll: async () => await Model.getAll(),
  findOne: async (id) => await Model.getById(id),
  add: async (data) => await Model.create(data),
  edit: async (id, data) => await Model.update(id, data),
  remove: async (id) => await Model.delete(id)
};

module.exports = Service;