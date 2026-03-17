const db = require('../common/db');

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM vouchers WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM vouchers WHERE vouche_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  create: async (data) => {
    return await db.query('INSERT INTO vouchers SET ?', data);
  },

  update: async (id, data) => {
    return await db.query('UPDATE vouchers SET ? WHERE vouche_id = ?', [data, id]);
  },

  delete: async (id) => {
    return await db.query('UPDATE vouchers SET deleted_at = NOW() WHERE vouche_id = ?', [id]);
  }
};

module.exports = Model;