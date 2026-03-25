import axiosClient from "../api/axiosClient"; 

// --- NHÓM API CHO GIA SƯ (TUTOR) ---

/**
 * Cập nhật thông tin profile chi tiết (5 bảng)
 * @param {Object} data - Gồm user_info, tutor_info, locations, subjects, availabilities
 */
export const updateTutorProfile = (data) => {
  return axiosClient.put("/tutors/profile", data);
};

/**
 * Upload CV và Video giới thiệu
 * @param {FormData} formData - Chứa file 'cv' và 'video'
 */
export const uploadTutorMedia = (formData) => {
  return axiosClient.post("/tutors/upload-media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// --- NHÓM API CÔNG KHAI (PUBLIC) ---

/**
 * Lấy danh sách gia sư đã được duyệt để hiển thị lên trang chủ/danh sách
 */
export const getPublicTutors = () => {
  return axiosClient.get("/tutors/approved");
};

// --- NHÓM API CHO QUẢN TRỊ VIÊN (ADMIN) ---

/**
 * Admin: Lấy toàn bộ danh sách gia sư kèm thông tin chi tiết 5 bảng
 */
export const getAllTutorsAdmin = () => {
  return axiosClient.get("/tutors");
};

/**
 * Admin: Duyệt cấp tích xanh cho gia sư
 * @param {number} tutorId 
 */
export const verifyTutorBlueTick = (tutorId) => {
  return axiosClient.put(`/tutors/verify/${tutorId}`);
};

/**
 * Admin: Khóa tài khoản gia sư
 * @param {number} userId 
 */
export const lockTutorAccount = (userId) => {
  return axiosClient.put(`/tutors/lock/${userId}`);
};

/**
 * Admin: Duyệt trạng thái gia sư (approved/rejected/pending)
 * @param {number} tutorId 
 * @param {Object} data - { status: 'approved' | 'rejected' }
 */
export const updateApproveStatus = (tutorId, data) => {
  return axiosClient.put(`/tutors/approve-status/${tutorId}`, data);
};

// Thêm vào tutorApi.jsx
/**
 * Lấy thông tin chi tiết hồ sơ của gia sư đang đăng nhập (để đổ vào form sửa)
 */
export const getOwnTutorProfile = () => {
  return axiosClient.get("/tutors/me"); 
};