import axiosClient from "../api/axiosClient";

export const getMe = () => {
  return axiosClient.get("/auth/me");
};

export const changePassword = (data) => {
  return axiosClient.put("/users/change-password", data);
};