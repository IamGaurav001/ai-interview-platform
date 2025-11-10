import redisClient from "../config/redis.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import InterviewSession from "../models/InterviewSession.js";
import { parseFeedbackSafely, calculateSafeScore } from "../utils/aiHelper.js";
import { callGeminiWithRetry } from "../utils/geminiHelper.js";

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

    // 2️⃣ Primary strict prompt with strict evaluation criteria
    const prompt = `
You are a strict AI Interview Evaluator. You must be critical and thorough in your assessment.

**CRITICAL EVALUATION RULES:**
1. If the answer simply repeats or restates the question without providing actual content, correctness MUST be 0-2/10
2. If the answer is too short (less than 50 words) or lacks detail, deduct points accordingly
3. If the answer doesn't address the specific question asked, correctness should be low (0-4/10)
4. Only give high scores (8-10) for answers that are detailed, specific, technically accurate, and directly address the question
5. Clarity should be low (0-3) if the answer is vague, unclear, or doesn't make sense
6. Confidence should reflect how well the candidate demonstrates knowledge - low if they're guessing or avoiding the question

Return **ONLY JSON**, no introductions, markdown, or text outside of braces.
JSON format:
{
  "correctness": number (0–10) - How accurately and completely the answer addresses the question. Be strict!
  "clarity": number (0–10) - How clear and well-articulated the answer is
  "confidence": number (0–10) - How confidently the candidate demonstrates knowledge
  "overall_feedback": "2–3 concise sentences of constructive feedback. Be specific about what's missing or wrong."
}

Question: ${question}
Answer: ${answer}

Evaluate strictly. If the answer just repeats the question or provides no real content, correctness should be 0-2/10.
`;

    let feedbackText = "";
    try {
      // Use retry helper with exponential backoff
      feedbackText = await callGeminiWithRetry(prompt, {
        model: "gemini-2.0-flash",
        maxRetries: 5,
        initialDelay: 2000, // Start with 2 seconds
      });

      // 🧩 Detect bad "I am an AI Evaluator…" responses
      const lower = feedbackText.toLowerCase();
      const looksWrong =
        lower.includes("i understand") ||
        lower.includes("you are") ||
        lower.includes("provide me with") ||
        lower.includes("my role") ||
        lower.includes("objectively assess") ||
        !feedbackText.includes("{");

      if (looksWrong) {
        console.warn(`⚠️ Gemini returned non-evaluation text, attempting repair...`);
        // Try a repair prompt
        const repairPrompt = `Convert this to valid JSON with correctness, clarity, confidence (0-10), and overall_feedback:\n${feedbackText}`;
        try {
          feedbackText = await callGeminiWithRetry(repairPrompt, {
            model: "gemini-1.5-flash",
            maxRetries: 3,
          });
        } catch (repairError) {
          console.warn("⚠️ Repair attempt failed, using original response");
        }
      }
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error.message);
      // Return a default feedback structure if API fails
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable",
        message: error.message.includes("Rate limit") 
          ? "The AI service is experiencing high demand. Please wait a moment and try again."
          : "Unable to evaluate answer at this time. Please try again in a few moments.",
        retryAfter: 60, // Suggest retrying after 60 seconds
      });
    }

    // 3️⃣ Parse safely
    let feedback = parseFeedbackSafely(feedbackText);

    // If still failed, last-chance "repair prompt"
    if (feedback.parsingFailed) {
      const repairPrompt = `
Convert the following text into valid JSON with numeric scores.
Use fields: correctness, clarity, confidence, overall_feedback.
Text:
${feedbackText}`;
      try {
        const repairText = await callGeminiWithRetry(repairPrompt, {
          model: "gemini-1.5-flash",
          maxRetries: 2,
        });
        feedback = parseFeedbackSafely(repairText);
      } catch (repairError) {
        console.warn("⚠️ Repair prompt also failed");
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
    
    // Check if it's a rate limit error
    if (err.message && (err.message.includes("429") || err.message.includes("Rate limit"))) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message: "The AI service is experiencing high demand. Please wait a moment and try again.",
        retryAfter: 60,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Error evaluating answer",
      message: err.message || "An unexpected error occurred",
    });
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
- Return ONLY valid JSON, no markdown code blocks, no explanatory text, just the JSON object.

