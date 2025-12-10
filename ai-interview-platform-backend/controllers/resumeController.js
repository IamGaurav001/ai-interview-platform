import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import redisClient from "../config/redis.js";
import User from "../models/User.js";

import { callGeminiWithRetry } from "../utils/geminiHelper.js";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeResume = async (req, res) => {
  let filePath = null;
  
  try {
    console.log("=== RESUME UPLOAD REQUEST ===");
    console.log("Request headers:", {
      authorization: req.headers.authorization ? "Present" : "Missing",
      contentType: req.headers["content-type"],
    });
    console.log("Request file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    } : "No file");
    console.log("Request user:", req.user ? { id: req.user._id, email: req.user.email } : "No user");
    
    if (!req.file) {
      console.error("❌ No file in request");
      return res.status(400).json({ 
        error: "No file uploaded. Please upload a PDF resume file." 
      });
    }

    filePath = req.file.path;
    console.log("========================================");
    console.log("Processing file:", filePath);
    
    const dataBuffer = fs.readFileSync(filePath);
    console.log("File size:", dataBuffer.length, "bytes");
    
    const data = new Uint8Array(dataBuffer);
    console.log("Converted to Uint8Array, length:", data.length);
    
    const { PDFParse } = await import("pdf-parse");
    console.log("pdf-parse imported successfully (v2.x)");
    
    const parser = new PDFParse({ data });
    console.log("Parser instance created");
    
    const textResult = await parser.getText();
    console.log("getText() called");
    console.log("textResult type:", typeof textResult);
    console.log("textResult constructor:", textResult?.constructor?.name);

    let resumeText = "";
    
    if (textResult && textResult.text) {
      resumeText = textResult.text;
    } else if (typeof textResult === 'string') {
      resumeText = textResult;
    } else {
      console.error("Unexpected textResult structure:", textResult);
      throw new Error("Unable to extract text from PDF parsing result");
    }

    console.log("\n=== TEXT EXTRACTION ===");
    console.log("Extracted text type:", typeof resumeText);
    console.log("Extracted text length:", resumeText?.length || 0);
    console.log("Is undefined:", resumeText === undefined);
    console.log("Is null:", resumeText === null);
    console.log("First 400 characters:");
    console.log(resumeText.substring(0, 400));
    console.log("=======================\n");
    
    await parser.destroy();
    console.log("Parser destroyed");

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      throw new Error(
        `Failed to extract valid text from PDF. Length: ${resumeText?.length || 0}. ` +
        "The PDF might be image-based, encrypted, or corrupted."
      );
    }

    const cleanResumeText = resumeText
      .replace(/\s+/g, ' ')         
      .replace(/\n+/g, '\n')        
      .trim();
    
    console.log("Cleaned text length:", cleanResumeText.length);
    console.log("Word count:", cleanResumeText.split(/\s+/).length);

    if (cleanResumeText.length < 50) {
      throw new Error("Resume text too short after cleaning.");
    }

    // Save to user profile (History)
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          resumes: {
            $each: [{
              text: cleanResumeText,
              fileName: req.file.originalname,
              uploadedAt: new Date()
            }],
            $slice: -3 // Keep last 3 resumes
          }
        }
      });
      console.log("✅ Resume saved to history");
    } catch (dbError) {
      console.error("⚠️ Failed to save resume history:", dbError);
    }

    const result = await generateInterviewQuestions(cleanResumeText, req.user._id);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up");
    }

    res.json({ 
      questions: result.questions,
      resumeText: cleanResumeText,
      metadata: {
        textLength: cleanResumeText.length,
        wordCount: cleanResumeText.split(/\s+/).length,
        questionsCount: result.questions.length
      }
    });

  } catch (error) {
    console.error("\n========================================");
    console.error("❌ ERROR in analyzeResume");
    console.error("========================================");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("========================================\n");
    
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("Temporary file cleaned up after error");
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError.message);
      }
    }
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message && (error.message.includes('503') || error.message.includes('overloaded'))) {
      errorMessage = "The AI service is temporarily overloaded. Please try again in a few moments.";
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: statusCode === 503 ? "AI Service Temporarily Unavailable" : "Error analyzing resume",
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      retry: statusCode === 503 ? "Please wait a moment and try again" : undefined
    });
  }
};
export const useExistingResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    console.log("=== EXISTING RESUME REQUEST ===", resumeId ? `ID: ${resumeId}` : "Latest");
    
    const user = await User.findById(req.user._id);

    if (!user || !user.resumes || user.resumes.length === 0) {
      return res.status(404).json({ error: "No resumes found. Please upload one first." });
    }

    let targetResume;
    
    if (resumeId) {
      targetResume = user.resumes.id(resumeId);
    } else {
      // Default to the most recent one (last in array)
      targetResume = user.resumes[user.resumes.length - 1];
    }

    if (!targetResume) {
       return res.status(404).json({ error: "Selected resume not found." });
    }

    const { text: resumeText, fileName } = targetResume;
    console.log(`Using resume: ${fileName}, length: ${resumeText.length}`);

    const result = await generateInterviewQuestions(resumeText, req.user._id);

    console.log("Sending successful response to client");
    console.log("========================================\n");

    res.json({ 
      questions: result.questions,
      resumeText: resumeText,
      metadata: {
        textLength: resumeText.length,
        wordCount: resumeText.split(/\s+/).length,
        questionsCount: result.questions.length
      }
    });

  } catch (error) {
    console.error("\n========================================");
    console.error("❌ ERROR in useExistingResume");
    console.error("========================================");
    console.error("Error message:", error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message && (error.message.includes('503') || error.message.includes('overloaded'))) {
      errorMessage = "The AI service is temporarily overloaded. Please try again in a few moments.";
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: statusCode === 503 ? "AI Service Temporarily Unavailable" : "Error generating questions",
      message: errorMessage,
      retry: statusCode === 503 ? "Please wait a moment and try again" : undefined
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Resume ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { resumes: { _id: id } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Resume ${id} deleted from history`);
    res.json({ success: true, message: "Resume deleted successfully" });

  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
};

async function generateInterviewQuestions(resumeText, userId) {
    try {
      const resumeCacheKey = `resume:${userId}`;
      await redisClient.setEx(resumeCacheKey, 3600, resumeText);
      console.log("✅ Resume cached in Redis with 1h TTL");
    } catch (redisError) {
      console.warn("⚠️ Failed to cache resume in Redis:", redisError.message);
    }

    console.log("\n=== PREPARING GEMINI REQUEST ===");

    const prompt = `You are an expert technical interviewer. I'm providing you with a candidate's resume below.
    
    Your task: Generate exactly 5 interview questions based on this specific candidate's background.

    RESUME:
    ${resumeText}

    Now, create 5 numbered interview questions (1-5) that are:
    - Specific to this candidate's skills, experience, and projects
    - Suitable for assessing their technical abilities
    - Clear and professional
    - Directly related to what's mentioned in their resume

    CRITICAL OUTPUT RULES:
    - Return ONLY the numbered list of questions.
    - Do NOT include any introductory text like "Here are the questions" or "Based on the resume".
    - Do NOT include any closing text.
    - Each line must start with a number followed by a dot or parenthesis.`;

    console.log("Prompt length:", prompt.length);
    const generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    };

    console.log("Sending request to Gemini...");
    
    let responseText;
    try {
      responseText = await callGeminiWithRetry(prompt, {
        model: "gemini-2.0-flash-exp", // Switched to faster, more reliable model
        maxRetries: 3,
        initialDelay: 1000,
        generationConfig,
      });
      console.log("✓ Successfully received response from Gemini");
    } catch (apiError) {
      console.error("❌ Error calling Gemini API:", apiError.message);
      
      if (apiError.message && apiError.message.includes("Rate limit exceeded")) {
        throw new Error(
          "The AI service is experiencing high demand and rate limits. Please wait 2-3 minutes and try again."
        );
      }
      
      if (apiError.message && (apiError.message.includes("404") || apiError.message.includes("not found"))) {
        throw new Error(
          "Gemini model not available. Please check your API key."
        );
      }
      
      throw apiError;
    }
    
    console.log("\n=== GEMINI RESPONSE ===");
    console.log("Response preview:", responseText.substring(0, 500));
    console.log("=======================\n");

    let questionsArray = [];
    
    const lines = responseText.split("\n").filter((line) => line.trim());
    
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[\.\)]\s*/, "").trim();
      
      const isIntro = /^(here are|based on|sure|okay|i have generated|following are)/i.test(cleaned);
      const isTooShort = cleaned.length < 15;
      const isMeta = /^(question|answer|note|tip)/i.test(cleaned);
      
      if (!isIntro && !isTooShort && !isMeta) {
        questionsArray.push(cleaned);
      }
    }

    if (questionsArray.length === 0) {
      const paragraphs = responseText.split(/\n\s*\n/).filter(p => p.trim().length > 10);
      if (paragraphs.length > 0) {
        questionsArray = paragraphs.slice(0, 5); 
      } else {
        const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 20);
        questionsArray = sentences.slice(0, 5);
      }
    }

    if (questionsArray.length > 5) {
      questionsArray = questionsArray.slice(0, 5);
    }

    console.log(`✅ Parsed ${questionsArray.length} questions from response`);

    return { questions: questionsArray };
}