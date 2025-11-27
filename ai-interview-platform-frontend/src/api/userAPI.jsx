import axiosInstance from "./axiosInstance";

export const getUserProfile = async () => {
  return await axiosInstance.get("/user/profile");
};

export const updateUserProfile = async (data) => {
  return await axiosInstance.put("/user/profile", data);
};
