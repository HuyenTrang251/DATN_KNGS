const db = require('../common/db');

const Model = {
  create: async (data) => {
    const sql = `
      INSERT INTO payments 
      (tutor_id, post_id, booking_id, payment_type, amount, transaction_code, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Đảm bảo truyền đúng thứ tự và xử lý các trường có thể NULL
    const params = [
      data.tutor_id,
      data.post_id || null,
      data.booking_id || null,
      data.payment_type,
      data.amount,
      data.transaction_code,
      data.status || 'pending'
    ];

    return await db.query(sql, params);
  },

  getAll: async () => {
    return await db.query('SELECT * FROM payments WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM payments WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  update: async (id, data) => {
    return await db.query('UPDATE payments SET ? WHERE id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE payments SET deleted_at = NOW() WHERE id = ?', [id]);
  }
};

module.exports = Model;