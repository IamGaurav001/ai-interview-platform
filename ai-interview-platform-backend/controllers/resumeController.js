import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import redisClient from "../config/redis.js";

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

    // ✅ Stage 1: Cache resume text in Redis (TTL: 1 hour)
    try {
      const resumeCacheKey = `resume:${req.user._id}`;
      await redisClient.setEx(resumeCacheKey, 3600, cleanResumeText);
      console.log("✅ Resume cached in Redis with 1h TTL");
    } catch (redisError) {
      console.warn("⚠️ Failed to cache resume in Redis:", redisError.message);
    }

    console.log("\n=== PREPARING GEMINI REQUEST ===");

    const prompt = `You are an expert technical interviewer. I'm providing you with a candidate's resume below.
    
    Your task: Generate exactly 5 interview questions based on this specific candidate's background.

    RESUME:
    ${cleanResumeText}

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
    console.log("Resume snippet in prompt:", prompt.includes(cleanResumeText.substring(0, 100)) ? "✓" : "✗");

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
        model: "gemini-2.0-flash-lite", // Using lite version for better quota management
        maxRetries: 10, // Increased from 5 to 10 for better rate limit handling
        initialDelay: 2000,
        generationConfig,
      });
      console.log("✓ Successfully received response from Gemini");
    } catch (apiError) {
      console.error("❌ Error calling Gemini API:", apiError.message);
      
      // Check if it's a rate limit error
      if (apiError.message && apiError.message.includes("Rate limit exceeded")) {
        throw new Error(
          "The AI service is experiencing high demand and rate limits. Please wait 2-3 minutes and try uploading your resume again. " +
          "We apologize for the inconvenience."
        );
      }
      
      if (apiError.message && (apiError.message.includes("404") || apiError.message.includes("not found"))) {
        throw new Error(
          "Gemini model not available. Please check your API key and ensure you have access to Gemini models."
        );
      }
      
      throw apiError;
    }
    
    console.log("\n=== GEMINI RESPONSE ===");
    console.log("Response length:", responseText.length);
    console.log("Response preview:");
    console.log(responseText.substring(0, 500));
    console.log("=======================\n");

    const lowerResponse = responseText.toLowerCase();
    if (lowerResponse.includes('provide the resume') || 
        lowerResponse.includes('need the resume') ||
        lowerResponse.includes('you provided "undefined"')) {
      console.error("⚠️ WARNING: Gemini response indicates it didn't receive resume properly!");
      console.error("This is unexpected. Check the logs above.");
    }

    let questionsArray = [];
    
    const lines = responseText.split("\n").filter((line) => line.trim());
    
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[\.\)]\s*/, "").trim();
      
      // Improved filtering to remove introductory/concluding text
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

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up");
    }

    console.log("Sending successful response to client");
    console.log("========================================\n");

    res.json({ 
      questions: questionsArray,
      resumeText: cleanResumeText,
      metadata: {
        textLength: cleanResumeText.length,
        wordCount: cleanResumeText.split(/\s+/).length,
        questionsCount: questionsArray.length
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