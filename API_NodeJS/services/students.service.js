const Model = require('../models/students.model');
const db = require('../common/db');

const Service = {
  findAll: async () => await Model.getAll(),
  findOne: async (id) => await Model.getById(id),

  editProfile: async (studentId, combinedData) => {
    const current = await Model.getById(studentId);
    if (!current) throw new Error("Học viên không tồn tại");

    const userId = current.user_id;
    const connection = await db.getConnection(); // Bắt đầu kết nối để làm Transaction

    try {
      await connection.beginTransaction();

      // 1. Lọc dữ liệu cho bảng USERS (khớp với Schema của bạn)
      const userData = {};
      if (combinedData.full_name) userData.full_name = combinedData.full_name;
      if (combinedData.email)     userData.email = combinedData.email;
      if (combinedData.phone)     userData.phone = combinedData.phone;
      if (combinedData.address)   userData.address = combinedData.address;
      if (combinedData.avatar)    userData.avatar = combinedData.avatar;
      if (combinedData.status)    userData.status = combinedData.status;

      if (Object.keys(userData).length > 0) {
        await Model.updateTable('users', 'user_id', userId, userData, connection);
      }

      // 2. Lọc dữ liệu cho bảng STUDENTS
      const studentData = {};
      if (combinedData.grade) studentData.grade = combinedData.grade;

      if (Object.keys(studentData).length > 0) {
        await Model.updateTable('students', 'student_id', studentId, studentData, connection);
      }

      await connection.commit(); // Thành công hết thì lưu lại
      return { message: "Cập nhật thành công thông tin học viên" };

    } catch (error) {
      await connection.rollback(); // Một trong 2 bảng lỗi thì hủy hết
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Service;