const Model = require('../models/post_applications.model');

const Service = {
  addApplication: async (userId, postId) => {
    const result = await Model.getTutorIdByUserId(userId);

    let tutorId = null;
    if (Array.isArray(result) && result.length > 0) {
      tutorId = result[0].tutor_id;
    } else if (result && result.tutor_id) {
      tutorId = result.tutor_id;
    }

    if (!tutorId) {
      throw new Error("Tài khoản của bạn chưa cập nhật hồ sơ Gia sư.");
    }

    const hasAgreedApplication = await Model.hasAgreedApplication(postId);
    if (hasAgreedApplication) {
      throw new Error("Lớp này đã có gia sư được học viên đồng ý.");
    }

    const existingApplication = await Model.getExistingApplication(postId, tutorId);

    if (existingApplication?.status === 'pending') {
      throw new Error("Bạn đã nhận lớp này rồi, đang chờ học viên phản hồi.");
    }

    if (existingApplication?.status === 'agreed') {
      throw new Error("Bạn đã được học viên đồng ý cho lớp này.");
    }

    if (existingApplication?.status === 'rejected') {
      await Model.resetToPending(existingApplication.post_application_id);
      return { post_application_id: existingApplication.post_application_id, status: 'pending' };
    }

    return await Model.create({ post_id: postId, tutor_id: tutorId, status: 'pending' });
  },
};

module.exports = Service;
