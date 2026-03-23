const Model = require('../models/tutor_subject_level.model');

const Service = {
  // Logic xử lý nghiệp vụ sẽ viết ở đây
  findAll: async () => await Model.getAll(),
  findOne: async (id) => await Model.getById(id),
  add: async (data) => await Model.create(data),
  edit: async (id, data) => await Model.update(id, data),
  remove: async (id) => await Model.delete(id),
  findByTutorId: async (tutorId) => {
    return await Model.getByTutorId(tutorId);
  }
};

module.exports = Service;