Output JSON structure (must be valid JSON):
{
  "week1": { "focus": "Brief focus description", "topics": ["topic1", "topic2"], "resources": ["resource1", "resource2"] },
  "week2": { "focus": "Brief focus description", "topics": ["topic1", "topic2"], "resources": ["resource1", "resource2"] },
  "week3": { "focus": "Brief focus description", "topics": ["topic1", "topic2"], "resources": ["resource1", "resource2"] },
  "week4": { "focus": "Brief focus description", "topics": ["topic1", "topic2"], "resources": ["resource1", "resource2"] }
}
`;

    console.log("🔮 Generating prep guide for domains:", weakDomains.join(", "));
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text().trim();
    
    console.log("📥 Raw AI response length:", aiResponse.length);
    console.log("📥 First 200 chars:", aiResponse.substring(0, 200));

    // Extract JSON from markdown code blocks if present
    let cleaned = aiResponse;
    
    // Remove ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
    
    // Find JSON object boundaries
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    let prepGuide;
    let parseAttempts = 0;
    const maxAttempts = 3;
    
    while (parseAttempts < maxAttempts) {
      try {
        prepGuide = JSON.parse(cleaned);
        console.log("✅ Successfully parsed prep guide JSON");
        
        // Validate structure
        if (prepGuide.week1 && prepGuide.week2 && prepGuide.week3 && prepGuide.week4) {
          break; // Success
        } else {
          throw new Error("Missing required week fields");
        }
      } catch (parseError) {
        parseAttempts++;
        console.warn(`⚠️ JSON parse attempt ${parseAttempts} failed:`, parseError.message);
        
        if (parseAttempts < maxAttempts) {
          // Try to fix common JSON issues
          cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas
          cleaned = cleaned.replace(/([,\{[])\s*\n\s*([,\}\]])/g, "$1 $2"); // Fix newlines in JSON
        } else {
          // Last attempt: try to extract and reconstruct
          console.error("❌ Failed to parse JSON after", maxAttempts, "attempts");
          prepGuide = {
            raw: aiResponse,
            note: "Could not parse structured JSON from AI response",
            error: parseError.message,
            parsedText: cleaned.substring(0, 500)
          };
        }
      }
    }

    // Validate prepGuide structure before sending
    if (!prepGuide || prepGuide.note) {
      console.error("❌ Prep guide parsing failed, sending error response");
      return res.status(500).json({
        success: false,
        error: "Failed to generate structured prep guide",
        message: prepGuide?.note || "AI response could not be parsed",
        weakDomains,
        rawResponse: aiResponse.substring(0, 1000) // First 1000 chars for debugging
      });
    }

    const finalResponse = { weakDomains, prepGuide };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(finalResponse));
    console.log("✅ Prep guide generated and cached successfully");

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

// ------------------------------
// 💾 Save Complete Interview Session (Multiple Q&A)
// ------------------------------
export const saveCompleteSession = async (req, res) => {
  try {
    const { domain, questions, answers, feedbacks, scores } = req.body;

    if (!domain || !questions || !answers || !Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Domain, questions array, and answers array are required.",
      });
    }

    if (questions.length !== answers.length) {
      return res.status(400).json({
        success: false,
        error: "Number of questions must match number of answers.",
      });
    }

    // Calculate average score from all feedbacks
    let totalScore = 0;
    let validScores = 0;
    const allFeedbacks = [];

    if (feedbacks && Array.isArray(feedbacks)) {
      feedbacks.forEach((fb) => {
        if (fb && typeof fb === "object") {
          allFeedbacks.push(fb);
          // Calculate score from feedback
          const correctness = fb.correctness || 0;
          const clarity = fb.clarity || 0;
          const confidence = fb.confidence || 0;
          const avg = (correctness + clarity + confidence) / 3;
          if (!isNaN(avg) && avg > 0) {
            totalScore += avg;
            validScores++;
          }
        }
      });
    }

    const averageScore = validScores > 0 ? totalScore / validScores : 0;

    // Save complete session
    const session = await InterviewSession.create({
      userId: req.user._id,
      domain: domain || "Resume-Based",
      questions,
      answers,
      feedback: allFeedbacks.length > 0 ? { all: allFeedbacks } : {},
      score: averageScore,
    });

    res.json({
      success: true,
      sessionId: session._id,
      score: averageScore,
      message: "Interview session saved successfully",
    });
  } catch (error) {
    console.error("Error saving complete session:", error.message);
    res.status(500).json({
      success: false,
      error: "Error saving interview session",
      details: error.message,
    });
  }
};

// ------------------------------
// 🚀 Stage 2: Start Interview (Initialize Redis Session)
// ------------------------------
export const startInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // ✅ Step 1: Try to load resume from Redis cache
    let resumeText = "";
    const resumeCacheKey = `resume:${userId}`;
    
    try {
      const cachedResume = await redisClient.get(resumeCacheKey);
      if (cachedResume) {
        resumeText = cachedResume;
        console.log("✅ Resume loaded from Redis cache");
      } else {
        return res.status(400).json({
          success: false,
          error: "No resume found. Please upload your resume first.",
          message: "Resume not found in cache. Please upload your resume before starting an interview."
        });
      }
    } catch (redisError) {
      console.error("❌ Redis error loading resume:", redisError.message);
      return res.status(500).json({
        success: false,
        error: "Failed to load resume from cache"
      });
    }

    // ✅ Step 2: Generate first question using Gemini
    const prompt = `You are a professional technical interviewer conducting a comprehensive interview. Your goal is to thoroughly assess the candidate's technical skills, problem-solving abilities, and experience.

