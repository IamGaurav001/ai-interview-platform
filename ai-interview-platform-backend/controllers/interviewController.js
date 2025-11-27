import redisClient from "../config/redis.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import InterviewSession from "../models/InterviewSession.js";
import User from "../models/User.js";
import { parseFeedbackSafely, calculateSafeScore } from "../utils/aiHelper.js";
import { callGeminiWithRetry } from "../utils/geminiHelper.js";
import { geminiSpeechToText } from "../utils/geminiSTT.js";
import fs from "fs";
import path from "path";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const evaluateAnswer = async (req, res) => {
  try {
    const { domain, question, answer } = req.body;
    if (!domain || !question || !answer)
      return res.status(400).json({
        success: false,
        error: "Domain, question, and answer are required.",
      });

    const cacheKey = `eval:${req.user._id}:${domain}:${Buffer.from(question)
      .toString("base64")
      .slice(0, 40)}:${Buffer.from(answer).toString("base64").slice(0, 40)}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({
        success: true,
        cached: true,
        ...parsed,
      });
    }

    
    const prompt = `
      You are a strict AI Interview Evaluator. You must be critical and thorough in your assessment.

      **CRITICAL EVALUATION RULES:**
      1. Default assumption: scores should be 4-6/10 unless answer is CLEARLY excellent
      2. Only give 8+ for answers that are: detailed, specific, technically accurate, AND directly address the question
      3. If answer is vague, repetitive, or lacks concrete examples: max 3/10
      4. If answer shows basic understanding but lacks depth: 4-5/10
      5. If answer is good but has minor gaps: 6-7/10

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

      Evaluate strictly. If the answer just repeats the question or provides no real content, correctness should be 0-2/10.`;

    let feedbackText = "";
    try {
      feedbackText = await callGeminiWithRetry(prompt, {
        model: "gemini-2.0-flash",
        maxRetries: 5,
        initialDelay: 2000,
      });

      const lower = feedbackText.toLowerCase();
      const looksWrong =
        lower.includes("i understand") ||
        lower.includes("you are") ||
        lower.includes("provide me with") ||
        lower.includes("my role") ||
        lower.includes("objectively assess") ||
        !feedbackText.includes("{");

      if (looksWrong) {
        console.warn(
          `⚠️ Gemini returned non-evaluation text, attempting repair...`
        );
        const repairPrompt = `Convert this to valid JSON with correctness, clarity, confidence (0-10), and overall_feedback:\n${feedbackText}`;
        try {
          feedbackText = await callGeminiWithRetry(repairPrompt, {
            model: "gemini-pro",
            maxRetries: 3,
          });
        } catch (repairError) {
          console.warn("⚠️ Repair attempt failed, using original response");
        }
      }
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error.message);
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable",
        message: error.message.includes("Rate limit")
          ? "The AI service is experiencing high demand. Please wait a moment and try again."
          : "Unable to evaluate answer at this time. Please try again in a few moments.",
        retryAfter: 60,
      });
    }

    let feedback = parseFeedbackSafely(feedbackText);

    if (feedback.parsingFailed) {
      const repairPrompt = `
Convert the following text into valid JSON with numeric scores.
Use fields: correctness, clarity, confidence, overall_feedback.
Text:
${feedbackText}`;
      try {
        const repairText = await callGeminiWithRetry(repairPrompt, {
          model: "gemini-pro",
          maxRetries: 2,
        });
        feedback = parseFeedbackSafely(repairText);
      } catch (repairError) {
        console.warn("⚠️ Repair prompt also failed");
        feedback.overall_feedback =
          "Unable to extract structured feedback. Please retry this question.";
      }
    }

    const score = calculateSafeScore(feedback);



    await redisClient.setEx(cacheKey, 600, JSON.stringify({ feedback, score }));

    res.json({
      success: true,
      cached: false,
      feedback,
      score,

    });
  } catch (err) {
    console.error("❌ Error in evaluateAnswer:", err.message);

    if (
      err.message &&
      (err.message.includes("429") || err.message.includes("Rate limit"))
    ) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message:
          "The AI service is experiencing high demand. Please wait a moment and try again.",
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

    const grouped = {};
    sessions.forEach((s) => {
      const domain = s.domain || "Unknown";
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(s);
    });

    const getConfidence = (score) => {
      if (score >= 8) return { label: "🟢 Strong", color: "green" };
      if (score >= 5) return { label: "🟡 Average", color: "yellow" };
      return { label: "🔴 Weak", color: "red" };
    };

    const groupedHistory = {};
    const summary = [];

    for (const domain of Object.keys(grouped)) {
      const domainSessions = grouped[domain];

      const validScores = domainSessions
        .map((s) => Number(s.score || 0))
        .filter((n) => !isNaN(n) && n > 0);

      const avgScore = validScores.length
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 0;

      const { label: avgLabel, color: avgColor } = getConfidence(avgScore);

      summary.push({
        domain,
        totalAttempts: domainSessions.length,
        averageScore: avgScore.toFixed(2),
        confidenceLevel: avgLabel,
        confidenceColor: avgColor,
      });

      groupedHistory[domain] = domainSessions.map((s) => {
        const { label, color } = getConfidence(Number(s.score || 0));
        const date = new Date(s.createdAt);
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" });
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "Pm" : "Am";
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, "0");
        const formattedDate = `${day} ${month} ${displayHours}:${displayMinutes}${ampm}`;
        
        return {
          id: s._id,
          score: s.score?.toFixed(2) || "0.00",
          confidenceLevel: label,
          confidenceColor: color,
          date: formattedDate,
          createdAt: s.createdAt,
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

export const saveCompleteSession = async (req, res) => {
  try {
    const { domain, questions, answers, feedbacks, scores } = req.body;

    if (
      !domain ||
      !questions ||
      !answers ||
      !Array.isArray(questions) ||
      !Array.isArray(answers)
    ) {
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

    let totalScore = 0;
    let validScores = 0;
    const allFeedbacks = [];

    if (feedbacks && Array.isArray(feedbacks)) {
      feedbacks.forEach((fb) => {
        if (fb && typeof fb === "object") {
          allFeedbacks.push(fb);
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

    // --- IDEMPOTENCY CHECK START ---
    // Check if a session was saved for this user in the last 30 seconds with the same number of questions
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingSession = await InterviewSession.findOne({
      userId: req.user._id,
      createdAt: { $gte: thirtySecondsAgo },
      $expr: { $eq: [{ $size: "$questions" }, questions.length] }
    });

    if (existingSession) {
      console.log("🔄 Duplicate session save prevented (Idempotency check)");
      return res.json({
        success: true,
        sessionId: existingSession._id,
        score: existingSession.score,
        message: "Interview session saved successfully (returned existing)",
      });
    }
    // --- IDEMPOTENCY CHECK END ---

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


export const startInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Check for existing active session to prevent double deduction (idempotency)
    const sessionKey = `session:${userId}`;
    const existingSession = await redisClient.hGetAll(sessionKey);
    
    if (existingSession && existingSession.stage && existingSession.currentQuestion) {
        console.log("🔄 Existing session found, returning it instead of starting new (Idempotent check)");
        return res.json({
            success: true,
            question: existingSession.currentQuestion,
            message: "Resumed existing session"
        });
    }

    const user = req.user;

    // --- ELIGIBILITY CHECK START ---
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Initialize usage if not present
    if (!user.usage) {
        user.usage = {
            freeInterviewsLeft: 2,
            lastMonthlyReset: new Date(),
            purchasedCredits: 0,
        };
    }

    // Check for monthly reset
    const now = new Date();
    const lastReset = new Date(user.usage.lastMonthlyReset);
    const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 30) {
        user.usage.freeInterviewsLeft = 2;
        user.usage.lastMonthlyReset = now;
    }

    // Check eligibility
    if (user.usage.freeInterviewsLeft > 0) {
        user.usage.freeInterviewsLeft -= 1;
        await user.save();
    } else if (user.usage.purchasedCredits > 0) {
        user.usage.purchasedCredits -= 1;
        await user.save();
    } else {
        return res.status(403).json({
            message: "No interview credits left. Please purchase more.",
            code: "NO_CREDITS",
        });
    }
    // --- ELIGIBILITY CHECK END ---


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
          message:
            "Resume not found in cache. Please upload your resume before starting an interview.",
        });
      }
    } catch (redisError) {
      console.error("❌ Redis error loading resume:", redisError.message);
      return res.status(500).json({
        success: false,
        error: "Failed to load resume from cache",
      });
    }


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
      // Refund credit if AI fails
      if (user.usage.freeInterviewsLeft < 3) { // Simple heuristic, better to track what was deducted
          user.usage.freeInterviewsLeft += 1;
      } else {
          user.usage.purchasedCredits += 1;
      }
      await user.save();

      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable",
        message: error.message.includes("Rate limit")
          ? "The AI service is experiencing high demand. Please wait a moment and try again."
          : "Unable to start interview at this time. Please try again in a few moments.",
        retryAfter: 60,
      });
    }


    // sessionKey already declared above
    const sessionData = {
      stage: "started",
      currentQuestion: firstQuestion,
      resumeText: resumeText,
      history: JSON.stringify([
        {
          role: "interviewer",
          text: firstQuestion,
          timestamp: new Date().toISOString(),
        },
      ]),
      questionCount: "1",
      startedAt: new Date().toISOString(),
    };

    await redisClient.hSet(sessionKey, sessionData);

    await redisClient.expire(sessionKey, 7200);

    console.log("✅ Interview session started and stored in Redis");

    res.json({
      success: true,
      question: firstQuestion,
      sessionId: sessionKey,
      message: "Interview started successfully",
    });
  } catch (error) {
    console.error("❌ Error starting interview:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to start interview",
      details: error.message,
    });
  }
};


export const nextInterviewStep = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { answer } = req.body;

    if (!answer || answer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Answer is required and must be at least 10 characters",
      });
    }

    const sessionKey = `session:${userId}`;


    const session = await redisClient.hGetAll(sessionKey);

    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error:
          "No active interview session found. Please start a new interview.",
      });
    }


    let history = [];
    try {
      history = JSON.parse(session.history || "[]");
    } catch (parseError) {
      console.warn("⚠️ Failed to parse history, starting fresh");
      history = [];
    }


    history.push({
      role: "user",
      text: answer.trim(),
      timestamp: new Date().toISOString(),
    });


    const conversationContext = history
      .map(
        (msg) =>
          `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${
            msg.text
          }`
      )
      .join("\n\n");

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
- This is a COMPREHENSIVE interview with a maximum of 25 questions
- Current question count: ${questionCount}
- **Interview should naturally conclude between 15-20 questions when you've covered all areas**
- **Maximum limit: 25 questions - if you reach 25 questions, you MUST end the interview**

**Interview Guidelines:**
- Vary question types: technical deep-dives, system design, coding scenarios, behavioral questions
- Build on previous answers - ask follow-up questions to dig deeper
- Cover different aspects: frontend, backend, databases, architecture, algorithms, etc.
- Make it conversational and natural - like a real interview

**When to Complete:**
You should indicate INTERVIEW_COMPLETE when:
- You have asked at least 12-15 questions AND
- You have thoroughly covered multiple technical areas from their resume AND
- You have had at least 2-3 deep technical discussions AND
- You have asked system design or architecture questions (if applicable) AND
- You have asked behavioral/experience-based questions AND
- You genuinely believe you have a comprehensive assessment

**OR if you reach 25 questions, you MUST end the interview.**

**Response Format:**
FEEDBACK: [brief, constructive feedback on their last answer - 1-2 sentences]
QUESTION: [next question or "INTERVIEW_COMPLETE" if conditions above are met]

**Current Status:**
- Questions asked: ${questionCount}
- If ${questionCount} < 12: Continue asking questions
- If ${questionCount} >= 12 and you've covered all areas: You may end the interview
- If ${questionCount} >= 25: You MUST end the interview`;

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


    const normalizeText = (text) =>
      (text || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

    const extractSections = (text) => {
      const result = {
        feedback: "",
        question: "",
      };

      if (!text) {
        return result;
      }

      const normalized = normalizeText(text);
      const questionSplit = normalized.split(/QUESTION\s*[:\-]/i);

      if (questionSplit.length > 1) {
        const feedbackPart = questionSplit.shift();
        const questionPart = questionSplit.join(" ").trim();

        if (feedbackPart) {
          const feedbackPieces = feedbackPart.split(/FEEDBACK\s*[:\-]/i);
          result.feedback = feedbackPieces.pop()?.trim() || "";
        }

        result.question = questionPart;
      } else {
        const feedbackPieces = normalized.split(/FEEDBACK\s*[:\-]/i);
        result.feedback = feedbackPieces.pop()?.trim() || normalized;
      }


      result.feedback = normalizeText(
        result.feedback.replace(/QUESTION\s*[:\-].*/is, "")
      );
      result.question = normalizeText(
        result.question
          .replace(/^\s*(QUESTION|FEEDBACK)\s*[:\-]\s*/i, "")
          .replace(/FEEDBACK\s*[:\-].*/is, "")
      );


      result.question = normalizeText(
        result.question.replace(/INTERVIEW_COMPLETE/gi, "")
      );

      return result;
    };

    const { feedback: parsedFeedback, question: parsedQuestion } =
      extractSections(aiResponse);

    let feedback = parsedFeedback;
    let nextQuestion = parsedQuestion;
    let isComplete = false;


    const hasCompleteSignal =
      aiResponse.includes("INTERVIEW_COMPLETE") ||
      aiResponse.toLowerCase().includes("interview complete") ||
      aiResponse.toLowerCase().includes("that concludes") ||
      aiResponse.toLowerCase().includes("thank you for your time");

    if (questionCount >= 25) {
      isComplete = true;
      feedback =
        feedback ||
        "We've reached the maximum number of questions. Let's wrap up the interview.";
      nextQuestion = "";
    } else if (hasCompleteSignal && questionCount >= 12) {
      isComplete = true;
      feedback = feedback || aiResponse.replace(/INTERVIEW_COMPLETE/gi, "").trim();
      nextQuestion = "";
    } else {
      if (!feedback) {
        feedback = "Thanks for the answer. Let's continue.";
      }

      if (!nextQuestion || nextQuestion.length < 5) {
        nextQuestion =
          aiResponse.length > 20
            ? extractSections(
                aiResponse.substring(aiResponse.indexOf("QUESTION"))
              ).question || aiResponse
            : "Could you elaborate on that?";
      }

      if (hasCompleteSignal && questionCount < 12) {
        console.log(
          `⚠️ AI tried to end at question ${questionCount}, but we need at least 12. Forcing continuation.`
        );
        nextQuestion =
          nextQuestion ||
          "Let me ask you another question about your experience...";
        isComplete = false;
      }
    }


    if (feedback) {
      try {
        const feedbackKey = `feedback:${userId}`;
        await redisClient.lPush(feedbackKey, feedback);
        await redisClient.lTrim(feedbackKey, 0, 9);
        await redisClient.expire(feedbackKey, 1800);
      } catch (redisError) {
        console.warn("⚠️ Failed to cache feedback:", redisError.message);
      }
    }


    if (isComplete) {
      await redisClient.hSet(sessionKey, {
        ...session,
        stage: "completed",
        history: JSON.stringify(history),
      });
    } else {
      history.push({
        role: "interviewer",
        text: nextQuestion,
        timestamp: new Date().toISOString(),
      });

      const updatedQuestionCount = parseInt(session.questionCount || "0") + 1;

      await redisClient.hSet(sessionKey, {
        ...session,
        history: JSON.stringify(history),
        currentQuestion: nextQuestion,
        questionCount: updatedQuestionCount.toString(),
      });
    }


    const currentCount = parseInt(session.questionCount || "0");

    res.json({
      success: true,
      feedback: feedback || "Good answer!",
      question: nextQuestion,
      isComplete,
      questionCount: currentCount + (isComplete ? 0 : 1),
    });
  } catch (error) {
    console.error("❌ Error in nextInterviewStep:", error.message);

    if (
      error.message &&
      (error.message.includes("429") || error.message.includes("Rate limit"))
    ) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message:
          "The AI service is experiencing high demand. Please wait a moment and try again.",
        retryAfter: 60,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to process interview step",
      details: error.message,
    });
  }
};

