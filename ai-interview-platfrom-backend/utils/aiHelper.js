import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5rav-flash" });

export async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI response.";
  }
}

// utils/aiHelper.js
export const parseFeedbackSafely = (feedbackText = "") => {
  try {
    // remove markdown fences like ```json or ```JSON
    let cleaned = feedbackText
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    // if there is still surrounding text, extract the first JSON object
    const match = cleaned.match(/{[\s\S]*}/);
    if (match) cleaned = match[0];

    const parsed = JSON.parse(cleaned);

    // ensure numeric fields are numbers, not strings
    ["correctness", "clarity", "confidence"].forEach((k) => {
      if (parsed[k] !== undefined) parsed[k] = Number(parsed[k]);
    });

    return parsed;
  } catch (err) {
    console.warn("⚠️ Could not parse Gemini feedback as JSON:", err.message);
    return { raw: feedbackText };
  }
};

// optional helper for computing a safe average
export const calculateSafeScore = (feedback) => {
  const values = [
    Number(feedback.correctness),
    Number(feedback.clarity),
    Number(feedback.confidence),
  ].filter((n) => !isNaN(n));
  if (!values.length) return 0;
  const total = values.reduce((a, b) => a + b, 0);
  return Number((total / values.length).toFixed(2));
};
