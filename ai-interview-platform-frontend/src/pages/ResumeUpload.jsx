import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Play,
  Sparkles
} from "lucide-react";


const ResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target?.files?.[0];
    if (selectedFile) {
      console.log(
        "File selected:",
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      );

      const isPDF =
        selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf");

      if (!isPDF) {
        setError(
          `Invalid file type: ${
            selectedFile.type || "unknown"
          }. Please upload a PDF file.`
        );
        setFile(null);
        if (e.target?.value) {
          e.target.value = "";
        }
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError(
          `File size (${(selectedFile.size / 1024 / 1024).toFixed(
            2
          )}MB) exceeds 5MB limit. Please upload a smaller file.`
        );
        setFile(null);
        if (e.target?.value) {
          e.target.value = "";
        }
        return;
      }

      if (selectedFile.size === 0) {
        setError("File is empty. Please select a valid PDF file.");
        setFile(null);
        if (e.target?.value) {
          e.target.value = "";
        }
        return;
      }

      setFile(selectedFile);
      setError("");
      setSuccess(false);
      setQuestions("");
      console.log("File validated and set successfully");
    } else {
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setQuestions("");
    setUploadProgress(0);

    try {
      // Check if user is authenticated
      if (!user) {
        setError("Please log in first to upload your resume.");
        setLoading(false);
        navigate("/login");
        return;
      }

      // Ensure we have a fresh token
      const token = localStorage.getItem("firebaseToken");
      if (!token) {
        setError("Please log in first to upload your resume.");
        setLoading(false);
        navigate("/login");
        return;
      }

      console.log("Uploading file:", file.name, file.size, "bytes");
      console.log("File type:", file.type);
      console.log("User authenticated:", !!user);

      // Create FormData and upload with progress tracking
      const formData = new FormData();
      formData.append("resume", file);

      const res = await axiosInstance.post("/resume/upload", formData, {
        timeout: 120000, // 120 seconds for AI processing
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      console.log("Upload response:", res.data);
      console.log("Response status:", res.status);
      console.log("Questions in response:", res.data?.questions ? "Yes" : "No");
      console.log("Questions length:", res.data?.questions?.length || 0);

      let questionsData = null;
      
      if (res.data) {
        if (Array.isArray(res.data.questions)) {
          questionsData = res.data.questions;
        } else if (res.data.questions && typeof res.data.questions === 'string') {
          console.warn("⚠️ Backend returned string instead of array, parsing...");
          const lines = res.data.questions.split("\n").filter((line) => line.trim());
          questionsData = lines
            .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
            .filter((q) => q.length > 10);
        } else if (res.data.data && Array.isArray(res.data.data.questions)) {
          questionsData = res.data.data.questions;
        }
      }

      if (questionsData && Array.isArray(questionsData) && questionsData.length > 0) {
        console.log("✅ Questions received successfully:", questionsData.length, "questions");
        const questionsText = questionsData
          .map((q, idx) => `${idx + 1}. ${q}`)
          .join("\n");
        setQuestions(questionsText);
        setSuccess(true);
        setError(""); 
        setUploadProgress(100); 
        
        setTimeout(() => {
          const questionsSection = document.getElementById("questions-section");
          if (questionsSection) {
            questionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 500);
      } else {
        console.error("❌ No questions in response");
        console.error("Full response data:", JSON.stringify(res.data, null, 2));
        setError(
          "No questions were generated. The server response was empty. Please try again or check if the backend is properly configured with GEMINI_API_KEY."
        );
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        networkError: err.networkError,
      });

      if (err.networkError || !err.response) {
        setError(
          "Cannot connect to server. Please make sure the backend is running and you are logged in."
        );
      } else if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("firebaseToken");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (err.response?.status === 400) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid file. Please upload a valid PDF file.";
        setError(errorMsg);
      } else if (err.response?.status === 413) {
        setError("File too large. Please upload a file smaller than 5MB.");
      } else if (err.response?.status === 500 || err.response?.status === 503) {
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Server error. Please check if GEMINI_API_KEY is configured in the backend.";
        setError(errorMsg);
      } else {
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to analyze resume. Please try again.";
        setError(errorMsg);
      }
    } finally {
    setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Questions copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Resume Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Upload your resume to get personalized interview questions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleUpload} className="space-y-6" noValidate>
            {/* File Upload Area */}
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Upload Your Resume (PDF)
              </label>

              {/* Dropzone container */}
              <div
                className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-primary-500 transition-all duration-200 cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) {
                    handleFileChange({ target: { files: [droppedFile] } });
                  }
                }}
                onClick={() => {
                  if (!file) {
                    document.getElementById("file-upload")?.click();
                  }
                }}
              >
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-12 w-12 text-primary-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setQuestions("");
                        setSuccess(false);
                        setError("");
                        // Reset file input
                        const fileInput =
                          document.getElementById("file-upload");
                        if (fileInput) fileInput.value = "";
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-primary-600 hover:text-primary-500">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF up to 5MB</p>
                  </>
                )}

                {/* Hidden actual input */}
        <input
                  id="file-upload"
          type="file"
          accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Upload Failed</p>
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError("");
                        console.log("Error cleared. Ready to retry.");
                      }}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
            {success && questions && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 px-6 py-4 rounded-xl flex items-start gap-3 shadow-md">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    ✓ Resume Analyzed Successfully!
                  </h3>
                  <p className="text-sm">
                    Your personalized interview questions are ready below. Scroll down to view them and start your interview practice.
                  </p>
                </div>
              </div>
            )}

            {/* Analyze Button Section - More Prominent When File Selected */}
{file && !success && (
              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      File Ready to Analyze
                    </h3>
                    <p className="text-sm text-gray-600">
                      Click the button below to generate personalized interview questions
                    </p>
                  </div>
                </div>

                {/* --- MODIFIED BUTTON --- */}
                <button
                  type="submit"
                  disabled={loading}
                  /* FIX: 
                    1. Added `relative` for positioning the icon.
                    2. Removed `gap-3` (no longer needed).
                    3. Added `pl-16` and `pr-6` for padding to ensure
                       text never overlaps the absolute icon.
                  */
                  className="relative w-full py-4 pl-16 pr-6 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  onClick={(e) => {
                    if (!file) {
                      e.preventDefault();
                      setError("Please select a PDF file first");
                      return;
                    }
                    console.log("Submit button clicked, file:", file?.name);
                  }}
                >
                  {/* FIX: 
                    Icon is now in an `absolute` container,
                    vertically centered and positioned on the left.
                  */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Sparkles className="h-6 w-6" />
                    )}
                  </div>

                  {/* The `span` is now the only child in the flex layout,
                    so `justify-center` will center it perfectly.
                  */}
                  {loading ? (
                    <span>
                      {uploadProgress > 0
                        ? `Uploading... ${uploadProgress}%`
                        : "Analyzing Resume with AI..."}
                    </span>
                  ) : (
                    <span>Analyze Resume & Generate Questions</span>
                  )}
                </button>
                {/* --- END MODIFIED BUTTON --- */}


                {loading && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                )}

                {loading && uploadProgress === 0 && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-primary-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        Processing your resume... This may take 30-60 seconds
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!file && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Please select a PDF file above to begin
                </p>
              </div>
            )}
      </form>

          {/* Generated Questions */}
          {questions && (
            <div id="questions-section" className="mt-8 pt-8 border-t-4 border-primary-300">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8" />
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        🎉 Questions Generated Successfully!
                      </h2>
                      <p className="text-green-100">
                        Your personalized interview questions are ready. Start practicing below!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                <div className="flex flex-col items-center text-center gap-4">
                  
                  <div className="bg-blue-500 rounded-full p-3">
                    <Play className="h-7 w-7 text-white" />
                  </div>
                  
                  <h4 className="font-bold text-xl text-gray-900 mt-2">
                    Ready to Practice?
                  </h4>
                  
                  <p className="text-gray-600 mb-3 max-w-lg">
                    Start a comprehensive, real-time interview session. The AI will ask dynamic questions based on your answers and provide instant feedback.
                  </p>
                  
                  <button
                    onClick={() => navigate("/interview-flow")}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <Play className="h-5 w-5" />
                    Begin Full Interview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How It Works
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">1.</span>
              <span>Upload your resume in PDF format</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">2.</span>
              <span>Our AI analyzes your skills, experience, and projects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">3.</span>
              <span>
                Get 5 personalized interview questions tailored to your
                background
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">4.</span>
              <span>Practice these questions in the Interview section</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
