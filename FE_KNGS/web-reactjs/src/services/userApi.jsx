import axiosClient from "../api/axiosClient";

export const getMe = () => {
  return axiosClient.get("/auth/me");
};

export const changePassword = (data) => {
  return axiosClient.put("/users/change-password", data);
};

export const updateUserStatus = (id, status) => {
  return axiosClient.put(`/users/status/${id}`, { status });
};

export const getAdminCounts = () => axiosClient.get("/users/admin/pending-counts");

export const getAdminDashboardSummary = (params = {}) => axiosClient.get("/users/admin/dashboard-summary", { params });