export const endInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;

    const session = await redisClient.hGetAll(sessionKey);

    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error: "No active interview session found",
      });
    }

    let history = [];
    try {
      history = JSON.parse(session.history || "[]");
    } catch (parseError) {
      console.warn("⚠️ Failed to parse history");
      history = [];
    }

    let cachedFeedbacks = [];
    try {
      const feedbackKey = `feedback:${userId}`;
      const cachedFeedbackList = await redisClient.lRange(feedbackKey, 0, -1);
      if (cachedFeedbackList && cachedFeedbackList.length > 0) {
        cachedFeedbacks = cachedFeedbackList.reverse(); 
        console.log(
          `✅ Retrieved ${cachedFeedbacks.length} cached feedbacks from Redis`
        );
      }
    } catch (redisError) {
      console.warn(
        "⚠️ Failed to retrieve cached feedbacks:",
        redisError.message
      );
    }

    const questions = [];
    const answers = [];
    const allFeedbacks = [];


    let currentQuestion = null;
    let currentAnswer = null;

    for (let i = 0; i < history.length; i++) {
      const msg = history[i];

      if (msg.role === "interviewer") {
        const text = msg.text.trim();

        const isFeedback =
          text.includes("FEEDBACK:") ||
          (text.length < 400 &&
            !text.includes("?") &&
            !text.includes("INTERVIEW_COMPLETE") &&
            !text.toLowerCase().includes("thanks for joining"));

        if (!isFeedback) {

          if (
            currentQuestion !== null &&
            currentAnswer !== null &&
            currentAnswer.trim().length > 0
          ) {
            questions.push(currentQuestion);
            answers.push(currentAnswer.trim());
          }
          currentQuestion = text;
          currentAnswer = null;
        }
      } else if (msg.role === "user") {
        if (currentQuestion !== null) {
          currentAnswer = msg.text.trim();
        }
      }
    }

    if (
      currentQuestion !== null &&
      currentAnswer !== null &&
      currentAnswer.trim().length > 0
    ) {
      questions.push(currentQuestion);
      answers.push(currentAnswer.trim());
    }


    if (questions.length !== answers.length) {
      console.warn(
        `⚠️ Mismatch: ${questions.length} questions but ${answers.length} answers. Adjusting...`
      );
      const minLength = Math.min(questions.length, answers.length);
      questions.splice(minLength);
      answers.splice(minLength);
    }

    const validPairs = [];
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] && answers[i].trim().length > 0) {
        validPairs.push({ question: questions[i], answer: answers[i] });
      }
    }

    questions.length = 0;
    answers.length = 0;
    validPairs.forEach((pair) => {
      questions.push(pair.question);
      answers.push(pair.answer);
    });

    if (questions.length === 0) {
      const emptySummary = {
        overallScore: 0,
        strengths: ["N/A"],
        weaknesses: ["No questions answered"],
        summary: "The interview was ended before any questions were answered.",
        recommendations: ["Please complete at least one question to get an evaluation."],
        technicalDepth: 0,
        problemSolving: 0,
        communication: 0,
        experienceRelevance: 0,
      };

      // Save empty session
      const interviewSession = await InterviewSession.create({
        userId: req.user._id,
        domain: "Resume-Based",
        questions: [],
        answers: [],
        feedback: {
          summary: emptySummary,
          all: [],
        },
        score: 0,
      });

      // Cleanup Redis
      try {
        await redisClient.del(sessionKey);
        await redisClient.del(`feedback:${userId}`);
      } catch (redisError) {
        console.warn("⚠️ Failed to cleanup Redis:", redisError.message);
      }

      return res.json({
        success: true,
        sessionId: interviewSession._id,
        summary: emptySummary,
        score: 0,
        message: "Interview ended with no answers.",
      });
    }


    for (let i = 0; i < questions.length; i++) {
      if (i < cachedFeedbacks.length && cachedFeedbacks[i]) {
        allFeedbacks[i] = {
          overall_feedback: cachedFeedbacks[i].trim() || "Feedback provided.",
        };
      } else {

        let feedbackText = "";
        let foundAnswer = false;

        for (let j = 0; j < history.length; j++) {
          if (history[j].role === "user" && history[j].text === answers[i]) {
            foundAnswer = true;
          } else if (foundAnswer && history[j].role === "interviewer") {
            const nextMsg = history[j].text.trim();
            if (
              nextMsg.includes("FEEDBACK:") ||
              (nextMsg.length < 400 &&
                !nextMsg.includes("?") &&
                !nextMsg.includes("INTERVIEW_COMPLETE"))
            ) {
              feedbackText = nextMsg.replace(/FEEDBACK:\s*/i, "").trim();
              break;
            } else if (nextMsg.includes("?")) {
              break;
            }
          }
        }

        allFeedbacks[i] = {
          overall_feedback:
            feedbackText ||
            (answers[i]
              ? "Feedback not available for this question."
              : "No answer provided."),
        };
      }
    }

    const conversationText = questions
      .map(
        (q, index) =>
          `Interviewer: ${q}\nCandidate: ${answers[index]}`
      )
      .join("\n\n");

    const summaryPrompt = `You are an AI Interview Evaluator. Analyze this interview conversation and provide a detailed, thorough evaluation based **STRICTLY** on the candidate's actual answers.
    
    **CRITICAL EVALUATION RULE:**
    - **DO NOT** give credit for skills listed in the RESUME unless they were explicitly demonstrated in the INTERVIEW CONVERSATION.
    - If the candidate provided short, vague, or incomplete answers, the score MUST reflect this (e.g., 0-3/10).
    - If the interview was short or the candidate did not answer enough questions, state clearly that there is "Insufficient data to assess" for those areas.
    - **DO NOT HALLUCINATE** performance. If it didn't happen in the chat, it didn't happen.
    
    RESUME (Use ONLY for context of what *should* have been covered):
    ${session.resumeText || "Not available"}
    
    INTERVIEW CONVERSATION (${questions.length} questions asked):
    ${conversationText}
    
    Provide a detailed JSON response with:
    {
      "overallScore": number (0-10) - strictly based on demonstrated performance,
      "strengths": ["strength1", "strength2", ...] - only what was actually shown,
      "weaknesses": ["weakness1", "weakness2", ...] - areas where they failed to answer or gave poor answers,
      "summary": "3-4 paragraph assessment. Be brutally honest. If they only said 'hello', say 'The candidate failed to engage'. Do not write a generic positive summary.",
      "recommendations": ["recommendation1", "recommendation2", ...] - specific to their performance gaps,
      "technicalDepth": number (0-10) - 0 if not demonstrated,
      "problemSolving": number (0-10) - 0 if not demonstrated,
      "communication": number (0-10) - based on clarity of actual responses,
      "experienceRelevance": number (0-10) - how well they articulated their experience (not just what's on paper)
    }
    
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
      summaryText = summaryText
        .replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1")
        .trim();
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
          overallScore: 5,
          strengths: ["Good communication"],
          weaknesses: ["Could improve technical depth"],
          summary: "Interview completed. Detailed evaluation unavailable.",
          recommendations: ["Continue practicing"],
          technicalDepth: 5,
          problemSolving: 5,
          communication: 5,
          experienceRelevance: 5,
        };
      }
    } catch (error) {
      console.error("❌ Error generating summary:", error.message);
      finalSummary = {
        overallScore: 0,
        strengths: ["N/A"],
        weaknesses: ["Evaluation failed"],
        summary:
          "Interview completed, but detailed evaluation could not be generated due to a service error.",
        recommendations: [
          "Please try again later",
        ],
        technicalDepth: 0,
        problemSolving: 0,
        communication: 0,
        experienceRelevance: 0,
      };
    }

    const interviewSession = await InterviewSession.create({
      userId: req.user._id,
      domain: "Resume-Based",
      questions,
      answers,
      feedback: {
        summary: finalSummary,
        all: allFeedbacks.length > 0 ? allFeedbacks : history, // Use structured feedbacks if available, otherwise history
      },
      score: finalSummary.overallScore || 7,
    });

    try {
      await redisClient.del(sessionKey);
      await redisClient.del(`feedback:${userId}`);
      console.log("✅ Redis session cleaned up");
    } catch (redisError) {
      console.warn("⚠️ Failed to cleanup Redis:", redisError.message);
    }

    res.json({
      success: true,
      sessionId: interviewSession._id,
      summary: finalSummary,
      score: finalSummary.overallScore || 7,
      message: "Interview completed and saved successfully",
    });
  } catch (error) {
    console.error("❌ Error ending interview:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to end interview",
      details: error.message,
    });
  }
};
// Evaluate Voice Answer (Speech-to-Text + Evaluation)
export const evaluateVoiceAnswer = async (req, res) => {
  try {
    const { domain, question } = req.body;
    const audioFile = req.file;

    if (!domain || !question) {
      return res.status(400).json({
        success: false,
        error: "Domain and question are required.",
      });
    }

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: "Audio file is required.",
      });
    }

    console.log("🎤 Processing voice answer...");
    console.log(
      "📁 Audio file:",
      audioFile.filename,
      "Size:",
      audioFile.size,
      "bytes"
    );

    // Step 1: Transcribe audio to text using Gemini
    let transcribedText = "";
    try {
      const audioPath = audioFile.path;
      const mimeType = audioFile.mimetype || "audio/webm";

      transcribedText = await geminiSpeechToText(audioPath, mimeType);
      console.log(
        "✅ Transcription:",
        transcribedText.substring(0, 100) + "..."
      );
    } catch (transcriptionError) {
      console.error("❌ Transcription error:", transcriptionError.message);

      try {
        fs.unlinkSync(audioFile.path);
      } catch (unlinkError) {
        console.warn("⚠️ Failed to delete audio file:", unlinkError.message);
      }

      return res.status(500).json({
        success: false,
        error: "Failed to transcribe audio",
        message: transcriptionError.message || "Could not process audio file",
      });
    }

    // Step 2: Clean up audio file (we don't need it anymore)
    try {
      fs.unlinkSync(audioFile.path);
      console.log("✅ Audio file cleaned up");
    } catch (unlinkError) {
      console.warn("⚠️ Failed to delete audio file:", unlinkError.message);
    }

    // Step 3: Evaluate the transcribed text using existing evaluation logic
    if (!transcribedText || transcribedText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error:
          "Transcribed text is too short or empty. Please try recording again.",
        transcribedText: transcribedText || "",
      });
    }

    const cacheKey = `eval:${req.user._id}:${domain}:${Buffer.from(question)
      .toString("base64")
      .slice(0, 40)}:${Buffer.from(transcribedText)
      .toString("base64")
      .slice(0, 40)}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({
        success: true,
        cached: true,
        transcribedText,
        ...parsed,
      });
    }

    // Generate evaluation using existing prompt
    const prompt = `
      You are a strict AI Interview Evaluator. You must be critical and thorough in your assessment.

      **CRITICAL EVALUATION RULES:**
      1. Default assumption: scores should be 4-6/10 unless answer is CLEARLY excellent
      2. Only give 8+ for answers that are: detailed, specific, technically accurate, AND directly address the question
      3. If answer is vague, repetitive, or lacks concrete examples: max 3/10
      4. If answer shows basic understanding but lacks depth: 4-5/10
      5. If answer is good but has minor gaps: 6-7/10

      Return **ONLY JSON**, no introductions, markdown, or text outside of braces.
      JSON format:
      {
        "correctness": number (0–10) - How accurately and completely the answer addresses the question. Be strict!
        "clarity": number (0–10) - How clear and well-articulated the answer is
        "confidence": number (0–10) - How confidently the candidate demonstrates knowledge
        "overall_feedback": "2–3 concise sentences of constructive feedback. Be specific about what's missing or wrong."
      }

      Question: ${question}
      Answer: ${transcribedText}

      Evaluate strictly. If the answer just repeats the question or provides no real content, correctness should be 0-2/10.`;

    let feedbackText = "";
    try {
      feedbackText = await callGeminiWithRetry(prompt, {
        model: "gemini-2.0-flash",
        maxRetries: 5,
        initialDelay: 2000,
      });

      // Detect bad responses
      const lower = feedbackText.toLowerCase();
      const looksWrong =
        lower.includes("i understand") ||
        lower.includes("you are") ||
        lower.includes("provide me with") ||
        lower.includes("my role") ||
        lower.includes("objectively assess") ||
        !feedbackText.includes("{");

      if (looksWrong) {
        console.warn(
          "⚠️ Gemini returned non-evaluation text, attempting repair..."
        );
        const repairPrompt = `Convert this to valid JSON with correctness, clarity, confidence (0-10), and overall_feedback:\n${feedbackText}`;
        try {
          feedbackText = await callGeminiWithRetry(repairPrompt, {
            model: "gemini-pro",
            maxRetries: 3,
          });
        } catch (repairError) {
          console.warn("⚠️ Repair attempt failed, using original response");
        }
      }
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error.message);
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable",
        message: error.message.includes("Rate limit")
          ? "The AI service is experiencing high demand. Please wait a moment and try again."
          : "Unable to evaluate answer at this time. Please try again in a few moments.",
        retryAfter: 60,
        transcribedText,
      });
    }

    // Parse feedback
    let feedback = parseFeedbackSafely(feedbackText);

    if (feedback.parsingFailed) {
      const repairPrompt = `
Convert the following text into valid JSON with numeric scores.
Use fields: correctness, clarity, confidence, overall_feedback.
Text:
${feedbackText}`;
      try {
        const repairText = await callGeminiWithRetry(repairPrompt, {
          model: "gemini-pro",
          maxRetries: 2,
        });
        feedback = parseFeedbackSafely(repairText);
      } catch (repairError) {
        console.warn("⚠️ Repair prompt also failed");
        feedback.overall_feedback =
          "Unable to extract structured feedback. Please retry this question.";
      }
    }

    const score = calculateSafeScore(feedback);

    await redisClient.setEx(cacheKey, 600, JSON.stringify({ feedback, score }));

    res.json({
      success: true,
      cached: false,
      transcribedText,
      feedback,
      score,
      // Removed sessionId - no session created for individual evaluations
    });
  } catch (err) {
    console.error("❌ Error in evaluateVoiceAnswer:", err.message);

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.warn("⚠️ Failed to delete audio file:", unlinkError.message);
      }
    }

    if (
      err.message &&
      (err.message.includes("429") || err.message.includes("Rate limit"))
    ) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message:
          "The AI service is experiencing high demand. Please wait a moment and try again.",
        retryAfter: 60,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error evaluating voice answer",
      message: err.message || "An unexpected error occurred",
    });
  }
};

