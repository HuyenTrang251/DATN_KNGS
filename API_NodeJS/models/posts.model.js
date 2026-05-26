const db = require('../common/db');

const Model = {
  getAllAdmin: async () => {
    return await db.query(`
      SELECT 
        p.*, 
        st.student_id,
        s.name AS subject_name, 
        u.full_name, 
        u.avatar,
        o.fee_receive, 
        o.support,
        (SELECT COUNT(*) 
         FROM post_applications pa 
         WHERE pa.post_id = p.post_id 
         AND pa.deleted_at IS NULL) AS total_applications,
        (SELECT COUNT(*) 
         FROM payments pay 
         WHERE pay.post_id = p.post_id 
         AND pay.status = 'pending' 
         AND pay.payment_type = 'receive_job') AS pending_payments
      FROM posts p
      LEFT JOIN subjects s ON p.subject_id = s.subject_id
      LEFT JOIN students st ON p.student_id = st.student_id
      LEFT JOIN users u ON st.user_id = u.user_id
      LEFT JOIN offer o ON p.post_id = o.offer_id
      WHERE p.deleted_at IS NULL
      ORDER BY pending_payments DESC, p.created_at DESC;
    `);
  },
  
  update: async (id, data) => {
    const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const sql = `UPDATE posts SET ${fields} WHERE post_id = ?`;
    return await db.query(sql, values);
  },

  saveOffer: async (postId, fee, support) => {
    const sql = `
      INSERT INTO offer (offer_id, fee_receive, support) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE fee_receive = VALUES(fee_receive), support = VALUES(support)`;
    return await db.query(sql, [postId, fee, support]);
  },

  getApproved: async () => {
    return await db.query(`
      SELECT 
        p.*,
        u.full_name,
        u.avatar,
        sub.name AS subject_name,
        o.fee_receive, 
        o.support
      FROM posts p
      JOIN students s ON p.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN subjects sub ON p.subject_id = sub.subject_id
      LEFT JOIN offer o ON p.post_id = o.offer_id
      WHERE p.status = 'approved'
        AND p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM post_applications pa
          WHERE pa.post_id = p.post_id
            AND pa.status = 'agreed'
            AND pa.deleted_at IS NULL
        )
    `);
  },

  getByStudent: async (userId) => {
    const rows = await db.query(`
      SELECT 
        p.*,
        s.name AS subject_name,
        o.fee_receive, 
        o.support,
        (SELECT COUNT(*) FROM post_applications pa WHERE pa.post_id = p.post_id AND pa.deleted_at IS NULL) AS total_applications
      FROM posts p
      JOIN subjects s ON p.subject_id = s.subject_id
      JOIN students st ON p.student_id = st.student_id
      LEFT JOIN offer o ON p.post_id = o.offer_id
      WHERE st.user_id = ? AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `, [userId]);
    
    return rows;
  },

  getContactDetail: async (postId) => {
    return await db.query(`
      SELECT u.phone, u.address, u.full_name 
      FROM posts p
      JOIN students s ON p.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE p.post_id = ?`, [postId]);
  },

  getTutorApplications: async (userId) => {
    const sql = `
      SELECT 
        pa.post_application_id,
        p.*, sub.name AS subject_name, o.fee_receive, o.support,
        pa.status AS apply_status, pa.tutor_id,
        u.phone, u.address, u.full_name,
        pay.status AS payment_status, pay.transaction_code
      FROM post_applications pa
      JOIN tutors t ON pa.tutor_id = t.tutor_id
      JOIN posts p ON p.post_id = pa.post_id
      JOIN subjects sub ON p.subject_id = sub.subject_id
      JOIN students s ON p.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN offer o ON p.post_id = o.offer_id
      LEFT JOIN payments pay ON pay.id = (
        SELECT p2.id
        FROM payments p2
        WHERE p2.post_id = p.post_id
          AND p2.tutor_id = t.tutor_id
          AND p2.deleted_at IS NULL
        ORDER BY p2.id DESC
        LIMIT 1
      )
      WHERE t.user_id = ? AND pa.deleted_at IS NULL
    `;
    return await db.query(sql, [userId]);
  },

  getById: async (id) => {
    const rows = await db.query(`
      SELECT p.*, o.fee_receive, o.support 
      FROM posts p LEFT JOIN offer o ON p.post_id = o.offer_id
      WHERE post_id = ?
      AND deleted_at IS NULL
    `, [id]);
    return rows[0];
  },

  getStudentIdByUserId: async (userId) => {
    const sql = "SELECT student_id FROM students WHERE user_id = ? AND deleted_at IS NULL";
    const [rows] = await db.query(sql, [userId]);
    console.log("Dữ liệu từ DB trả về cho User ID " + userId + ":", rows);
    return rows;
  },

  create: async (data) => {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const sql = `INSERT INTO posts (${fields}) VALUES (${placeholders})`;
    return await db.query(sql, values);
  },

  delete: async (id) => {
    return await db.query(
      'UPDATE posts SET deleted_at = NOW() WHERE post_id = ?',
      [id]
    );
  }

};

module.exports = Model;
