import axios from "./axiosInstance";

export const generateQuestion = (domain) => axios.post("/interview/generate", { domain });
export const evaluateAnswer = (domain, question, answer) =>
  axios.post("/interview/evaluate", { domain, question, answer });
export const saveCompleteSession = (data) => axios.post("/interview/save-session", data);
export const getHistory = () => axios.get("/interview/history");
export const getWeakAreas = () => axios.get("/interview/weak-areas");

// ✅ New Redis-based interview flow
export const startInterview = () => axios.post("/interview/start");
export const nextInterviewStep = (answer) => axios.post("/interview/next", { answer });
export const endInterview = () => axios.post("/interview/end");
export const getActiveSession = () => axios.get("/interview/active-session");
