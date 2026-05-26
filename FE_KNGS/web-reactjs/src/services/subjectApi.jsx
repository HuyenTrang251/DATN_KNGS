import axiosClient from "../api/axiosClient";

// Hàm lấy danh sách môn học
export const getAllSubjects = () => {
    return axiosClient.get("/subjects");
};


