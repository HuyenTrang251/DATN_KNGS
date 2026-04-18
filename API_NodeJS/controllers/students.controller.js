const Service = require('../services/students.service');

module.exports = {
  getAll: async (req, res) => {
    try { 
      const data = await Service.findAll(); 
      res.json(data); 
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  // Lấy profile bằng userId (id truyền từ params chính là user.id của FE)
  getByIdUser: async (req, res) => {
    try { 
      const data = await Service.findMe(req.params.id); 
      if (!data) return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
      res.json(data); 
    } catch (e) { res.status(500).json({ message: e.message }); }
  },

  // Update profile bằng userId
  update: async (req, res) => {
    try { 
      const result = await Service.editProfile(req.params.id, req.body); 
      res.json(result); 
    } catch (e) { res.status(500).json({ message: e.message }); }
  }
};