RESUME:
${resumeText}

Start the interview naturally. Begin with an introductory question that helps you understand their background better. This should be a warm, conversational opening question that sets a professional yet friendly tone.

Generate only the first interview question. Do not include any introduction or explanation, just the question itself.`;

    let firstQuestion;
    try {
      firstQuestion = await callGeminiWithRetry(prompt, {
        model: "gemini-2.0-flash",
        maxRetries: 5,
        initialDelay: 2000,
      });
      firstQuestion = firstQuestion.trim();
    } catch (error) {
      console.error("❌ Error generating first question:", error.message);
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable",
        message: error.message.includes("Rate limit")
          ? "The AI service is experiencing high demand. Please wait a moment and try again."
          : "Unable to start interview at this time. Please try again in a few moments.",
        retryAfter: 60,
      });
    }

    // ✅ Step 3: Create interview session in Redis
    const sessionKey = `session:${userId}`;
    const sessionData = {
      stage: "started",
      currentQuestion: firstQuestion,
      resumeText: resumeText,
      history: JSON.stringify([
        { role: "interviewer", text: firstQuestion, timestamp: new Date().toISOString() }
      ]),
      questionCount: "1",
      startedAt: new Date().toISOString()
    };

    await redisClient.hSet(sessionKey, sessionData);
    // Set TTL to 2 hours (interview shouldn't last longer)
    await redisClient.expire(sessionKey, 7200);

    console.log("✅ Interview session started and stored in Redis");

    res.json({
      success: true,
      question: firstQuestion,
      sessionId: sessionKey,
      message: "Interview started successfully"
    });
  } catch (error) {
    console.error("❌ Error starting interview:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to start interview",
      details: error.message
    });
  }
};

// ------------------------------
// 💬 Stage 3: Ongoing Conversation (Dynamic Q&A Loop)
// ------------------------------
export const nextInterviewStep = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { answer } = req.body;

    if (!answer || answer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Answer is required and must be at least 10 characters"
      });
    }

    const sessionKey = `session:${userId}`;
    
    // ✅ Step 1: Load current session state from Redis
    const session = await redisClient.hGetAll(sessionKey);
    
    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error: "No active interview session found. Please start a new interview."
      });
    }

    // ✅ Step 2: Parse conversation history
    let history = [];
    try {
      history = JSON.parse(session.history || "[]");
    } catch (parseError) {
      console.warn("⚠️ Failed to parse history, starting fresh");
      history = [];
    }

    // ✅ Step 3: Append user's answer to conversation history
    history.push({
      role: "user",
      text: answer.trim(),
      timestamp: new Date().toISOString()
    });

    // ✅ Step 4: Send updated conversation to Gemini for next response
    // Build conversation context
    const conversationContext = history.map(msg => 
      `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${msg.text}`
    ).join("\n\n");

    const questionCount = parseInt(session.questionCount || "0");
    
    const prompt = `You are a professional technical interviewer conducting a comprehensive, real-world interview. Your goal is to thoroughly evaluate the candidate across multiple dimensions:

