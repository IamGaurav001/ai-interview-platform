import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // change to your deployed backend URL later
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
