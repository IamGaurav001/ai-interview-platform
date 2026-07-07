import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/userAPI";
import { getActiveSession } from "../api/interviewAPI";
import PricingModal from "../components/features/monetization/PricingModal";
import axiosInstance from "../api/axiosInstance";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  ArrowRight,
  Zap,
  Shield,
  Target,
  PlayCircle,
  ExternalLink,
  Trash2,
  Lock,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/layout/PageLayout";
import { logEvent } from "../config/amplitude";
import SEO from "../components/layout/SEO";

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pastResumes, setPastResumes] = useState([]);

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
      if (res.data.user?.resumes && Array.isArray(res.data.user.resumes)) {
        const sorted = [...res.data.user.resumes].sort((a, b) => 
          new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );
        setPastResumes(sorted);
      } else if (res.data.user?.resume) {
        setPastResumes([res.data.user.resume]);
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
    setUploadProgress(0);
    
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
        
        if (progressInterval.current) clearInterval(progressInterval.current);
        setUploadProgress(100);
        
        setTimeout(() => {
          setError("");
          navigate("/interview-flow");
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

  const handleUseExisting = async (resumeId = null) => {
    if (activeSession) return;
    
    setLoading(true);
    setError("");
    setUploadProgress(20);

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
        setUploadProgress((prev) => {
            if (prev >= 90) return 90;
            return prev + 5;
        });
    }, 200);

    try {
        const payload = resumeId ? { resumeId } : {};
        const res = await axiosInstance.post("/resume/existing", payload);
        
        let questionsData = null;
        if (res.data) {
            if (Array.isArray(res.data.questions)) {
                questionsData = res.data.questions;
            } else if (res.data.data && Array.isArray(res.data.data.questions)) {
                questionsData = res.data.data.questions;
            }
        }

        if (questionsData && questionsData.length > 0) {
            logEvent('Resume Reuse', { success: true });
            
            setUploadProgress(100);
            clearInterval(progressInterval.current);
            
            setTimeout(() => {
                setError("");
                navigate("/interview-flow");
            }, 500);
        } else {
            throw new Error("No questions generated.");
        }
    } catch (err) {
        clearInterval(progressInterval.current);
        console.error("Existing resume error:", err);
        setError(
            err.response?.data?.message || 
            err.response?.data?.error || 
            "Failed to usage existing resume. Please upload a new one."
        );
        logEvent('Resume Reuse', { success: false, error: err.message });
        setUploadProgress(0);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId, e) => {
    e.stopPropagation();
    // if (!window.confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(resumeId);
    try {
      await axiosInstance.delete(`/resume/${resumeId}`);
      setPastResumes((prev) => prev.filter((r) => r._id !== resumeId));
      logEvent('Resume Deleted', { resumeId });
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setError("Failed to delete resume. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };



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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <motion.div
          className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Start Your AI Interview
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
              Upload your resume to instantly generate tailored interview questions.
            </p>
          </motion.div>

          <motion.div 
            className="flex items-center justify-between max-w-md mx-auto mb-10 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm animate-fade-in"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1d2f62] text-white text-[10px] font-bold shadow-sm">1</span>
              <span className="text-xs font-bold text-slate-800">Upload</span>
            </div>
            <div className="h-px flex-1 bg-slate-200 mx-3" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-bold">2</span>
              <span className="text-xs font-bold text-slate-400">Customize</span>
            </div>
            <div className="h-px flex-1 bg-slate-200 mx-3" />
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-50 border border-slate-200 text-slate-4 text-[10px] font-bold">3</span>
              <span className="text-xs font-bold text-slate-400">Practice</span>
            </div>
          </motion.div>

          {activeSession && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-700">
                  <PlayCircle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-850">Interview in Progress</h3>
                  <p className="text-xs text-amber-750 font-medium mt-0.5">
                    You have an active session (Question {activeSession.questionCount}).
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/interview-flow")}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Play className="h-3 w-3 fill-current" />
                Resume Session
              </button>
            </motion.div>
          )}

          {user?.resumeUrl && !file && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-750 truncate">Current Resume</p>
                  <a 
                    href={user.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-semibold"
                  >
                    View PDF <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium hidden sm:block">
                Upload new file below to replace
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-out ${
                  loading ? "animate-gradient-x shadow-[0_0_10px_rgba(59,130,246,0.3)]" : ""
                }`}
                style={{ 
                  width: loading ? `${Math.max(uploadProgress, 5)}%` : "0%" 
                }}
              />
              
              <div className="p-6 sm:p-8">
                <form onSubmit={handleUpload} className="space-y-6" noValidate>
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-bold text-slate-800">
                      Upload Resume
                    </label>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-150 text-slate-500 rounded-md">
                      PDF Only
                    </span>
                  </div>

                  <div
                    className={`relative group flex flex-col items-center justify-center w-full min-h-[200px] p-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                      activeSession
                        ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                        : isDragging
                        ? "border-[#1d2f62] bg-[#1d2f62]/5 scale-[1.01]"
                        : file
                        ? "border-emerald-250 bg-emerald-50/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-[#1d2f62]/2 hover:border-[#1d2f62]/40 hover:shadow-lg hover:shadow-[#1d2f62]/3 cursor-pointer"
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
                    <AnimatePresence mode="wait">
                      {file ? (
                        <motion.div
                          key="file-selected"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="flex flex-col items-center text-center relative z-10"
                        >
                          <div className="h-14 w-14 bg-emerald-50/80 border border-emerald-100/60 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                            <FileText className="h-6 w-6" />
                          </div>
                          <h3 className="text-base font-bold text-slate-800 mb-1 max-w-xs sm:max-w-md break-all px-2">
                            {file.name}
                          </h3>
                          <p className="text-xs text-slate-400 mb-4 font-semibold">
                            {(file.size / 1024).toFixed(1)} KB
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upload-prompt"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex flex-col items-center text-center relative z-10 py-4"
                        >
                          <div className="h-14 w-14 bg-[#1d2f62]/5 border border-[#1d2f62]/10 rounded-2xl flex items-center justify-center mb-4 text-[#1d2f62] shadow-sm relative overflow-hidden transition-all duration-305 group-hover:-translate-y-1 group-hover:scale-105 group-hover:bg-[#1d2f62]/10 group-hover:border-[#1d2f62]/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent)]" />
                            <Upload className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:animate-bounce" style={{ animationDuration: '2.5s' }} />
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-1">
                            {activeSession ? "Upload disabled during active session" : "Drag & drop resume, or click to browse"}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">
                            PDF format only (Max 5MB)
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      id="file-upload"
                      type="file"
                      accept="application/pdf"
                      aria-label="Upload Resume PDF"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={!!activeSession}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="bg-red-50 border border-red-150 text-red-800 px-4 py-3.5 rounded-xl flex items-center gap-3 shadow-sm"
                      >
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-xs sm:text-sm">{error}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setError("")}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !file || !!activeSession}
                      className={`relative w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group ${
                        loading
                          ? "bg-[#1d2f62] text-white shadow-none"
                          : !file || activeSession
                          ? "bg-slate-50 border border-slate-150 text-slate-400 cursor-not-allowed"
                          : "bg-[#1d2f62] text-white shadow-md hover:bg-[#1d2f62]/95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>
                            {uploadProgress > 0
                              ? `Analyzing... ${Math.round(uploadProgress)}%`
                              : "Processing..."}
                          </span>
                        </>
                      ) : activeSession ? (
                        <>
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span>Interview in Progress</span>
                        </>
                      ) : !file ? (
                        <>
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span>Upload Resume to Continue</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 animate-pulse text-indigo-200 fill-indigo-200/20" />
                          <span>Generate Tailored Interview</span>
                        </>
                      )}
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                       <Shield className="h-3.5 w-3.5" />
                       <span>Your resume is encrypted and never shared.</span>
                    </div>
                  </div>
                </form>

                {pastResumes.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                     <h3 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-2">
                       <FileText className="h-4 w-4 text-indigo-500" />
                       Or continue with a recent upload
                     </h3>
                      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                        {pastResumes.map((resume, idx) => (
                          <div 
                            key={resume._id || idx}
                            className="group p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-[#1d2f62] group-hover:border-[#1d2f62]/20 transition-all shadow-sm">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">
                                  {resume.fileName || `Resume ${idx + 1}`}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                                  </span>
                                  <span className="text-[10px] text-slate-300">•</span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Ready
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 sm:self-center self-end flex-shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResume(resume._id, e);
                                }}
                                disabled={deletingId === resume._id}
                                className={`h-8 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-semibold border ${
                                  deletingId === resume._id 
                                    ? "bg-red-50 border-red-100 text-red-500" 
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-150 shadow-sm"
                                }`}
                                title="Delete Resume"
                              >
                                {deletingId === resume._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                <span>Delete</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleUseExisting(resume._id)}
                                className="h-8 px-3.5 rounded-xl bg-[#1d2f62] hover:bg-[#1d2f62]/90 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <span>Use Resume</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>


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

export default ResumeUpload;
