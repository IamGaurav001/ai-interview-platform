import axios from "./axiosInstance";

export const evaluateAnswer = (domain, question, answer) =>
  axios.post("/interview/evaluate", { domain, question, answer });
export const saveCompleteSession = (data) => axios.post("/interview/save-session", data);
export const getHistory = () => axios.get("/interview/history");
export const getWeakAreas = () => axios.get("/interview/weak-areas");


export const startInterview = (data) => axios.post("/interview/start", data);
export const nextInterviewStep = (answer) => axios.post("/interview/next", { answer });
export const endInterview = () => axios.post("/interview/end");
export const cancelInterview = () => axios.post("/interview/cancel");
export const resetInterview = () => axios.post("/interview/reset");
export const getActiveSession = () => axios.get("/interview/active-session");


export const evaluateVoiceAnswer = (formData) =>
  axios.post("/interview/voice-answer", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

