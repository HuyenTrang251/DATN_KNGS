import axiosClient from "../api/axiosClient";

export const getSubjectLevelsByTutor = (tutorId) => {
  return axiosClient.get(`/tutor-subject-level/tutor/${tutorId}`);
};