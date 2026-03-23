const db = require('../common/db');

const Model = {

  getAll: async () => {
    return await db.query(`
      SELECT 
        p.*, 
        st.student_id,
        s.name AS subject_name, 
        u.full_name, 
        u.avatar,
        o.fee_receive, 
        o.support
      FROM posts p
      JOIN subjects s ON p.subject_id = s.subject_id
      JOIN students st ON p.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      LEFT JOIN offer o ON p.post_id = o.offer_id  -- Kết nối với bảng offer
      WHERE p.status = 'approved' 
      AND p.deleted_at IS NULL;
    `);
  },

  saveOffer: async (postId, feeReceive, support) => {
    const sql = `REPLACE INTO offer (offer_id, fee_receive, support) VALUES (?, ?, ?)`;
    return await db.query(sql, [postId, feeReceive, support]);
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
      WHERE p.status = 'approved' AND p.deleted_at IS NULL
    `);
  },

  getByStudent: async (userId) => {
    return await db.query(`
      SELECT 
        p.*,
        o.fee_receive, 
        o.support,
        COUNT(pa.application_id) AS total_applications
      FROM posts p
      JOIN post_applications pa ON p.post_id = pa.post_id
      LEFT JOIN offer o ON p.post_id = o.offer_id
      WHERE p.student_id = (
        SELECT student_id FROM students WHERE user_id = ?
      )
      GROUP BY p.post_id
    `, [userId]);
  },

  getTutorApplications: async (userId) => {
    return await db.query(`
      SELECT 
        p.*,
        o.fee_receive, 
        o.support,
        pa.status AS apply_status
      FROM post_applications pa
      JOIN tutors t ON pa.tutor_id = t.tutor_id
      JOIN posts p ON pa.post_id = p.post_id
      LEFT JOIN offer o ON p.post_id = o.offer_id
      WHERE t.user_id = ?
    `, [userId]);
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

  create: async (data) => {
    return await db.query('INSERT INTO posts SET ?', data);
  },

  update: async (id, data) => {
    return await db.query(
      'UPDATE posts SET ? WHERE post_id = ?',
      [data, id]
    );
  },

  delete: async (id) => {
    return await db.query(
      'UPDATE posts SET deleted_at = NOW() WHERE post_id = ?',
      [id]
    );
  }

};

module.exports = Model;