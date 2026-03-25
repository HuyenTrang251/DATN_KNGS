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

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // active, warning, locked
            
            if (!['active', 'warning', 'locked'].includes(status)) {
                return res.status(400).send("Trạng thái không hợp lệ");
            }

            await Service.edit(id, { status });
            res.json({ success: true, message: "Cập nhật trạng thái thành công" });
        } catch (e) {
            res.status(500).send(e.message);
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ middleware authentic
            const profileData = req.body; // Dữ liệu JSON từ frontend

            await Service.updateInfo(userId, profileData);

            res.json({
                success: true,
                message: "Cập nhật thông tin cá nhân thành công!"
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
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
            // Kiểm tra xem trong req.user có những gì
            console.log("Dữ liệu user từ Token:", req.user); 

            if (!req.file) return res.status(400).send("Vui lòng chọn ảnh!");
            
            const userId = req.user.id; 
            const fileNameOnly = req.file.filename; 

            if (!userId) {
                return res.status(401).send("Không tìm thấy ID người dùng trong Token");
            }

            await Service.updateAvatar(userId, fileNameOnly);
            
            res.json({ 
                message: "Cập nhật thành công", 
                filename: fileNameOnly 
            });
        } catch (e) { 
            console.error(e);
            res.status(500).send(e.message); 
        }
    },
};

