import axios from "./axiosInstance";

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  
  console.log("Creating FormData with file:", file.name, file.type, file.size);
  
  // Don't set Content-Type header - let axios set it automatically with boundary
  // This is important for multipart/form-data uploads
  return axios.post("/resume/upload", formData, {
    timeout: 120000, // 120 seconds timeout for file upload (AI processing can take time)
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
};
