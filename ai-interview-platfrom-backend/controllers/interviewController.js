import redisClient from "../config/redis.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import InterviewSession from "../models/InterviewSession.js";
import { parseFeedbackSafely, calculateSafeScore } from "../utils/aiHelper.js";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------------------------
// Generate AI Interview Question
// ------------------------------------
export const generateQuestion = async (req, res) => {
  try {                                       
    const { domain } = req.body;                   
    if (!domain) return res.status(400).json({ error: "Domain is required" });
                                                
    const cacheKey = `question:${domain.toLowerCase()}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("⚡ Redis cache hit for:", domain);
      return res.json({ success: true, question: cached, cached: true });
    }

    console.log("🧠 Cache miss → calling Gemini API");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate one technical interview question from ${domain}. Keep it clear and concise.`;

    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();

    await redisClient.setEx(cacheKey, 3600, question);

    res.json({ success: true, question, cached: false });
  } catch (error) {
    console.error("❌ Error generating question:", error.message);
    res.status(500).json({ error: "Error generating question" });
  }
};
// -------------------------------------
// Evaluate User's Answer
// -------------------------------------
export const evaluateAnswer = async (req, res) => {
  try {
    const { domain, question, answer } = req.body;

    if (!domain || !question || !answer)
      return res
        .status(400)
        .json({ error: "Domain, question, and answer are required." });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 🔹 Stronger prompt to reduce “introductory” replies
    const prompt = `
You are an AI Interview Evaluator.
Your ONLY job is to return a JSON object evaluating the candidate's answer.
DO NOT include explanations, introductions, or code fences.

Return STRICTLY JSON in this exact format:
{
  "correctness": number (0–10),
  "clarity": number (0–10),
  "confidence": number (0–10),
  "overall_feedback": "2–3 concise sentences of constructive feedback"
}

Question: ${question}
Answer: ${answer}
    `;

    let feedbackText;

    // 🔁 Retry logic for Gemini API
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        feedbackText = result.response.text().trim();

        // ✅ Validate early if the model responded incorrectly
        if (!feedbackText.startsWith("{") && !feedbackText.includes("{")) {
          console.warn(`⚠️ Gemini returned non-JSON on attempt ${attempt}:`, feedbackText.slice(0, 60));
          if (attempt === 3) throw new Error("Gemini failed to return JSON");
          continue; // retry
        }

        break;
      } catch (err) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${err.message}`);
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // 🧠 Parse and calculate
    const parsedFeedback = parseFeedbackSafely(feedbackText);
    const score = calculateSafeScore(parsedFeedback);

    // ✅ Fallback if Gemini completely failed
    if (!parsedFeedback.correctness && !parsedFeedback.clarity && !parsedFeedback.confidence) {
      parsedFeedback.overall_feedback =
        "Gemini failed to produce a valid structured evaluation. Please retry this question.";
    }

    const session = await InterviewSession.create({
      userId: req.user._id,
      domain,
      questions: [question],
      answers: [answer],
      feedback: parsedFeedback,
      score,
    });

    res.json({
      success: true,
      feedback: parsedFeedback,
      score,
      sessionId: session._id,
    });
  } catch (error) {
    console.error("❌ Error in evaluateAnswer:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Error evaluating answer", details: error.message });
  }
};


// -------------------------------------
// Get Interview History
// -------------------------------------
export const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, history: sessions });
  } catch (error) {
    console.error("❌ Error fetching history:", error.message);
    res.status(500).json({ success: false, error: "Error fetching history" });
  }
};

// ------------------------------
// 📊 GET Weak Areas
// ------------------------------
export const getWeakAreas = async (req, res) => {
  try {
    const analysis = await InterviewSession.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$domain",
          avgScore: { $avg: "$score" },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { avgScore: 1 } },
    ]);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Error in getWeakAreas:", error.message);
    res.status(500).json({ success: false, error: "Error analyzing performance" });
  }
};

// ------------------------------
// 🎯 GET 1-Month Personalized Prep Guide
// ------------------------------
export const getPrepGuide = async (req, res) => {
  try {
    const cacheKey = `prepguide:${req.user._id}`;
    const cached = await redisClient.get(cacheKey);

    // ✅ Step 1: Return from cache if exists
    if (cached) {
      console.log("⚡ Redis cache hit: prep-guide");
      return res.json({ success: true, cached: true, ...JSON.parse(cached) });
    }

    // ✅ Step 2: Analyze performance
    const analysis = await InterviewSession.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$domain",
          avgScore: { $avg: "$score" },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { avgScore: 1 } },
    ]);

    if (!analysis.length) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough data to create a prep guide. Complete at least one interview session.",
      });
    }

    const weakDomains = analysis.slice(0, 3).map((d) => d._id);

    // ✅ Step 3: Create prompt
    const prompt = `
You are an expert technical mentor.
Create a **1-Month Personalized Preparation Plan** for improving in these domains:
${weakDomains.join(", ")}.

Guidelines:
- Duration: 4 weeks
- Each week should focus on a specific skill goal for those domains.
- Mention key topics, resources, and daily focus tasks.
- Output JSON only in this structure:
{
  "week1": { "focus": "...", "topics": ["..."], "resources": ["..."] },
  "week2": { "focus": "...", "topics": ["..."], "resources": ["..."] },
  "week3": { "focus": "...", "topics": ["..."], "resources": ["..."] },
  "week4": { "focus": "...", "topics": ["..."], "resources": ["..."] }
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    let prepGuide;
    try {
      prepGuide = JSON.parse(aiResponse);
    } catch {
      prepGuide = { raw: aiResponse, note: "Could not parse structured JSON" };
    }

    const finalResponse = { weakDomains, prepGuide };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(finalResponse));

    res.json({ success: true, cached: false, ...finalResponse });
  } catch (error) {
    console.error("Error in getPrepGuide:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate personalized prep guide",
      details: error.message,
    });
  }
};