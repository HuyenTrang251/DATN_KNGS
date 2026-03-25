const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM users WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  // create: async (data) => {
  //   return await db.query('INSERT INTO users SET ?', data);
  // },

  create: async (data) => {
    // data lúc này là: { role_id, full_name, email, phone, password }
    // SQL sẽ tự hiểu là: INSERT INTO users (role_id, full_name, email, phone, password) VALUES (...)
    const sql = 'INSERT INTO users SET ?';
    return await db.query(sql, data);
  },

  updateAvatar: async (id, fileName) => {
      const sql = 'UPDATE users SET avatar = ? WHERE user_id = ?';
      return await db.query(sql, [fileName, id]);
  },

  // Hàm 2: Chuyên cập nhật thông tin cá nhân (Hàm này linh hoạt hơn)
  updateInfo: async (id, data) => {
      // data là 1 object: { full_name: '...', phone: '...', gender: '...' }
      // Chúng ta tạo câu SQL động để chỉ cập nhật những gì người dùng gửi lên
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      values.push(id); // Thêm ID vào cuối mảng cho WHERE user_id = ?

      const sql = `UPDATE users SET ${fields} WHERE user_id = ?`;
      return await db.query(sql, values);
  },
  update: async (id, data) => {
    // Tự động tạo câu lệnh: UPDATE users SET status = ?, full_name = ? ... WHERE user_id = ?
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const sql = `UPDATE users SET ${fields} WHERE user_id = ?`;
    return await db.query(sql, values);
  },
  delete: async (id) => {
    return await db.query('UPDATE users SET deleted_at = NOW() WHERE user_id = ?', [id]);
  }
};

module.exports = Model;