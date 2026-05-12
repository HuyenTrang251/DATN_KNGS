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
 * Hủy yêu cầu mời dạy khi gia sư chưa nhận lớp
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
 * Sau khi cổng thanh toán xác nhận thành công, trạng thái sẽ là 'connecting'
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
 * Admin: Cập nhật trạng thái đặt lịch khi cần can thiệp thủ công
 */
export const adminUpdateBookingStatus = (id, data) => axiosClient.put(`/bookings/update-status/${id}`, data);

/**
 * Admin: Cập nhật trạng thái thanh toán cho booking (ví dụ xác nhận hoàn tiền)
 */
export const adminUpdatePaymentStatus = (paymentId, data) => axiosClient.put(`/payments/${paymentId}`, data);

/**
 * Admin: Hoàn tiền thật qua cổng hỗ trợ payout
 */
export const adminRefundPayment = (paymentId, data) => axiosClient.post(`/payments/${paymentId}/refund`, data);

/**
 * Admin: Xóa bỏ một lịch hẹn không hợp lệ
 */
export const adminDeleteBooking = (id) => axiosClient.delete(`/bookings/${id}`);

