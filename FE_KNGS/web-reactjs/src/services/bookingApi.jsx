import axiosClient from "../api/axiosClient";

// --- NHÓM API DÀNH CHO HỌC VIÊN (STUDENT - role_id = 3) ---

/**
 * Mời gia sư dạy (Tạo booking mới)
 */
export const createBooking = (data) => axiosClient.post("/bookings/invite", data);

/**
 * Lấy danh sách các yêu cầu mời dạy của học viên đang đăng nhập
 */
export const getMyBookings = () => axiosClient.get("/bookings/my-bookings");

/**
 * Xóa yêu cầu mời dạy (Chỉ khi trạng thái là pending)
 */
export const deleteBooking = (id) => axiosClient.delete(`/bookings/${id}`);

/**
 * Hủy yêu cầu mời dạy (Khi admin đã duyệt nhưng gia sư chưa phản hồi)
 */
export const cancelBooking = (id) => axiosClient.put(`/bookings/cancel/${id}`);

// --- NHÓM API DÀNH CHO GIA SƯ (TUTOR - role_id = 2) ---


/**
 * Lấy danh sách các lời mời dạy gửi đến cho gia sư đang đăng nhập
 */
export const getReceivedInvitations = () => axiosClient.get("/bookings/invitations");

/**
 * Gia sư phản hồi lời mời dạy (Đồng ý nộp phí hoặc Từ chối)
 * data: { status: 'connecting' | 'rejected' }
 */
export const respondToInvitation = (id, data) => axiosClient.put(`/bookings/respond/${id}`, data);

/**
 * Gia sư xác nhận đã liên hệ thành công (Chốt lớp)
 * Sau khi Admin duyệt tiền, trạng thái sẽ là 'connecting', gia sư gọi điện xong thì bấm nút này
 */
export const confirmConnectionSuccess = (id, data) => {
  return axiosClient.post(`/bookings/confirm-connection/${id}`, data);
};

// --- NHÓM API DÀNH CHO QUẢN TRỊ VIÊN (ADMIN - role_id = 1) ---

/**
 * Admin: Lấy toàn bộ danh sách đặt lịch trên hệ thống
 */
export const adminGetBookings = () => axiosClient.get("/bookings");

/**
 * Admin: Xem chi tiết 1 bản ghi đặt lịch (kèm SĐT, Email, Địa chỉ đầy đủ 2 bên)
 */
export const adminGetBookingDetail = (id) => axiosClient.get(`/bookings/detail/${id}`);

/**
 * Admin: Duyệt/Từ chối yêu cầu đặt lịch ban đầu (pending -> approved/rejected)
 */
export const adminUpdateBookingStatus = (id, data) => axiosClient.put(`/bookings/update-status/${id}`, data);

/**
 * Admin: Xóa bỏ một lịch hẹn không hợp lệ
 */
export const adminDeleteBooking = (id) => axiosClient.delete(`/bookings/${id}`);

/**
 * Admin: Duyệt thanh toán phí kết nối cho Booking
 * (Hàm này gọi sang group payments nhưng phục vụ luồng booking)
 */
export const adminApprovePayment = (paymentId, data) => axiosClient.put(`/payments/${paymentId}`, data);