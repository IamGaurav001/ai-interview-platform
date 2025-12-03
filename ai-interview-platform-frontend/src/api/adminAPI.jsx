import axiosInstance from "./axiosInstance";

export const getDashboardStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await axiosInstance.get("/admin/activity");
  return response.data;
};
