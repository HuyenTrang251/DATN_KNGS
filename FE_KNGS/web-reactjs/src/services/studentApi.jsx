import axiosClient from "../api/axiosClient";

// Lấy danh sách học viên (Dành cho Admin)
export const getAllStudents = () => {
    return axiosClient.get("/students");
};

// Lấy chi tiết học viên theo ID
export const getStudentById = (id) => {
    return axiosClient.get(`/students/${id}`);
};

// Cập nhật thông tin học viên (2 bảng)
export const updateStudentProfile = (id, data) => {
    return axiosClient.put(`/students/${id}`, data);
};