1. **Technical Depth**: Assess their understanding of technologies mentioned in their resume
2. **Problem-Solving**: Evaluate their approach to solving complex problems
3. **System Design**: Understand their ability to design scalable systems (if relevant)
4. **Code Quality**: Discuss coding practices, best practices, and trade-offs
5. **Experience & Projects**: Deep dive into their past projects and real-world experience
6. **Behavioral & Communication**: Understand their teamwork, leadership, and communication skills
7. **Edge Cases & Optimization**: Explore their thinking on edge cases, performance, and optimization

RESUME:
${session.resumeText || "Resume not available"}

CONVERSATION SO FAR (${questionCount} questions asked):
${conversationContext}

**CRITICAL INSTRUCTIONS:**
- This is a COMPREHENSIVE interview - you MUST continue asking questions
- Current question count: ${questionCount}
- **DO NOT end the interview until you have asked AT LEAST 15-20 questions**
- **ALWAYS ask another question unless ALL these conditions are met:**
  1. You have asked at least 15 questions (Current: ${questionCount})
  2. You have covered multiple technical areas from their resume
  3. You have had at least 2-3 deep technical discussions
  4. You have asked system design or architecture questions (if applicable)
  5. You have asked behavioral/experience-based questions
  6. You have thoroughly assessed their problem-solving approach

**Interview Guidelines:**
- Vary question types: technical deep-dives, system design, coding scenarios, behavioral questions
- Build on previous answers - ask follow-up questions to dig deeper
- Cover different aspects: frontend, backend, databases, architecture, algorithms, etc.
- Make it conversational and natural - like a real interview
- If question count is less than 15, you MUST continue asking questions

**When to Complete:**
ONLY indicate INTERVIEW_COMPLETE if:
- You have asked at least 15 questions AND
- You have thoroughly covered all dimensions listed above AND
- You genuinely believe you have a complete assessment

**Response Format:**
FEEDBACK: [brief, constructive feedback on their last answer - 1-2 sentences]
QUESTION: [next question or "INTERVIEW_COMPLETE" ONLY if all conditions above are met]

