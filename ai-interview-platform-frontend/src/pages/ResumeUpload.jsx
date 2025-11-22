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
  Play,
  Sparkles,
  X,
  ArrowRight,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target?.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
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
            setUploadProgress(percentCompleted);
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
            .filter((q) => q.length > 10);
        } else if (res.data.data && Array.isArray(res.data.data.questions)) {
          questionsData = res.data.data.questions;
        }
      }

      if (
        questionsData &&
        Array.isArray(questionsData) &&
        questionsData.length > 0
      ) {
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
            questionsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 500);
      } else {
        setError(
          "No questions were generated. Please try again or check if the backend is properly configured."
        );
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      if (err.networkError || !err.response) {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
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
      setLoading(false);
    }
  };

  // Animation Variants
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
      <div className="max-w-4xl mx-auto py-12">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            AI Resume Analysis
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Upload your resume to unlock personalized interview questions tailored
            specifically to your experience.
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
          variants={itemVariants}
        >
          <div className="p-8 sm:p-10">
            <form onSubmit={handleUpload} className="space-y-8" noValidate>
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4 ml-1">
                  Upload Resume (PDF)
                </label>

                <div
                  className={`relative group flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                      : file
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const droppedFile = e.dataTransfer.files[0];
                    validateAndSetFile(droppedFile);
                  }}
                  onClick={() => !file && document.getElementById("file-upload")?.click()}
                >
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-indigo-600" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900 mb-1">
                          {file.name}
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Remove File
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload-prompt"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-8 w-8 text-indigo-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-700 mb-2">
                          <span className="text-indigo-600 font-bold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-slate-400">
                          PDF files only (Max 5MB)
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
                  />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{error}</p>
                    </div>
                    <button
                      onClick={() => setError("")}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className={`relative w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                    loading || !file
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>
                        {uploadProgress > 0
                          ? `Analyzing... ${uploadProgress}%`
                          : "Processing..."}
                      </span>
                      {/* Progress Bar Background */}
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      <span>Generate Interview Questions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {success && questions && (
            <motion.div
              id="questions-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="mt-12"
            >
              <div className="bg-emerald-600 rounded-3xl p-1 shadow-xl">
                <div className="bg-white rounded-[22px] p-8 sm:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Analysis Complete!
                      </h2>
                      <p className="text-slate-500">
                        Your personalized questions are ready.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Preview Questions
                    </h3>
                    <div className="space-y-3">
                      {questions
                        .split("\n")
                        .slice(0, 3)
                        .map((q, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="font-mono text-indigo-500 font-bold">
                              {i + 1}.
                            </span>
                            <p className="text-slate-700 font-medium line-clamp-2">
                              {q.replace(/^\d+\.\s*/, "")}
                            </p>
                          </div>
                        ))}
                      {questions.split("\n").length > 3 && (
                        <p className="text-sm text-slate-400 italic pl-8 pt-2">
                          ...and more tailored questions.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate("/interview-flow")}
                      className="flex-1 py-4 px-8 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      Start Full Interview
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works Section */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          <StepCard
            icon={Upload}
            step="1"
            title="Upload Resume"
            description="Upload your PDF resume. We securely process it to understand your profile."
          />
          <StepCard
            icon={Zap}
            step="2"
            title="AI Analysis"
            description="Our AI identifies your key skills, projects, and experiences instantly."
          />
          <StepCard
            icon={Target}
            step="3"
            title="Practice"
            description="Get challenged with questions that real interviewers would ask you."
          />
        </motion.div>
      </motion.div>
      </div>
    </PageLayout>
  );
};

const StepCard = ({ icon: Icon, step, title, description }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow"
  >
    <div className="absolute -right-4 -top-4 text-9xl font-bold text-slate-50 opacity-50 group-hover:text-indigo-50 transition-colors select-none">
      {step}
    </div>
    <div className="relative z-10">
      <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default ResumeUpload;

