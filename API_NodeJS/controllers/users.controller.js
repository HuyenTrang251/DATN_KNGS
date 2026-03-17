const Service = require('../services/users.service');
const { validate } = require('../validations/users.validation');

module.exports = {
  getAll: async (req, res) => {
    try { const data = await Service.findAll(); res.json(data); } catch (e) { res.status(500).send(e.message); }
  },
  
  getById: async (req, res) => {
    try {
        const data = await Service.findOne(req.params.id);
        if (data && data.avatar) {
            // Tự động nối domain và thư mục cố định vào tên file
            const protocol = req.protocol; // http
            const host = req.get('host');  // localhost:3300
            data.avatar_url = `${protocol}://${host}/uploads/avatars/${data.avatar}`;
        }
        res.json(data);
    } catch (e) { res.status(500).send(e.message); }
  },

//   create: async (req, res) => {
//       try {
//           const { error } = validate(req.body);
//           if (error) return res.status(400).send(error.details[0].message);
          
//           const result = await Service.add(req.body);
//           res.status(201).json({ message: "Tạo người dùng thành công", result });
//       } catch (e) { res.status(500).send(e.message); }
//   },

  addEmployee: async (req, res) => {
    try {
        // Lấy toàn bộ thông tin từ form Admin (bao gồm cả giới tính, địa chỉ, ngày sinh...)
        const { 
            role_id, full_name, email, phone, password, 
            gender, date_of_birth, address, avatar, status 
        } = req.body;

        // ĐÓNG GÓI TẤT CẢ THÔNG TIN
        const newEmployee = { 
            role_id, 
            full_name, 
            email, 
            phone, 
            password,
            gender,
            date_of_birth,
            address,
            avatar,
            status: status || 'active'
        };

        // Khi truyền newEmployee vào Model, SQL sẽ tự động INSERT đầy đủ các cột này
        const result = await Service.add(newEmployee); 
        res.status(201).json({ message: "Thêm nhân viên thành công" });
    } catch (e) { res.status(500).send(e.message); }
},

  update: async (req, res) => {
      try {
          // Khi update profile, validation thường lỏng hơn hoặc cần schema riêng
          await Service.edit(req.params.id, req.body);
          res.send('Cập nhật thông tin thành công');
      } catch (e) { res.status(500).send(e.message); }
  },

  // API đổi mật khẩu
  changePassword: async (req, res) => {
    try {
        const userId = req.userId; // Lấy từ token sau khi qua middleware authentic
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send("Vui lòng nhập đầy đủ mật khẩu cũ và mới");
        }

        await Service.changePassword(userId, oldPassword, newPassword);
        res.send('Đổi mật khẩu thành công');
    } catch (e) { 
        res.status(400).send(e.message); 
    }
  },

  delete: async (req, res) => {
      try { await Service.remove(req.params.id); res.send('Xóa thành công'); } catch (e) { res.status(500).send(e.message); }
  },

  updateAvatar: async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("Vui lòng chọn ảnh!");
        
        // CHỈ LẤY TÊN FILE: avatar-123456.jpg
        const fileNameOnly = req.file.filename; 
        
        await Service.updateAvatar(req.userId, fileNameOnly);
        res.json({ 
            message: "Cập nhật thành công", 
            filename: fileNameOnly 
        });
    } catch (e) { res.status(500).send(e.message); }
  },
};

