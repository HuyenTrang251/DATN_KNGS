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

// 2. T? d?ng b�c t�ch d? li?u (Response Interceptor) - TH�M M?I T?I ��Y
axiosClient.interceptors.response.use(
  (response) => {
    // Chỉ trả về data, bỏ qua vỏ bọc của Axios (status, config, headers...)
    return response.data; 
  },
  (error) => {
    // X? l� l?i t?p trung (v� d?: 401 logout, 500 th�ng b�o l?i)
    return Promise.reject(error);
  }
);

export default axiosClient;






