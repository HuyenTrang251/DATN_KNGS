const Service = require('../services/payments.service');
const { validate } = require('../validations/payments.validation');

module.exports = {
  update: async (req, res) => {
    try {
      const { id } = req.params; 
      const { status } = req.body; 
      const adminId = req.user.id; // Kiểm tra kĩ token có trường id không

      // console.log("--- [DEBUG CONTROLLER] ---");
      // console.log("ID nhận từ URL:", id);
      // console.log("Status nhận từ Body:", status);
      // console.log("AdminId nhận từ Token:", adminId);

      if (!id || !status || !adminId) {
        throw new Error("Thiếu tham số: id, status hoặc adminId bị undefined");
      }

      await Service.approvePayment(id, status, adminId);
      
      res.json({ success: true, message: 'Duyệt thanh toán thành công' });
    } catch (e) {
        console.error("🔥 Lỗi Controller:", e.message);
        res.status(500).json({ error: e.message });
    }
  },
  getAll: async (req, res) => {
    try { const data = await Service.findAll(); res.json(data); } catch (e) { res.status(500).send(e.message); }
  },
  getById: async (req, res) => {
    try { const data = await Service.findOne(req.params.id); res.json(data); } catch (e) { res.status(500).send(e.message); }
  },
  create: async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      const result = await Service.add(req.body);
      res.status(201).json(result);
    } catch (e) { res.status(500).send(e.message); }
  },
 
  delete: async (req, res) => {
    try { await Service.remove(req.params.id); res.send('Deleted successfully'); } catch (e) { res.status(500).send(e.message); }
  }
};