import axios from "./axiosInstance";

export const generateQuestion = (domain) => axios.post("/interview/generate", { domain });
export const evaluateAnswer = (domain, question, answer) =>
  axios.post("/interview/evaluate", { domain, question, answer });
export const getHistory = () => axios.get("/interview/history");
export const getWeakAreas = () => axios.get("/interview/weak-areas");
export const getPrepGuide = () => axios.get("/interview/prep-guide");
