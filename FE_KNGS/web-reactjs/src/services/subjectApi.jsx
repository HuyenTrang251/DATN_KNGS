import axiosClient from "../api/axiosClient";

// Hàm lấy danh sách môn học
export const getAllSubjects = async () => {
    const res = await axiosClient.get("/subjects");
    return res.data;
};