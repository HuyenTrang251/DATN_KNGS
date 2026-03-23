import axiosClient from "../api/axiosClient";

// Hàm lấy danh sách lớp đã duyệt
export const getApprovedPosts = async () => {
    const res = await axiosClient.get("/posts/approved");
    return res.data;
};

// Hàm lấy danh sách môn học
export const getAllSubjects = async () => {
    const res = await axiosClient.get("/subjects");
    return res.data;
};

// Hàm lấy thông tin user hiện tại
export const getMe = async (token) => {
    const res = await axiosClient.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Hàm gửi đề nghị dạy
export const applyPost = async (data, token) => {
    const res = await axiosClient.post("/post-applications", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};