**IMPORTANT: If question count is ${questionCount} and it's less than 15, you MUST ask another question. Do NOT end the interview yet.**`;

    let aiResponse;
    try {
      aiResponse = await callGeminiWithRetry(prompt, {
        model: "gemini-2.0-flash",
        maxRetries: 5,
        initialDelay: 2000,
      });
      aiResponse = aiResponse.trim();
    } catch (error) {
      console.error("❌ Error in nextInterviewStep:", error.message);
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable",
        message: error.message.includes("Rate limit")
          ? "The AI service is experiencing high demand. Please wait a moment and try again."
          : "Unable to process interview step at this time. Please try again in a few moments.",
        retryAfter: 60,
      });
    }

    // ✅ Step 5: Parse AI response
    let feedback = "";
    let nextQuestion = "";
    let isComplete = false;

    // Check if interview should complete (only if explicitly stated AND we have enough questions)
    const hasCompleteSignal = aiResponse.includes("INTERVIEW_COMPLETE") || 
                             aiResponse.toLowerCase().includes("interview complete") ||
                             aiResponse.toLowerCase().includes("that concludes") ||
                             aiResponse.toLowerCase().includes("thank you for your time");
    
    // Only complete if explicitly signaled AND we've asked at least 10 questions (minimum for comprehensive interview)
    if (hasCompleteSignal && questionCount >= 10) {
      isComplete = true;
      feedback = aiResponse.replace(/INTERVIEW_COMPLETE/gi, "").trim();
    } else {
      // Extract feedback and question
      const feedbackMatch = aiResponse.match(/FEEDBACK:\s*(.+?)(?=QUESTION:|$)/is);
      const questionMatch = aiResponse.match(/QUESTION:\s*(.+?)$/is);
      
      feedback = feedbackMatch ? feedbackMatch[1].trim() : "";
      nextQuestion = questionMatch ? questionMatch[1].trim() : aiResponse;
      
      // If no question found and we have enough questions, check if it's a completion message
      if (!nextQuestion || nextQuestion.length < 10) {
        // Only complete if we've asked enough questions
        if (questionCount >= 10 && hasCompleteSignal) {
          isComplete = true;
        } else {
          // If parsing failed but we don't have enough questions, try to extract question from full response
          nextQuestion = aiResponse.length > 20 ? aiResponse : "Could you elaborate on that?";
        }
      }
      
      // Safety: Don't let interview go beyond 30 questions (very comprehensive)
      if (questionCount >= 30) {
        isComplete = true;
        feedback = "We've covered a comprehensive range of topics. Let's wrap up the interview.";
      }
    }

    // ✅ Step 6: Store micro feedback in Redis
    if (feedback) {
      try {
        const feedbackKey = `feedback:${userId}`;
        await redisClient.lPush(feedbackKey, feedback);
        await redisClient.lTrim(feedbackKey, 0, 9); // Keep last 10 feedbacks (for comprehensive interview)
        await redisClient.expire(feedbackKey, 1800); // 30 minutes TTL
      } catch (redisError) {
        console.warn("⚠️ Failed to cache feedback:", redisError.message);
      }
    }

    // ✅ Step 7: Update session in Redis
    if (isComplete) {
      // Mark session as complete
      await redisClient.hSet(sessionKey, {
        ...session,
        stage: "completed",
        history: JSON.stringify(history)
      });
    } else {
      // Add interviewer's next question to history
      history.push({
        role: "interviewer",
        text: nextQuestion,
        timestamp: new Date().toISOString()
      });

      const questionCount = parseInt(session.questionCount || "0") + 1;
      
      await redisClient.hSet(sessionKey, {
        ...session,
        history: JSON.stringify(history),
        currentQuestion: nextQuestion,
        questionCount: questionCount.toString()
      });
    }

    // ✅ Step 8: Return response
    res.json({
      success: true,
      feedback: feedback || "Good answer!",
      question: nextQuestion,
      isComplete,
      questionCount: parseInt(session.questionCount || "0") + 1
    });

  } catch (error) {
    console.error("❌ Error in nextInterviewStep:", error.message);
    
    // Check if it's a rate limit error
    if (error.message && (error.message.includes("429") || error.message.includes("Rate limit"))) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message: "The AI service is experiencing high demand. Please wait a moment and try again.",
        retryAfter: 60,
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to process interview step",
      details: error.message
    });
  }
};