// Get Active Interview Session (Resume if needed)

export const getActiveSession = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;

    const session = await redisClient.hGetAll(sessionKey);

    if (!session || !session.stage) {
      return res.json({
        success: true,
        hasActiveSession: false,
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
      stage: session.stage,
    });
  } catch (error) {
    console.error("❌ Error getting active session:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get active session",
    });
  }
};

// Cancel Interview (Exit without saving)
export const cancelInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;
    const feedbackKey = `feedback:${userId}`;

    const session = await redisClient.hGetAll(sessionKey);
    if (session && session.history) {
        try {
            const history = JSON.parse(session.history);
            if (history.length <= 5) {
                const user = await User.findById(userId);
                if (user) {
                    if (!user.usage) user.usage = {};
                    
                    if ((user.usage.freeInterviewsLeft || 0) < 3) {
                        user.usage.freeInterviewsLeft = (user.usage.freeInterviewsLeft || 0) + 1;
                    } else {
                        user.usage.purchasedCredits = (user.usage.purchasedCredits || 0) + 1;
                    }
                    await user.save();
                    console.log(`✅ Credit refunded for user ${userId} (Early cancellation)`);
                }
            }
        } catch (e) {
            console.warn("Failed to parse history for refund check", e);
        }
    }

    try {
      await redisClient.del(sessionKey);
      await redisClient.del(feedbackKey);
      console.log("✅ Interview session cancelled and Redis cleaned up");
    } catch (redisError) {
      console.warn("⚠️ Failed to cleanup Redis:", redisError.message);
    }

    res.json({
      success: true,
      message: "Interview cancelled successfully. Session data has been cleared.",
    });
  } catch (error) {
    console.error("❌ Error cancelling interview:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to cancel interview",
      details: error.message,
    });
  }
};

