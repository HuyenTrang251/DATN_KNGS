import axiosClient from "../api/axiosClient";

export const registerStudent = (data) => {
  return axiosClient.post("/auth/register/student", data);
};

export const registerTutor = (data) => {
  return axiosClient.post("/auth/register/tutor", data);
};

export const login = (data) => {
  return axiosClient.post("/auth/login", data);
};


