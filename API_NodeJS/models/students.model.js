const db = require('../common/db');

const Model = {
  getAll: async () => {
    const sql = `
      SELECT u.user_id, u.role_id, u.full_name, u.email, u.phone,
      u.avatar, u.gender, u.date_of_birth, u.address, u.violation_count, 
      u.status, s.student_id, s.grade 
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE u.deleted_at IS NULL
    `;
    return await db.query(sql);
  },

  getById: async (id) => {
    const sql = `
      SELECT u.user_id, u.role_id, u.full_name, u.email, u.phone,
      u.avatar, u.gender, u.date_of_birth, u.address, u.violation_count, 
      u.status, s.student_id, s.grade  
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.student_id = ? AND u.deleted_at IS NULL
    `;
    const rows = await db.query(sql, [id]);
    return rows[0];
  },

  // Hàm cập nhật dùng chung cho các bảng, viết SQL rõ ràng
  updateTable: async (tableName, pkName, pkValue, data, connection) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), pkValue];
    const sql = `UPDATE ${tableName} SET ${fields} WHERE ${pkName} = ?`;
    
    // Nếu có connection (dùng trong transaction) thì dùng nó, không thì dùng db query thường
    const executor = connection || db;
    return await executor.query(sql, values);
  }
};

module.exports = Model;