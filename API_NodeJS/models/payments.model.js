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

  // Tìm payment theo mã đơn hàng PayOS (orderCode)
  findByTransactionCode: async (code) => {
    const sql = `SELECT * FROM payments WHERE transaction_code = ? AND deleted_at IS NULL`;
    const rows = await db.query(sql, [code]);
    return rows[0];
  },

  findReusablePending: async ({ tutor_id, post_id, booking_id, payment_type }) => {
    const sql = `
      SELECT *
      FROM payments
      WHERE tutor_id = ?
        AND payment_type = ?
        AND status = 'pending'
        AND deleted_at IS NULL
        AND (
          (post_id = ? AND ? IS NOT NULL)
          OR (booking_id = ? AND ? IS NOT NULL)
          OR (post_id IS NULL AND booking_id IS NULL AND ? IS NULL AND ? IS NULL)
        )
      ORDER BY id DESC
      LIMIT 1
    `;
    const rows = await db.query(sql, [
      tutor_id,
      payment_type,
      post_id || null,
      post_id || null,
      booking_id || null,
      booking_id || null,
      post_id || null,
      booking_id || null,
    ]);
    return rows[0];
  },

  // Cập nhật trạng thái thành công
  updateToSuccess: async (id) => {
    const sql = `UPDATE payments SET status = 'success', updated_at = NOW() WHERE id = ?`;
    return await db.query(sql, [id]);
  },

  getLatestSuccessByBooking: async (bookingId) => {
    const sql = `
      SELECT *
      FROM payments
      WHERE booking_id = ?
        AND payment_type = 'receive_booking'
        AND status = 'success'
        AND deleted_at IS NULL
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `;
    const rows = await db.query(sql, [bookingId]);
    return rows[0];
  },

  getLatestSuccessByPost: async (postId, tutorId) => {
    const sql = `
      SELECT *
      FROM payments
      WHERE post_id = ?
        AND tutor_id = ?
        AND payment_type = 'receive_job'
        AND status = 'success'
        AND deleted_at IS NULL
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `;
    const rows = await db.query(sql, [postId, tutorId]);
    return rows[0];
  },

  getAll: async () => {
    return await db.query('SELECT * FROM payments WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM payments WHERE id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  updatePendingTransaction: async (id, transactionCode, amount) => {
    const sql = `
      UPDATE payments
      SET transaction_code = ?,
          amount = ?,
          updated_at = NOW()
      WHERE id = ? AND status = 'pending' AND deleted_at IS NULL
    `;
    return await db.query(sql, [transactionCode, amount, id]);
  },

  // Hàm cập nhật trạng thái duyệt tiền
  updateStatus: async (id, status, adminId) => {
    // console.log("--- [DEBUG MODEL] ---");
    // console.log("Giá trị nhận được:", { id, status, adminId });
    const sql = `
      UPDATE payments 
      SET status = ?, 
          approved_by = ?, 
          approved_at = NOW() 
      WHERE id = ?
    `;
    const params = [status, adminId, id];

    // console.log("SQL Query:", sql.replace(/\s+/g, ' '));
    // console.log("Params gửi xuống DB:", params);

    // Kiểm tra xem có biến nào bị undefined không
    params.forEach((p, index) => {
        if (p === undefined) {
            console.error(`❌ LỖI: Tham số vị trí ${index} bị UNDEFINED!`);
        }
    });
    return await db.query(sql, params);
  },

  delete: async (id) => {
    return await db.query('UPDATE payments SET deleted_at = NOW() WHERE id = ?', [id]);
  }
};

module.exports = Model;
