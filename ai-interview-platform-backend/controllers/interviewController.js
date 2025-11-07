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
        .json({ success: false, error: "Domain, question, and answer are required." });

    const cacheKey = `eval:${req.user._id}:${domain}:${Buffer.from(question)
      .toString("base64")
      .slice(0, 40)}:${Buffer.from(answer).toString("base64").slice(0, 40)}`;

    // 1️⃣ Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({ success: true, cached: true, ...parsed });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 2️⃣ Primary strict prompt
    const prompt = `
You are an AI Interview Evaluator.
Return **ONLY JSON**, no introductions, markdown, or text outside of braces.
JSON format:
{
  "correctness": number (0–10),
  "clarity": number (0–10),
  "confidence": number (0–10),
  "overall_feedback": "2–3 concise sentences of constructive feedback"
}

Question: ${question}
Answer: ${answer}
`;

    let feedbackText = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await model.generateContent(prompt);
      feedbackText = result.response.text().trim();

      // 🧩 Detect bad “I am an AI Evaluator…” responses
      const lower = feedbackText.toLowerCase();
      const looksWrong =
        lower.includes("i understand") ||
        lower.includes("you are") ||
        lower.includes("provide me with") ||
        lower.includes("my role") ||
        lower.includes("objectively assess") ||
        !feedbackText.includes("{");

      if (looksWrong && attempt < 3) {
        console.warn(`⚠️ Gemini returned non-evaluation text (retry ${attempt})`);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }

      if (!feedbackText.startsWith("{") && attempt < 3) {
        console.warn(`⚠️ Gemini non-JSON response on attempt ${attempt}, retrying...`);
        continue;
      }

      break;
    }

    // 3️⃣ Parse safely
    let feedback = parseFeedbackSafely(feedbackText);

    // If still failed, last-chance “repair prompt”
    if (feedback.parsingFailed) {
      const repairPrompt = `
Convert the following text into valid JSON with numeric scores.
Use fields: correctness, clarity, confidence, overall_feedback.
Text:
${feedbackText}`;
      try {
        const repair = await model.generateContent(repairPrompt);
        feedback = parseFeedbackSafely(repair.response.text());
      } catch {
        feedback.overall_feedback =
          "Unable to extract structured feedback. Please retry this question.";
      }
    }

    // 4️⃣ Compute score
    const score = calculateSafeScore(feedback);

    // 5️⃣ Save session
    const session = await InterviewSession.create({
      userId: req.user._id,
      domain,
      questions: [question],
      answers: [answer],
      feedback,
      score,
    });

    // 6️⃣ Cache result
    await redisClient.setEx(cacheKey, 600, JSON.stringify({ feedback, score }));

    res.json({ success: true, cached: false, feedback, score, sessionId: session._id });
  } catch (err) {
    console.error("❌ Error in evaluateAnswer:", err.message);
    res.status(500).json({ success: false, error: "Error evaluating answer" });
  }
};

// -------------------------------------
// Get Interview History
// -------------------------------------

export const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    if (!sessions.length)
      return res.json({
        success: true,
        message: "No previous interviews found.",
        total: 0,
        summary: [],
        groupedHistory: {},
      });

    // Group by domain
    const grouped = {};
    sessions.forEach((s) => {
      const domain = s.domain || "Unknown";
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(s);
    });

    // Helper for badge text & color
    const getConfidence = (score) => {
      if (score >= 8) return { label: "🟢 Strong", color: "green" };
      if (score >= 5) return { label: "🟡 Average", color: "yellow" };
      return { label: "🔴 Weak", color: "red" };
    };

    // Prepare response objects
    const groupedHistory = {};
    const summary = [];

    for (const domain of Object.keys(grouped)) {
      const domainSessions = grouped[domain];

      // Compute average
      const validScores = domainSessions
        .map((s) => Number(s.score || 0))
        .filter((n) => !isNaN(n) && n > 0);

      const avgScore = validScores.length
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

      const { label: avgLabel, color: avgColor } = getConfidence(avgScore);

      summary.push({
        domain,
        totalAttempts: domainSessions.length,
        averageScore: avgScore.toFixed(2),
        confidenceLevel: avgLabel,
        confidenceColor: avgColor,
      });

      // Detailed sessions with confidence badges
      groupedHistory[domain] = domainSessions.map((s) => {
        const { label, color } = getConfidence(Number(s.score || 0));
        return {
          id: s._id,
          score: s.score?.toFixed(2) || "0.00",
          confidenceLevel: label,
          confidenceColor: color,
          date: new Date(s.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          questions: s.questions,
          answers: s.answers,
          feedback: s.feedback,
        };
      });
    }

    res.json({
      success: true,
      total: sessions.length,
      summary,
      groupedHistory,
    });
  } catch (error) {
    console.error("Error fetching interview history:", error.message);
    res
      .status(500)
      .json({ success: false, error: "Error fetching interview history" });
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
    res
      .status(500)
      .json({ success: false, error: "Error analyzing performance" });
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
