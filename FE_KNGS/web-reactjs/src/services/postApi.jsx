import axiosClient from "../api/axiosClient";

// --- NHÓM API BÀI ĐĂNG (POSTS) ---
export const getAllPostsAdmin = () => axiosClient.get("/posts");
export const getApprovedPosts = () => axiosClient.get("/posts/approved");
export const getPostById = (id) => axiosClient.get(`/posts/${id}`);
export const createPost = (data) => axiosClient.post("/posts", data);
export const updatePost = (id, data) => axiosClient.put(`/posts/${id}`, data);
export const deletePost = (id) => axiosClient.delete(`/posts/${id}`);
export const getStudentPosts = () => axiosClient.get("/posts/my-posts");

// --- NHÓM API DUYỆT & PHÍ (ADMIN) ---
export const approvePostWithFee = (postId, data) => 
    axiosClient.put(`/posts/${postId}/status`, data);

// --- NHÓM API ỨNG TUYỂN (APPLICATIONS) ---
export const applyPost = (data) => axiosClient.post("/postApplications", data);

// Lấy danh sách gia sư ứng tuyển vào bài (Dùng cho học viên)
export const getApplicationsByPostId = (postId) => 
    axiosClient.get(`/postApplications/${postId}`);

// Phản hồi gia sư (Đồng ý/Từ chối)
export const updateApplicationStatus = (appId, data) => 
    axiosClient.put(`/postApplications/${appId}/status`, data);

// Danh sách lớp đã ứng tuyển (Dùng cho gia sư)
export const getTutorApplications = () => axiosClient.get("/posts/my-applications");

// --- NHÓM API THANH TOÁN (PAYMENTS) ---
export const createPaymentLink = (data) => axiosClient.post("/payments/create-link", data);
export const payOS = (data) => createPaymentLink({ ...data, provider: "payos" });
export const createMomoPayment = (data) => createPaymentLink({ ...data, provider: "momo" });
export const createZaloPayPayment = (data) => createPaymentLink({ ...data, provider: "zalopay" });
export const confirmPayOSReturn = (orderCode) => axiosClient.get(`/payments/payos-return?orderCode=${orderCode}`);
export const confirmMomoReturn = (orderId) => axiosClient.get(`/payments/momo-return?orderId=${encodeURIComponent(orderId)}`);
export const confirmZaloPayReturn = (appTransId) => axiosClient.get(`/payments/zalopay-return?appTransId=${encodeURIComponent(appTransId)}`);
export const getAllPayments = () => axiosClient.get("/payments");
export const approvePayment = (id, data) => axiosClient.put(`/payments/${id}`, data);
export const updatePaymentStatus = (id, data) => axiosClient.put(`/payments/${id}`, data);
export const refundPayment = (id, data) => axiosClient.post(`/payments/${id}/refund`, data);

// --- NHÓM API LỚP HỌC (CLASS SESSIONS) ---
export const finalizePost = (id, data) => axiosClient.post(`/posts/finalize/${id}`, data);

// --- NHÓM USER & SUBJECT ---
export const getMe = () => axiosClient.get("/auth/me");
export const getAllSubjects = () => axiosClient.get("/subjects");



