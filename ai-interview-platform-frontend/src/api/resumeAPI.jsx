import axios from "./axiosInstance";

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return axios.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
