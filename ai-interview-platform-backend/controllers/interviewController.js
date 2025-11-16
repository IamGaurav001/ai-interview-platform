import redisClient from "../config/redis.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import InterviewSession from "../models/InterviewSession.js";
import { parseFeedbackSafely, calculateSafeScore } from "../utils/aiHelper.js";
import { callGeminiWithRetry } from "../utils/geminiHelper.js";
import { geminiTextToSpeech } from "../utils/geminiTTS.js";
import { geminiSpeechToText } from "../utils/geminiSTT.js";
import fs from "fs";
import path from "path";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Evaluate User's Answer
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
      const feedbackAudio = await geminiTextToSpeech(
        parsed.feedback?.overall_feedback || "Feedback generated successfully.",
        `feedback_${Date.now()}.mp3`
      );
      return res.json({
        success: true,
        cached: true,
        ...parsed,
        audioUrl: feedbackAudio,
      });
    }

    // Primary strict prompt with strict evaluation criteria
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

    // ✅ DO NOT create a session here - this is for individual question evaluation
    // Sessions should only be created when the complete interview is saved via saveCompleteSession or endInterview
    // Creating sessions here causes duplicate sessions in history

    await redisClient.setEx(cacheKey, 600, JSON.stringify({ feedback, score }));

    const feedbackAudio = await geminiTextToSpeech(
      feedback.overall_feedback || "Feedback generated successfully.",
      `feedback_${Date.now()}.mp3`
    );

    res.json({
      success: true,
      cached: false,
      feedback,
      score,
      // Removed sessionId - no session created for individual evaluations
      audioUrl: feedbackAudio,
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

// Get Interview History

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

// GET Weak Areas
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

// Stage 2: Start Interview (Initialize Redis Session)
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
    // Set TTL to 2 hours (interview shouldn't last longer)
    await redisClient.expire(sessionKey, 7200);

    console.log("✅ Interview session started and stored in Redis");

    // 🔊 Convert first question to voice
    const audioUrl = await geminiTextToSpeech(
      firstQuestion,
      `question_${Date.now()}.mp3`
    );

    res.json({
      success: true,
      question: firstQuestion,
      audioUrl,
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
        error: "Answer is required and must be at least 10 characters",
      });
    }

    const sessionKey = `session:${userId}`;

    // ✅ Step 1: Load current session state from Redis
    const session = await redisClient.hGetAll(sessionKey);

    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error:
          "No active interview session found. Please start a new interview.",
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
      timestamp: new Date().toISOString(),
    });

    // ✅ Step 4: Send updated conversation to Gemini for next response
    // Build conversation context
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

    // ✅ Step 5: Parse AI response
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

      // Clean up residual labels or duplicated sections
      result.feedback = normalizeText(
        result.feedback.replace(/QUESTION\s*[:\-].*/is, "")
      );
      result.question = normalizeText(
        result.question
          .replace(/^\s*(QUESTION|FEEDBACK)\s*[:\-]\s*/i, "")
          .replace(/FEEDBACK\s*[:\-].*/is, "")
      );

      // Remove any lingering INTERVIEW_COMPLETE marker from question text
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

    // Check if interview should complete
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

    // ✅ Step 6: Store micro feedback in Redis
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

    // ✅ Step 7: Update session in Redis
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

    // ✅ Step 8: Generate audio for feedback and next question
    let feedbackAudio = null;
    let questionAudio = null;

    if (feedback) {
      feedbackAudio = await geminiTextToSpeech(
        feedback,
        `feedback_${Date.now()}.mp3`
      );
    }

    if (nextQuestion && !isComplete) {
      questionAudio = await geminiTextToSpeech(
        nextQuestion,
        `question_${Date.now()}.mp3`
      );
    }

    // ✅ Step 9: Return response
    const currentCount = parseInt(session.questionCount || "0");

    res.json({
      success: true,
      feedback: feedback || "Good answer!",
      question: nextQuestion,
      isComplete,
      questionCount: currentCount + (isComplete ? 0 : 1),
      feedbackAudioUrl: feedbackAudio,
      questionAudioUrl: questionAudio,
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

// Stage 5: End Interview (Summary & Cleanup)
export const endInterview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const sessionKey = `session:${userId}`;

    // Step 1: Load full conversation from Redis
    const session = await redisClient.hGetAll(sessionKey);

    if (!session || !session.stage) {
      return res.status(404).json({
        success: false,
        error: "No active interview session found",
      });
    }

    // Step 2: Parse conversation history
    let history = [];
    try {
      history = JSON.parse(session.history || "[]");
    } catch (parseError) {
      console.warn("⚠️ Failed to parse history");
      history = [];
    }

    // Step 2.5: Try to get feedbacks from Redis cache
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

    // Step 3: Extract questions, answers, and feedbacks from conversation history
    const questions = [];
    const answers = [];
    const allFeedbacks = [];

    let currentQuestion = null;
    let currentAnswer = null;

    for (let i = 0; i < history.length; i++) {
      const msg = history[i];

      if (msg.role === "interviewer") {
        const text = msg.text.trim();

        // Check if this is feedback (contains "FEEDBACK:" or is short text without question mark)
        const isFeedback =
          text.includes("FEEDBACK:") ||
          (text.length < 400 &&
            !text.includes("?") &&
            !text.includes("INTERVIEW_COMPLETE") &&
            !text.toLowerCase().includes("thanks for joining"));

        if (!isFeedback) {
          // This is a question
          // If we have a previous Q&A pair, save it first
          if (
            currentQuestion !== null &&
            currentAnswer !== null &&
            currentAnswer.trim().length > 0
          ) {
            questions.push(currentQuestion);
            answers.push(currentAnswer.trim());
          }
          // Start new question
          currentQuestion = text;
          currentAnswer = null;
        }
      } else if (msg.role === "user") {
        // This is an answer
        if (currentQuestion !== null) {
          currentAnswer = msg.text.trim();
        }
      }
    }

    // Don't forget the last Q&A pair (only if it has a valid answer)
    if (
      currentQuestion !== null &&
      currentAnswer !== null &&
      currentAnswer.trim().length > 0
    ) {
      questions.push(currentQuestion);
      answers.push(currentAnswer.trim());
    }

    // Ensure questions and answers arrays have the same length
    // If they don't match, we have a problem - log it and fix it
    if (questions.length !== answers.length) {
      console.warn(
        `⚠️ Mismatch: ${questions.length} questions but ${answers.length} answers. Adjusting...`
      );
      // Keep only the pairs that have both question and answer
      const minLength = Math.min(questions.length, answers.length);
      questions.splice(minLength);
      answers.splice(minLength);
    }

    // Final validation: ensure all answers are non-empty (required by model)
    const validPairs = [];
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] && answers[i].trim().length > 0) {
        validPairs.push({ question: questions[i], answer: answers[i] });
      }
    }

    // Rebuild arrays with only valid pairs
    questions.length = 0;
    answers.length = 0;
    validPairs.forEach((pair) => {
      questions.push(pair.question);
      answers.push(pair.answer);
    });

    // Now map feedbacks from Redis cache to questions
    // The cached feedbacks are in chronological order (one per answer)
    // Ensure we have feedback for each question-answer pair
    for (let i = 0; i < questions.length; i++) {
      if (i < cachedFeedbacks.length && cachedFeedbacks[i]) {
        // Use cached feedback
        allFeedbacks[i] = {
          overall_feedback: cachedFeedbacks[i].trim() || "Feedback provided.",
        };
      } else {
        // Try to extract feedback from conversation history
        // Look for feedback messages after the answer
        let feedbackText = "";
        let foundAnswer = false;

        for (let j = 0; j < history.length; j++) {
          if (history[j].role === "user" && history[j].text === answers[i]) {
            foundAnswer = true;
          } else if (foundAnswer && history[j].role === "interviewer") {
            const nextMsg = history[j].text.trim();
            // Check if this is feedback
            if (
              nextMsg.includes("FEEDBACK:") ||
              (nextMsg.length < 400 &&
                !nextMsg.includes("?") &&
                !nextMsg.includes("INTERVIEW_COMPLETE"))
            ) {
              feedbackText = nextMsg.replace(/FEEDBACK:\s*/i, "").trim();
              break;
            } else if (nextMsg.includes("?")) {
              // This is the next question, no feedback found
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

    // Step 4: Generate final AI summary
    const conversationText = history
      .map(
        (msg) =>
          `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${
            msg.text
          }`
      )
      .join("\n\n");

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
        overallScore: 7,
        strengths: ["Good communication", "Relevant experience"],
        weaknesses: ["Could improve technical depth"],
        summary:
          "Interview completed successfully. Due to service limitations, detailed evaluation could not be generated at this time.",
        recommendations: [
          "Continue practicing technical questions",
          "Review system design concepts",
        ],
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
        all: allFeedbacks.length > 0 ? allFeedbacks : history, // Use structured feedbacks if available, otherwise history
      },
      score: finalSummary.overallScore || 7,
    });

    // ✅ Step 6: Redis Cleanup
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
      const feedbackAudio = await geminiTextToSpeech(
        parsed.feedback?.overall_feedback || "Feedback generated successfully.",
        `feedback_${Date.now()}.mp3`
      );
      return res.json({
        success: true,
        cached: true,
        transcribedText,
        ...parsed,
        audioUrl: feedbackAudio,
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

    const feedbackAudio = await geminiTextToSpeech(
      feedback.overall_feedback || "Feedback generated successfully.",
      `feedback_${Date.now()}.mp3`
    );

    res.json({
      success: true,
      cached: false,
      transcribedText,
      feedback,
      score,
      // Removed sessionId - no session created for individual evaluations
      audioUrl: feedbackAudio,
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
