const Model = require('../models/tutors.model');

const Service = {
  // Logic xử lý nghiệp vụ sẽ viết ở đây
  findAll: async () => await Model.getAll(),
  findOne: async (id) => await Model.getById(id),
  add: async (data) => await Model.create(data),
  edit: async (id, data) => await Model.update(id, data),
  remove: async (id) => await Model.delete(id),
  updateMedia: async (userId, mediaData) => {
      // mediaData = { cv_url: '...', intro_video_url: '...' }
      const db = require('../common/db');
      const sql = `UPDATE tutors SET ? WHERE user_id = ?`;
      return await db.query(sql, [mediaData, userId]);
  },
};

module.exports = Service;