export const resetInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;

    // 1. Get active session
    const session = await redisClient.hGetAll(sessionKey);
    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error: "No active interview session found to reset.",
      });
    }

    // 2. Check reset count (per session)
    const resetCount = parseInt(session.resetCount || "0");
    if (resetCount >= 1) {
      return res.status(403).json({
        success: false,
        error: "Reset limit reached. You can only reset this interview once.",
      });
    }

    // 3. Get first question to restart
    let firstQuestion = "";
    let firstHistoryItem = null;
    try {
      const history = JSON.parse(session.history || "[]");
      if (history.length > 0 && history[0].role === "interviewer") {
        firstQuestion = history[0].text;
        firstHistoryItem = history[0];
      }
    } catch (e) {
      console.warn("Failed to parse history for reset");
    }

    if (!firstQuestion) {
      // Fallback: use currentQuestion if history is broken
      firstQuestion = session.currentQuestion;
      firstHistoryItem = {
        role: "interviewer",
        text: firstQuestion,
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Reset session state
    const newHistory = [firstHistoryItem];
    
    await redisClient.hSet(sessionKey, {
      ...session,
      questionCount: "1",
      currentQuestion: firstQuestion,
      history: JSON.stringify(newHistory),
      resetCount: (resetCount + 1).toString(),
      stage: "started"
    });

    // Clear feedback cache
    const feedbackKey = `feedback:${userId}`;
    await redisClient.del(feedbackKey);

    console.log(`✅ Interview session reset for user ${userId} (Count: ${resetCount + 1})`);

    res.json({
      success: true,
      message: "Interview reset to the beginning.",
      question: firstQuestion,
      questionCount: 1,
      history: newHistory,
      resetCount: resetCount + 1
    });

  } catch (error) {
    console.error("❌ Error resetting interview:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to reset interview",
      details: error.message,
    });
  }
};
