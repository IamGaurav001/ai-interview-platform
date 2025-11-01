import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeResume = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
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

    console.log("\n=== PREPARING GEMINI REQUEST ===");
    let model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert technical interviewer. I'm providing you with a candidate's resume below.

Your task: Generate exactly 5 interview questions based on this specific candidate's background.

RESUME:
${cleanResumeText}

Now, create 5 numbered interview questions (1-5) that are:
- Specific to this candidate's skills, experience, and projects
- Suitable for assessing their technical abilities
- Clear and professional
- Directly related to what's mentioned in their resume

Format your response as a numbered list with just the questions.`;

    console.log("Prompt length:", prompt.length);
    console.log("Resume snippet in prompt:", prompt.includes(cleanResumeText.substring(0, 100)) ? "✓" : "✗");

    // Generation configuration
    const generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    };

    console.log("Sending request to Gemini...");
    
    // Generate content with retry logic
    let responseText;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        });
        responseText = result.response.text();
        console.log("✓ Successfully received response from Gemini");
        break; // Success, exit retry loop
      } catch (apiError) {
        retryCount++;
        
        // Check if it's an overload error
        const isOverload = apiError.message && (apiError.message.includes('503') || apiError.message.includes('overloaded'));
        
        if (isOverload && retryCount === 1) {
          // On first failure, try switching to gemini-1.5-flash as fallback
          console.log("⚠️ gemini-2.0-flash unavailable, switching to gemini-1.5-flash fallback...");
          model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          continue;
        }
        
        if (isOverload && retryCount < maxRetries) {
          const delayMs = 1000 * Math.pow(2, retryCount - 1); // 2s, 4s after first retry
          console.log(`⚠️ API overloaded (attempt ${retryCount}/${maxRetries}). Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // If we've exhausted retries or it's a different error, throw it
        throw apiError;
      }
    }
    
    console.log("\n=== GEMINI RESPONSE ===");
    console.log("Response length:", responseText.length);
    console.log("Response preview:");
    console.log(responseText.substring(0, 500));
    console.log("=======================\n");

    // Check for issues in response
    const lowerResponse = responseText.toLowerCase();
    if (lowerResponse.includes('provide the resume') || 
        lowerResponse.includes('need the resume') ||
        lowerResponse.includes('you provided "undefined"')) {
      console.error("⚠️ WARNING: Gemini response indicates it didn't receive resume properly!");
      console.error("This is unexpected. Check the logs above.");
    }

    // Cleanup the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up");
    }

    console.log("Sending successful response to client");
    console.log("========================================\n");

    // Send successful response
    res.json({ 
      questions: responseText,
      resumeText: cleanResumeText,
      metadata: {
        textLength: cleanResumeText.length,
        wordCount: cleanResumeText.split(/\s+/).length
      }
    });

  } catch (error) {
    console.error("\n========================================");
    console.error("❌ ERROR in analyzeResume");
    console.error("========================================");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("========================================\n");
    
    // Cleanup uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("Temporary file cleaned up after error");
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError.message);
      }
    }
    
    // Check if it's an API overload error
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