// ------------------------------
// 🏁 Stage 5: End Interview (Summary & Cleanup)
// ------------------------------
export const endInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;

    // ✅ Step 1: Load full conversation from Redis
    const session = await redisClient.hGetAll(sessionKey);
    
    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error: "No active interview session found"
      });
    }

    // ✅ Step 2: Parse conversation history
    let history = [];
    try {
      history = JSON.parse(session.history || "[]");
    } catch (parseError) {
      console.warn("⚠️ Failed to parse history");
      history = [];
    }

    // ✅ Step 3: Extract questions and answers
    const questions = [];
    const answers = [];
    
    history.forEach((msg, index) => {
      if (msg.role === "interviewer") {
        questions.push(msg.text);
      } else if (msg.role === "user") {
        answers.push(msg.text);
      }
    });

    // ✅ Step 4: Generate final AI summary
    const conversationText = history.map(msg => 
      `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${msg.text}`
    ).join("\n\n");

    const summaryPrompt = `You are an AI Interview Evaluator. Analyze this comprehensive interview conversation and provide a detailed, thorough evaluation.

This was a full technical interview covering multiple aspects: technical depth, problem-solving, system design, coding practices, experience, and behavioral skills.

RESUME:
${session.resumeText || "Not available"}

INTERVIEW CONVERSATION (${questions.length} questions asked):
${conversationText}

Provide a detailed JSON response with:
{
  "overallScore": number (0-10),
  "strengths": ["strength1", "strength2", "strength3", ...] - at least 3-5 strengths,
  "weaknesses": ["weakness1", "weakness2", ...] - areas for improvement,
  "summary": "3-4 paragraph comprehensive assessment covering: technical skills evaluation, problem-solving approach, communication, and overall fit",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", ...] - specific actionable recommendations,
  "technicalDepth": number (0-10) - how deep their technical knowledge is,
  "problemSolving": number (0-10) - their problem-solving ability,
  "communication": number (0-10) - clarity and communication skills,
  "experienceRelevance": number (0-10) - how relevant their experience is
}

Be thorough and detailed in your evaluation. This was a comprehensive interview, so provide comprehensive feedback.

Return ONLY valid JSON, no markdown, no code blocks.`;

    let summaryText;
    let finalSummary;
    
    try {
      summaryText = await callGeminiWithRetry(summaryPrompt, {
        model: "gemini-2.0-flash",
        maxRetries: 5,
        initialDelay: 2000,
      });
      summaryText = summaryText.trim();
      
      // Clean JSON from markdown
      summaryText = summaryText.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();
      const jsonStart = summaryText.indexOf("{");
      const jsonEnd = summaryText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        summaryText = summaryText.substring(jsonStart, jsonEnd + 1);
      }

      try {
        finalSummary = JSON.parse(summaryText);
      } catch (parseError) {
        console.warn("⚠️ Failed to parse summary JSON, using defaults");
        finalSummary = {
          overallScore: 7,
          strengths: ["Good communication"],
          weaknesses: ["Could improve technical depth"],
          summary: "Interview completed successfully.",
          recommendations: ["Continue practicing technical questions"],
          technicalDepth: 7,
          problemSolving: 7,
          communication: 7,
          experienceRelevance: 7,
        };
      }
    } catch (error) {
      console.error("❌ Error generating summary:", error.message);
      // Return a default summary structure if API fails
      finalSummary = {
        overallScore: 7,
        strengths: ["Good communication", "Relevant experience"],
        weaknesses: ["Could improve technical depth"],
        summary: "Interview completed successfully. Due to service limitations, detailed evaluation could not be generated at this time.",
        recommendations: ["Continue practicing technical questions", "Review system design concepts"],
        technicalDepth: 7,
        problemSolving: 7,
        communication: 7,
        experienceRelevance: 7,
      };
    }

    // ✅ Step 5: Store in MongoDB
    const interviewSession = await InterviewSession.create({
      userId: req.user._id,
      domain: "Resume-Based",
      questions,
      answers,
      feedback: {
        summary: finalSummary,
        all: history
      },
      score: finalSummary.overallScore || 7
    });

    // ✅ Step 6: Redis Cleanup
    try {
      await redisClient.del(sessionKey);
      await redisClient.del(`feedback:${userId}`);
      // Keep resume cache for potential retry
      console.log("✅ Redis session cleaned up");
    } catch (redisError) {
      console.warn("⚠️ Failed to cleanup Redis:", redisError.message);
    }

    res.json({
      success: true,
      sessionId: interviewSession._id,
      summary: finalSummary,
      score: finalSummary.overallScore || 7,
      message: "Interview completed and saved successfully"
    });

  } catch (error) {
    console.error("❌ Error ending interview:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to end interview",
      details: error.message
    });
  }
};

// ------------------------------
// 📊 Get Active Interview Session (Resume if needed)
// ------------------------------
export const getActiveSession = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;

    const session = await redisClient.hGetAll(sessionKey);
    
    if (!session || !session.stage) {
      return res.json({
        success: true,
        hasActiveSession: false
      });
    }

    let history = [];
    try {
      history = JSON.parse(session.history || "[]");
    } catch {
      history = [];
    }

    res.json({
      success: true,
      hasActiveSession: true,
      currentQuestion: session.currentQuestion,
      questionCount: parseInt(session.questionCount || "0"),
      history: history,
      stage: session.stage
    });

  } catch (error) {
    console.error("❌ Error getting active session:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get active session"
    });
  }
};
