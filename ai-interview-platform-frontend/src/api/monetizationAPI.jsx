import axiosInstance from "./axiosInstance";

export const getTransactionHistory = async () => {
  const response = await axiosInstance.get("/monetization/history");
  return response.data;
};
