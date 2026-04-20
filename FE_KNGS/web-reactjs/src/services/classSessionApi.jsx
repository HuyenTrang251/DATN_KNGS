import axiosClient from "../api/axiosClient";

export const getMyClasses = () => axiosClient.get("/classSessions/my-classes");

export const adminGetAllClassSessions = () => axiosClient.get("/classSessions/admin");

export const updateClassStatus = (id, data) => axiosClient.put(`/classSessions/${id}`, data);

export const confirmCompletion = (id) => axiosClient.post(`/classSessions/${id}/confirm-complete`);

// Review API
export const createReview = (data) => axiosClient.post("/reviews", data);
export const updateReview = (id, data) => axiosClient.put(`/reviews/${id}`, data);
export const deleteReview = (id) => axiosClient.delete(`/reviews/${id}`);