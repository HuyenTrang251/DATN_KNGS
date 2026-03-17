const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM bookings WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM bookings WHERE booking_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO bookings SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE bookings SET ? WHERE booking_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE bookings SET deleted_at = NOW() WHERE booking_id = ?', [id]);
  }
};

module.exports = Model;