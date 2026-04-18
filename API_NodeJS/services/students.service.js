const Model = require('../models/students.model');
const db = require('../common/db');

const Service = {
  findAll: async () => await Model.getAll(),
  
  findMe: async (userId) => await Model.getByIdUser(userId),

  editProfile: async (userId, combinedData) => {
    // 1. Lấy thông tin hiện tại trong DB
    const current = await Model.getByIdUser(userId);
    if (!current) throw new Error("Học viên không tồn tại");

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 2. Tách dữ liệu cho bảng USERS
      const userData = {};
      if (combinedData.phone) userData.phone = combinedData.phone;
      if (combinedData.address) userData.address = combinedData.address;

      // CHỈ CHO PHÉP CẬP NHẬT GIỚI TÍNH VÀ NGÀY SINH NẾU DỮ LIỆU CŨ ĐANG TRỐNG (NULL)
      if (!current.gender && combinedData.gender) {
          userData.gender = combinedData.gender;
      }
      if (!current.date_of_birth && combinedData.date_of_birth) {
          userData.date_of_birth = combinedData.date_of_birth;
      }

      if (Object.keys(userData).length > 0) {
        await Model.updateTable('users', 'user_id', userId, userData, connection);
      }

      // 3. Tách dữ liệu cho bảng STUDENTS (Vẫn cho phép đổi lớp)
      const studentData = {};
      if (combinedData.grade) studentData.grade = combinedData.grade;

      if (Object.keys(studentData).length > 0) {
        await Model.updateTable('students', 'user_id', userId, studentData, connection);
      }

      await connection.commit();
      return { message: "Cập nhật hồ sơ thành công" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Service;