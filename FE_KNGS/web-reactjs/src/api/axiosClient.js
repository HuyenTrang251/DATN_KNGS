import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: "http://localhost:3300/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// 1. Tự động gửi token (Request Interceptor)
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Tự động bóc tách dữ liệu (Response Interceptor) - THÊM MỚI TẠI ĐÂY
axiosClient.interceptors.response.use(
  (response) => {
    // Chỉ trả về data, bỏ qua vỏ bọc của Axios (status, config, headers...)
    return response.data; 
  },
  (error) => {
    // Xử lý lỗi tập trung (ví dụ: 401 logout, 500 thông báo lỗi)
    return Promise.reject(error);
  }
);

export default axiosClient;