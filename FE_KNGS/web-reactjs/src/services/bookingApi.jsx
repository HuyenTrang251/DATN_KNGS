import axiosClient from "../api/axiosClient"; 

// --- NHÓM API DÀNH CHO HỌC VIÊN (STUDENT - role_id = 3) ---

/**
 * Mời gia sư dạy (Tạo booking mới)
 * @param {Object} data - Thông tin bảng bookings (tutor_id, hours_per_session, sessions_per_week,...)
 */
export const createBooking = (data) => {
  return axiosClient.post("/bookings/invite", data);
};

/**
 * Cập nhật thông tin mời dạy (Chỉ khi trạng thái là pending)
 * @param {number} id - booking_id
 * @param {Object} data - Dữ liệu cần sửa
 */
export const updateBooking = (id, data) => {
  return axiosClient.put(`/bookings/update/${id}`, data);
};

/**
 * Xóa yêu cầu mời dạy (Chỉ khi trạng thái là pending)
 * @param {number} id - booking_id
 */
export const deleteBooking = (id) => {
  return axiosClient.delete(`/bookings/${id}`);
};

/**
 * Hủy yêu cầu mời dạy (Khi admin đã duyệt nhưng gia sư chưa phản hồi)
 * @param {number} id - booking_id
 */
export const cancelBooking = (id) => {
  return axiosClient.put(`/bookings/cancel/${id}`);
};

/**
 * Lấy danh sách các yêu cầu mời dạy của học viên đang đăng nhập
 */
export const getMyBookings = () => {
  return axiosClient.get("/bookings/my-bookings");
};


// --- NHÓM API DÀNH CHO GIA SƯ (TUTOR - role_id = 2) ---

/**
 * Lấy danh sách các lời mời dạy gửi đến cho gia sư đang đăng nhập
 */
export const getReceivedInvitations = () => {
  return axiosClient.get("/bookings/invitations");
};

/**
 * Gia sư phản hồi lời mời dạy (Đồng ý hoặc Từ chối)
 * @param {number} id - booking_id
 * @param {Object} data - { status: 'success' | 'rejected' }
 */
export const respondToInvitation = (id, data) => {
  return axiosClient.put(`/bookings/respond/${id}`, data);
};