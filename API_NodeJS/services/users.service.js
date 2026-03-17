const Model = require('../models/users.model');
const bcrypt = require('bcryptjs');
const db = require('../common/db');

const UsersService = {
    findAll: async () => await Model.getAll(),
    findOne: async (id) => await Model.getById(id),

    // TRƯỜNG HỢP 1: THÊM MỚI (Đăng ký)
    add: async (data) => {
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return await Model.create(data);
    },

    // TRƯỜNG HỢP 2 & 3: CẬP NHẬT (Sửa profile hoặc Reset mật khẩu)
    edit: async (id, data) => {
        // Chỉ băm nếu trong dữ liệu gửi lên có chứa trường password
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return await Model.update(id, data);
    },

    // TRƯỜNG HỢP 4: ĐỔI MẬT KHẨU (Cần kiểm tra mật khẩu cũ)
    changePassword: async (userId, oldPassword, newPassword) => {
        // 1. Lấy mật khẩu cũ từ DB
        const user = await Model.getById(userId);
        if (!user) throw new Error("Người dùng không tồn tại");

        // 2. So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error("Mật khẩu cũ không chính xác");

        // 3. Băm mật khẩu mới và cập nhật
        const salt = await bcrypt.genSalt(10);
        const hashedHeader = await bcrypt.hash(newPassword, salt);
        
        return await Model.update(userId, { password: hashedHeader });
    },

    remove: async (id) => await Model.delete(id),

    updateAvatar: async (userId, avatarPath) => {
    return await Model.update(userId, { avatar: avatarPath }); },

    // THÊM HÀM NÀY ĐỂ PHỤC VỤ ĐĂNG NHẬP
    findByEmail: async (email) => {
        const sql = `
            SELECT u.*, r.name as roleName 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE u.email = ? AND u.deleted_at IS NULL`;
        const rows = await db.query(sql, [email]);
        return rows[0]; // Trả về user đầu tiên tìm thấy
    }
};

module.exports = UsersService;