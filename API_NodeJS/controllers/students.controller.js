const Service = require('../services/students.service');

module.exports = {
  // Lấy danh sách cho trang quản lý Admin
  getAll: async (req, res) => {
    try { 
      const data = await Service.findAll(); 
      res.json(data); 
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  },

  // Lấy chi tiết để đổ vào form edit
  getById: async (req, res) => {
    try { 
      const data = await Service.findOne(req.params.id); 
      if (!data) return res.status(404).json({ message: "Không tìm thấy học viên" });
      res.json(data); 
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  },

  // Update profile tích hợp 2 bảng
  update: async (req, res) => {
    try { 
      const result = await Service.editProfile(req.params.id, req.body); 
      res.json(result); 
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  }
};