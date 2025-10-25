import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateQuestion = async (req, res) => {
  try {
    const { domain } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate one technical interview question from ${domain}. Keep it clear and concise.`;

    const result = await model.generateContent(prompt);
    const question = result.response.text();

    res.json({ question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating question" });
  }
};

export const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
    You are an AI Interview Evaluator. 
    Evaluate the following answer to the given question.
    Respond in JSON format with these fields:
    - correctness (0-10)
    - clarity (0-10)
    - confidence (0-10)
    - overall_feedback (a few sentences of feedback)
    
    Question: ${question}
    Answer: ${answer}
    `;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    res.json({ feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error evaluating answer" });
  }
};