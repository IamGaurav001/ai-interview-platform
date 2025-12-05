import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/userAPI";
import { getActiveSession } from "../api/interviewAPI";
import PricingModal from "../components/PricingModal";
import axiosInstance from "../api/axiosInstance";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Sparkles,
  X,
  ArrowRight,
  Zap,
  Shield,
  Target,
  PlayCircle,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";
import { logEvent } from "../config/amplitude";
import SEO from "../components/SEO";

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeSession, setActiveSession] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [checkingCredits, setCheckingCredits] = useState(true);

  useEffect(() => {
    checkCredits();
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const res = await getActiveSession();
      if (res.data && res.data.hasActiveSession) {
        setActiveSession(res.data);
      }
    } catch (err) {
      console.error("Error checking active session:", err);
    }
  };

  const checkCredits = async () => {
    try {
      const res = await getUserProfile();
      const usage = res.data.user?.usage;
      
      if (usage) {
        const totalCredits = (usage.freeInterviewsLeft || 0) + (usage.purchasedCredits || 0);
        if (totalCredits <= 0) {
          setShowPricingModal(true);
        }
      }
    } catch (error) {
      console.error("Error checking credits:", error);
    } finally {
      setCheckingCredits(false);
    }
  };

  const handlePaymentSuccess = () => {
    checkCredits();
    setShowPricingModal(false);
  };

  const handleModalClose = () => {
    setShowPricingModal(false);
    navigate("/dashboard");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target?.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      const isPDF =
        selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf");

      if (!isPDF) {
        setError(`Invalid file type. Please upload a PDF file.`);
        setFile(null);
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError(
          `File size (${(selectedFile.size / 1024 / 1024).toFixed(
            2
          )}MB) exceeds 5MB limit. Please upload a smaller file.`
        );
        setFile(null);
        return;
      }

      if (selectedFile.size === 0) {
        setError("File is empty. Please select a valid PDF file.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
      setSuccess(false);
      setQuestions("");
    } else {
      setFile(null);
    }
  };

  const progressInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (activeSession) {
      setError("You have an active interview session. Please complete or cancel it before uploading a new resume.");
      return;
    }

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    try {
      const res = await getUserProfile();
      const usage = res.data.user?.usage;
      const totalCredits = (usage?.freeInterviewsLeft || 0) + (usage?.purchasedCredits || 0);
      
      if (totalCredits <= 0) {
        setShowPricingModal(true);
        setError("You have no credits left. Please purchase more.");
        return;
      }
    } catch (err) {
      console.error("Error verifying credits:", err);
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setQuestions("");
    setUploadProgress(0);
    
    // Clear any existing interval
    if (progressInterval.current) clearInterval(progressInterval.current);

    try {
      if (!user) {
        setError("Please log in first to upload your resume.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const token = localStorage.getItem("firebaseToken");
      if (!token) {
        setError("Please log in first to upload your resume.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      const res = await axiosInstance.post("/resume/upload", formData, {
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Map upload (0-100) to first 60% of total progress
            const visualProgress = Math.min(Math.round(percentCompleted * 0.6), 60);
            setUploadProgress(visualProgress);

            // If upload is complete, start the "processing" simulation
            if (percentCompleted === 100) {
              if (progressInterval.current) clearInterval(progressInterval.current);
              progressInterval.current = setInterval(() => {
                setUploadProgress((prev) => {
                  if (prev >= 98) {
                    clearInterval(progressInterval.current);
                    return 98;
                  }
                  // Slow down as we get closer to 98%
                  const increment = prev > 80 ? 0.2 : 0.5;
                  return prev + increment;
                });
              }, 100);
            }
          }
        },
      });

      let questionsData = null;

      if (res.data) {
        if (Array.isArray(res.data.questions)) {
          questionsData = res.data.questions;
        } else if (
          res.data.questions &&
          typeof res.data.questions === "string"
        ) {
          const lines = res.data.questions
            .split("\n")
            .filter((line) => line.trim());
          questionsData = lines
            .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
            .filter((q) => q.length > 10 && !/^(here are|based on|sure|okay|i have generated)/i.test(q));
        } else if (res.data.data && Array.isArray(res.data.data.questions)) {
          questionsData = res.data.data.questions;
        }
      }

      if (
        questionsData &&
        Array.isArray(questionsData) &&
        questionsData.length > 0
      ) {
        logEvent('Resume Upload', { success: true });
        const questionsText = questionsData
          .map((q, idx) => `${idx + 1}. ${q}`)
          .join("\n");
        
        // Complete the progress bar
        if (progressInterval.current) clearInterval(progressInterval.current);
        setUploadProgress(100);
        
        // Small delay to let the user see 100%
        setTimeout(() => {
          setQuestions(questionsText);
          setSuccess(true);
          setError("");
          
          setQuestions(questionsText);
          setSuccess(true);
          setError("");
        }, 500);
      } else {
        logEvent('Resume Upload', { success: false, error: 'No questions generated' });
        setError(
          "No questions were generated. Please try again or check if the backend is properly configured."
        );
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      logEvent('Resume Upload', { success: false, error: err.message });
      if (err.networkError || !err.response) {
        console.error("Cannot connect to server. Please make sure the backend is running.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("firebaseToken");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to analyze resume. Please try again."
        );
      }
    } finally {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setLoading(false);
    }
  };

  // Auto-scroll to questions when they are generated
  useEffect(() => {
    if (success && questions) {
      // Small timeout to ensure DOM is rendered and animation has started
      const timer = setTimeout(() => {
        const questionsSection = document.getElementById("questions-section");
        if (questionsSection) {
          questionsSection.scrollIntoView({
            behavior: "smooth",
            block: "center", // Changed to center for better visibility
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [success, questions]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageLayout>
      <SEO title="Resume Upload" description="Upload your resume to generate personalized AI interview questions." />
      
      <div className="min-h-screen bg-slate-50/50 py-6 lg:py-10 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <motion.div
          className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="text-center mb-6 lg:mb-6" variants={itemVariants}>
            <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-2xl shadow-lg shadow-blue-100/50 mb-3 lg:mb-3 border border-slate-100">
              <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-[#1d2f62]" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 lg:mb-1 tracking-tight">
              Analyze Your Resume
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Upload your resume to unlock personalized interview questions tailored
              specifically to <span className="text-[#1d2f62] font-bold">you</span>.
            </p>
          </motion.div>

          {/* Active Session Alert */}
          {activeSession && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="h-6 w-6 text-[#1d2f62]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d2f62]">Interview in Progress</h3>
                  <p className="text-slate-600 font-medium">
                    You have an active session (Question {activeSession.questionCount}).
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/interview-flow")}
                className="w-full sm:w-auto px-6 py-3 bg-[#1d2f62] text-white rounded-xl font-bold hover:bg-[#1d2f62]/90 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                Resume Session
              </button>
            </motion.div>
          )}

          {/* Current Resume Display */}
          {user?.resumeUrl && !file && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-100">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">Current Resume Uploaded</p>
                  <a 
                    href={user.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                  >
                    View Resume <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium hidden sm:block">
                Upload new file below to update
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main Upload Area */}
            <motion.div 
              className="lg:col-span-8"
              variants={itemVariants}
            >
              <div className="bg-white rounded-3xl lg:rounded-[2.5rem] shadow-xl lg:shadow-2xl shadow-slate-200/50 border border-white overflow-hidden relative">
                <div 
                  className={`absolute top-0 left-0 h-1.5 lg:h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-out ${
                    loading ? "animate-gradient-x shadow-[0_0_20px_rgba(59,130,246,0.5)]" : ""
                  }`}
                  style={{ 
                    width: loading ? `${Math.max(uploadProgress, 5)}%` : "100%" 
                  }}
                />
                
                <div className="p-5 sm:p-6 lg:p-8">
                  <form onSubmit={handleUpload} className="space-y-6 lg:space-y-8" noValidate>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 px-1 gap-2">
                        <label className="text-lg lg:text-xl font-bold text-slate-900">
                          Upload Your Resume
                        </label>
                        <span className="self-start sm:self-auto text-xs lg:text-sm font-bold px-3 py-1 lg:px-4 lg:py-1.5 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wide">
                          PDF Only
                        </span>
                      </div>

                      <div
                        className={`relative group flex flex-col items-center justify-center w-full min-h-[220px] lg:min-h-[280px] p-5 lg:p-8 border-2 lg:border-3 border-dashed rounded-2xl lg:rounded-[2rem] transition-all duration-500 overflow-hidden ${
                          activeSession
                            ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                            : isDragging
                            ? "border-[#1d2f62] bg-[#1d2f62] scale-[1.01] shadow-2xl cursor-pointer"
                            : file
                            ? "border-emerald-200 bg-emerald-50/30 cursor-pointer"
                            : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 cursor-pointer"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (!activeSession) setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (activeSession) return;
                          const droppedFile = e.dataTransfer.files[0];
                          validateAndSetFile(droppedFile);
                        }}
                        onClick={() => !file && !activeSession && document.getElementById("file-upload")?.click()}
                      >
                        {/* Background Pattern for Dropzone */}
                        {!isDragging && !file && (
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                            style={{ backgroundImage: 'radial-gradient(#1d2f62 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                          />
                        )}

                        <AnimatePresence mode="wait">
                          {file ? (
                            <motion.div
                              key="file-selected"
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -20 }}
                              className="flex flex-col items-center text-center relative z-10"
                            >
                              <div className="h-16 w-16 lg:h-20 lg:w-20 bg-white rounded-2xl lg:rounded-[1.5rem] shadow-xl shadow-emerald-100 flex items-center justify-center mb-3 lg:mb-4 border-2 lg:border-4 border-emerald-50">
                                <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-emerald-600" />
                              </div>
                              <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1 lg:mb-1 break-all px-2 max-w-xs lg:max-w-lg">
                                {file.name}
                              </h3>
                              <p className="text-xs lg:text-sm text-slate-500 mb-4 lg:mb-6 font-medium bg-slate-100 px-3 py-1 lg:px-4 lg:py-1 rounded-full">
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
                                  const fileInput = document.getElementById("file-upload");
                                  if (fileInput) fileInput.value = "";
                                }}
                                className="inline-flex items-center gap-2 lg:gap-3 px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl lg:rounded-xl bg-white border lg:border-2 border-red-100 text-red-600 text-sm lg:text-base font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm hover:shadow-md"
                              >
                                <X className="h-4 w-4 lg:h-5 lg:w-5" />
                                Remove File
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="upload-prompt"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex flex-col items-center text-center relative z-10"
                            >
                              <div className="h-16 w-16 lg:h-20 lg:w-20 bg-white rounded-full flex items-center justify-center mb-3 lg:mb-4 shadow-xl shadow-blue-100/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 lg:border-4 border-blue-50">
                                <Upload className="h-6 w-6 lg:h-10 lg:w-10 text-[#1d2f62]" />
                              </div>
                              <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1 lg:mb-2">
                                <span className="text-[#1d2f62] border-b-2 lg:border-b-4 border-[#1d2f62]/20 pb-0.5 lg:pb-1">Click to upload</span>
                              </h3>
                              <p className="text-sm lg:text-base text-slate-500 font-medium">
                                {activeSession ? "Upload disabled during active session" : "or drag and drop your resume"}
                              </p>
                              <p className="mt-3 lg:mt-4 text-[10px] lg:text-xs text-slate-400 font-medium uppercase tracking-widest">
                                Max Size: 5MB
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <input
                          id="file-upload"
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={!!activeSession}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.95 }}
                          animate={{ opacity: 1, height: "auto", scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.95 }}
                          className="bg-red-50 border lg:border-2 border-red-100 text-red-800 px-4 py-4 lg:px-6 lg:py-4 rounded-2xl lg:rounded-2xl flex items-center gap-3 lg:gap-4 shadow-sm"
                        >
                          <div className="h-8 w-8 lg:h-10 lg:w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm lg:text-base">{error}</p>
                          </div>
                          <button
                            onClick={() => setError("")}
                            className="p-1.5 lg:p-2 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <X className="h-4 w-4 lg:h-5 lg:w-5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || !file || !!activeSession}
                        className={`relative w-full py-4 lg:py-5 px-6 lg:px-8 rounded-2xl lg:rounded-2xl font-bold text-lg lg:text-xl text-white shadow-lg lg:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 lg:gap-4 overflow-hidden group ${
                          loading || !file || activeSession
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            : "bg-[#1d2f62] hover:shadow-2xl hover:shadow-[#1d2f62]/30 hover:-translate-y-1 active:translate-y-0"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 animate-spin" />
                            <span>
                              {uploadProgress > 0
                                ? `Analyzing... ${uploadProgress}%`
                                : "Processing..."}
                            </span>
                            <div
                              className="absolute bottom-0 left-0 h-1.5 lg:h-2 bg-white/20 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 group-hover:animate-pulse" />
                            <span>Generate Interview Questions</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Sidebar / Steps */}
            <motion.div 
              className="lg:col-span-4 space-y-6 lg:space-y-6"
              variants={itemVariants}
            >
              <div className="bg-[#1d2f62] rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 text-white shadow-xl lg:shadow-2xl shadow-[#1d2f62]/20 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 flex items-center gap-3 lg:gap-4 relative z-10">
                  <div className="h-8 w-8 lg:h-10 lg:w-10 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/20">
                    <Target className="h-4 w-4 lg:h-5 lg:w-5 text-blue-300" />
                  </div>
                  Your Journey
                </h3>
                <div className="space-y-6 lg:space-y-8 relative z-10">
                  <StepItem
                    icon={Upload}
                    step="1"
                    title="Upload Your Resume"
                    description="Upload your PDF resume securely."
                  />
                  <StepItem
                    icon={Zap}
                    step="2"
                    title="AI Analyzes You"
                    description="We identify your unique skills & experience."
                  />

                  <StepItem
                    icon={Play}
                    step="3"
                    title="Practice Your Interview"
                    description="Answer questions tailored just for you."
                  />
                </div>
              </div>

              <div className="bg-emerald-50/50 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-6 shadow-lg border border-emerald-100/50">
                <h3 className="text-base lg:text-lg font-bold text-emerald-900 mb-3 lg:mb-3 flex items-center gap-2">
                  <div className="h-7 w-7 lg:h-8 lg:w-8 bg-emerald-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-emerald-600" />
                  </div>
                  Pro Tip
                </h3>
                <p className="text-sm lg:text-base text-emerald-800/80 leading-relaxed font-medium">
                  "The more detailed your resume, the better we can tailor questions to challenge your specific expertise."
                </p>
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {success && questions && (
              <motion.div
                id="questions-section"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="mt-12 lg:mt-16"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl lg:rounded-[2.5rem] p-1.5 lg:p-2 shadow-2xl">
                  <div className="bg-white rounded-[1.3rem] lg:rounded-[2.3rem] p-6 sm:p-10 lg:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-8 mb-8 lg:mb-10 text-center md:text-left">
                      <div className="h-16 w-16 lg:h-20 lg:w-20 bg-emerald-100 rounded-2xl lg:rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-inner">
                        <CheckCircle2 className="h-8 w-8 lg:h-10 lg:w-10 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 lg:mb-2">
                          Your Analysis is Complete!
                        </h2>
                        <p className="text-lg lg:text-xl text-slate-500 font-medium">
                          Your personalized questions are ready for you.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 border border-slate-200 mb-8 lg:mb-10">
                      <h3 className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
                        <span className="w-4 lg:w-8 h-0.5 bg-slate-300"></span>
                        Your Question Preview
                      </h3>
                      <div className="space-y-4 lg:space-y-5">
                        {questions
                          .split("\n")
                          .slice(0, 3)
                          .map((q, i) => (
                            <div key={i} className="flex gap-4 lg:gap-5 items-start">
                              <span className="flex-shrink-0 h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs lg:text-sm mt-0.5 lg:mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-slate-800 font-medium text-base lg:text-lg leading-relaxed">
                                {q.replace(/^\d+\.\s*/, "")}
                              </p>
                            </div>
                          ))}
                        {questions.split("\n").length > 3 && (
                          <div className="pl-10 lg:pl-14 pt-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-slate-200/50 text-slate-500 text-xs lg:text-sm font-bold">
                              + more questions
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate("/interview-flow")}
                        className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-5 bg-[#1d2f62] text-white rounded-2xl lg:rounded-2xl font-bold text-lg lg:text-xl hover:bg-[#1d2f62]/90 transition-all duration-300 shadow-xl lg:shadow-2xl hover:shadow-[#1d2f62]/40 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 lg:gap-4 group"
                      >
                        <div className="h-8 w-8 lg:h-9 lg:w-9 bg-white/10 rounded-lg lg:rounded-xl flex items-center justify-center">
                          <Play className="h-4 w-4 lg:h-5 lg:w-5 fill-current" />
                        </div>
                        <span>Start Your Interview</span>
                        <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-2 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <PricingModal 
          isOpen={showPricingModal} 
          onClose={handleModalClose}
          onSuccess={handlePaymentSuccess}
          userEmail={user?.email}
          userName={user?.displayName || "User"}
        />
      </div>
    </PageLayout>
  );
};

const StepItem = ({ icon: Icon, step, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
      <Icon className="h-5 w-5 text-blue-200" />
    </div>
    <div>
      <h4 className="text-base font-bold text-white mb-0.5">{title}</h4>
      <p className="text-blue-100 text-xs leading-relaxed opacity-90">{description}</p>
    </div>
  </div>
);

export default ResumeUpload;
