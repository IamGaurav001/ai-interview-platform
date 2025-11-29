import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview, nextInterviewStep, endInterview, getActiveSession, evaluateVoiceAnswer, cancelInterview, resetInterview } from "../api/interviewAPI";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trophy,
  FileText,
  Volume2,
  Play,
  Pause,
  Mic,
  Square,
  StopCircle,
  Bot,
  User,
  LogOut,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Clock,
  MicOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "../components/AudioVisualizer";
import ConfirmModal from "../components/ConfirmModal";
import SpeakingAvatar from "../components/SpeakingAvatar";
import PageLayout from "../components/PageLayout";
import InterviewTour from "../components/InterviewTour";
import QuestionCard from "../components/QuestionCard";
import AnswerArea from "../components/AnswerArea";
import logo from "../assets/prephire-icon-circle.png";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const InterviewFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true); // Start with loading true to prevent empty flash
  const { error: toastError, success: toastSuccess } = useToast();
  const [questionCount, setQuestionCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs for auto-scrolling
  const answerAreaRef = useRef(null);
  const feedbackRef = useRef(null);

  const [showEndModal, setShowEndModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [startTour, setStartTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenFlowTour');
    console.log('InterviewFlow: hasSeenTour:', hasSeenTour, 'loading:', loading);
    if (!hasSeenTour && !loading) {
      console.log('InterviewFlow: Setting startTour to true');
      setStartTour(true);
    }
  }, [loading]);

  const handleTourFinish = () => {
    localStorage.setItem('hasSeenFlowTour', 'true');
    setStartTour(false);
  };


  useEffect(() => {
    checkActiveSession();
  }, []);


  useEffect(() => {
    return () => {

      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }

      window.speechSynthesis.cancel();
    };
  }, [mediaRecorder, isRecording]);


  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const checkActiveSession = async () => {
    try {
      // Keep loading true while checking
      const res = await getActiveSession();
      if (res.data.hasActiveSession) {
        setCurrentQuestion(res.data.currentQuestion);
        setQuestionCount(res.data.questionCount);
        setConversationHistory(res.data.history || []);
        setLoading(false); // Only stop loading if we found a session
      } else {
        startNewInterview();
      }
    } catch (err) {
      console.error("Error checking active session:", err);
      startNewInterview();
    }
  };

  const isStartingRef = useRef(false);

  const startNewInterview = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    
    // loading is already true from initialization or checkActiveSession
    try {
      const res = await startInterview();
      if (res.data.success) {
        setCurrentQuestion(res.data.question);
        setQuestionCount(1);
        setConversationHistory([
          { role: "interviewer", text: res.data.question, timestamp: new Date().toISOString() }
        ]);

      } else {
        toastError(res.data.message || "Failed to start interview");
      }
    } catch (err) {
      console.error("Start interview error:", err);
      if (err.response?.status === 400) {
        toastError("Please upload your resume first before starting an interview.");
        setTimeout(() => navigate("/upload-resume"), 2000);
      } else if (err.response?.status === 429 || err.response?.status === 503) {
        toastError(err.response?.data?.message || "AI service is busy. Please wait a moment and try again.");
      } else if (err.response?.status === 403 && err.response?.data?.code === "NO_CREDITS") {
        // Handle race condition: Check if session was created by another request
        // Poll for up to 5 seconds to allow AI generation to complete
        console.log("⚠️ 403 No Credits. Polling for active session...");
        let attempts = 0;
        let recovered = false;
        
        while (attempts < 5) {
            try {
                await new Promise(r => setTimeout(r, 1000)); // Wait 1s
                const sessionRes = await getActiveSession();
                if (sessionRes.data.hasActiveSession) {
                    console.log("✅ Recovered from race condition: Session exists");
                    setCurrentQuestion(sessionRes.data.currentQuestion);
                    setQuestionCount(sessionRes.data.questionCount);
                    setConversationHistory(sessionRes.data.history || []);
                    recovered = true;
                    break;
                }
            } catch (sessionErr) {
                console.error("Failed to recover session:", sessionErr);
            }
            attempts++;
        }
        
        if (!recovered) {
            toastError(err.response?.data?.message || "No interview credits left. Please purchase more.");
        }
      } else {
        toastError(err.response?.data?.message || err.message || "Failed to start interview");
      }
    } finally {
      setLoading(false);
      isStartingRef.current = false;
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || currentAnswer.trim().length < 10) {
      toastError("Please provide a detailed answer (at least 10 characters)");
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const res = await nextInterviewStep(currentAnswer.trim());
      
      if (res.data.success) {

        const updatedHistory = [
          ...conversationHistory,
          { role: "user", text: currentAnswer.trim(), timestamp: new Date().toISOString() }
        ];

        setConversationHistory(updatedHistory);


        if (res.data.feedback) {
          setFeedback(res.data.feedback);

        }

        if (res.data.isComplete) {

          const finalCount = res.data.questionCount ?? questionCount;
          setQuestionCount(finalCount);
          setIsComplete(true);
          handleEndInterview(true);
        } else if (res.data.question) {

          const finalHistory = [
            ...updatedHistory,
            { role: "interviewer", text: res.data.question, timestamp: new Date().toISOString() }
          ];
          setConversationHistory(finalHistory);
          setCurrentQuestion(res.data.question);
          setQuestionCount(res.data.questionCount || questionCount + 1);
          setCurrentAnswer("");
          setRecordedAudio(null);
          setTranscribedText("");
        }
      } else {
        toastError(res.data.message || "Failed to process answer");
      }
    } catch (err) {
      console.error("Next step error:", err);
      if (err.response?.status === 429 || err.response?.status === 503) {
        toastError(err.response?.data?.message || "AI service is busy. Please wait a moment and try again.");
      } else {
        toastError(err.response?.data?.message || err.message || "Failed to process answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const playBrowserTTS = (text, type = "question") => {

    if (!("speechSynthesis" in window)) {
      console.warn("Browser TTS not supported");
      return;
    }


    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;


    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang.includes("en") &&
        (voice.name.includes("Samantha") ||
          voice.name.includes("Karen") ||
          voice.name.includes("Victoria") ||
          voice.voiceURI.includes("Neural"))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (type === "question") {
      setIsPlayingQuestion(true);
    } else {
      setIsPlayingFeedback(true);
    }

    utterance.onend = () => {
      if (type === "question") {
        setIsPlayingQuestion(false);
      } else {
        setIsPlayingFeedback(false);
      }
    };

    utterance.onerror = () => {
      console.error("Browser TTS error");
      if (type === "question") {
        setIsPlayingQuestion(false);
      } else {
        setIsPlayingFeedback(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopBrowserTTS = (type = "question") => {

    window.speechSynthesis.cancel();
    if (type === "question") {
      setIsPlayingQuestion(false);
    } else {
      setIsPlayingFeedback(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedAudio(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedAudio(null);
      setTranscribedText("");
      
      // Auto-scroll to answer area when recording starts
      setTimeout(() => {
        answerAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error("Error starting recording:", err);
      toastError("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitVoiceAnswer = async () => {
    if (!recordedAudio) {
      toastError("Please record an answer first");
      return;
    }

    setLoading(true);
    setTranscribedText("");

    try {
      const formData = new FormData();
      formData.append("audio", recordedAudio, "answer.webm");
      formData.append("domain", "Resume-Based");
      formData.append("question", currentQuestion);

      const res = await evaluateVoiceAnswer(formData);

      if (res.data && res.data.success) {
        const transcribed = res.data.transcribedText || "";
        setTranscribedText(transcribed);
        setCurrentAnswer(transcribed);


        setRecordedAudio(null);


        try {
          const nextRes = await nextInterviewStep(transcribed.trim());
          
          if (nextRes.data.success) {

            const updatedHistory = [
              ...conversationHistory,
              { role: "user", text: transcribed.trim(), timestamp: new Date().toISOString() }
            ];

            setConversationHistory(updatedHistory);


            if (nextRes.data.feedback) {
              setFeedback(nextRes.data.feedback);
              
              // Auto-scroll to feedback after submission
              setTimeout(() => {
                feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 300);
            }

            if (nextRes.data.isComplete) {

              const finalCount = nextRes.data.questionCount ?? questionCount;
              setQuestionCount(finalCount);
              setIsComplete(true);
              handleEndInterview(true);
            } else if (nextRes.data.question) {

              const finalHistory = [
                ...updatedHistory,
                { role: "interviewer", text: nextRes.data.question, timestamp: new Date().toISOString() }
              ];
              setConversationHistory(finalHistory);
              setCurrentQuestion(nextRes.data.question);
              setQuestionCount(nextRes.data.questionCount || questionCount + 1);
              setCurrentAnswer("");
              setTranscribedText("");
            }
          } else {
            toastError(nextRes.data.message || "Failed to process answer");
          }
        } catch (nextErr) {
          console.error("Next step error after voice answer:", nextErr);

          if (res.data.feedback) {
            setFeedback(res.data.feedback.overall_feedback || res.data.feedback);
          }
          toastError("Voice transcribed successfully, but failed to continue interview. Please try submitting again.");
        }
      } else {
        toastError(res.data?.error || "Invalid response from server");
      }
    } catch (err) {
      console.error("Evaluate voice error:", err);
      if (err.networkError) {
        toastError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        toastError(err.response?.data?.error || err.message || "Failed to evaluate voice answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async (skipConfirm = false) => {

    if (!skipConfirm) {
      setShowEndModal(true);
      return;
    }


    setSaving(true);
    setIsComplete(true);

    
    try {
      const res = await endInterview();
      if (res.data.success) {
        setSummary(res.data.summary);
      } else {
        toastError("Failed to complete interview");
        setIsComplete(false);
      }
    } catch (err) {
      console.error("End interview error:", err);
      toastError(err.response?.data?.message || "Failed to complete interview");
      setIsComplete(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmEndInterview = () => {
    handleEndInterview(true);
  };

  const handleResetInterview = async () => {
    try {
      setLoading(true);
      const res = await resetInterview();
      if (res.data && res.data.success) {

        setCurrentQuestion(res.data.question);
        setQuestionCount(res.data.questionCount);
        setConversationHistory(res.data.history || []);
        setCurrentAnswer("");
        setFeedback("");
        setTranscribedText("");
        setRecordedAudio(null);
        setIsComplete(false);
        setSummary(null);
        

        
        toastSuccess("Interview reset successfully");
      } else {
        toastError(res.data.error || "Failed to reset interview");
      }
    } catch (err) {
      console.error("Reset error:", err);
      if (err.response?.status === 403 && err.response?.data?.error?.includes("Reset limit reached")) {
        setShowLimitModal(true);
      } else {
        toastError(err.response?.data?.error || "Failed to reset interview");
      }
    } finally {
      setLoading(false);
      setShowResetModal(false);
    }
  };

  const handleExitInterview = async () => {
    try {
      await cancelInterview();
      console.log("✅ Interview session cancelled");
    } catch (err) {
      console.error("❌ Error cancelling interview:", err);
      toastError("Failed to cancel interview");
    } finally {
      navigate("/dashboard");
    }
  };

  if (saving) {
    return (
      <PageLayout showNavbar={false}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md mx-auto p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <img src={logo} alt="Prephire" className="h-16 w-16 object-contain animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Finalizing Interview</h2>
            <p className="text-slate-500 text-lg font-medium">
              Generating your comprehensive performance report...
            </p>
            
            <div className="mt-8 flex gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (loading && !currentQuestion) {
    return (
      <PageLayout showNavbar={false}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md mx-auto p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <img src={logo} alt="Loading..." className="h-16 w-16 object-contain animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Starting Interview</h2>
            <p className="text-slate-500 text-lg font-medium">
              Our AI is preparing your personalized session...
            </p>
            
            <div className="mt-8 flex gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (isComplete && summary) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center mb-8">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Interview Complete! 🎉</h1>
            <p className="text-lg text-slate-600 mb-8">
              You answered {questionCount} questions. Here's your comprehensive evaluation:
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              Overall Score: <span className="text-blue-600">{summary.overallScore}/10</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Strengths
                </h3>
                <ul className="space-y-3">
                  {summary.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-green-800">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {summary.weaknesses?.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-blue-800">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Executive Summary</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{summary.summary}</p>
            </div>

            {summary.recommendations && summary.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Recommendations</h3>
                <ul className="space-y-3">
                  {summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-blue-800">
                      <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/history")}
              className="px-8 py-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FileText className="h-5 w-5" />
              View History
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showNavbar={false}>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-slate-500 font-medium text-xs sm:text-sm">{user?.displayName || 'User'}</h1>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-blue-600 font-semibold text-[10px] sm:text-xs bg-blue-50 px-2 py-0.5 sm:py-1 rounded-full border border-blue-100">
              Q {questionCount} / ~25
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setStartTour(true)}
              className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-[10px] sm:text-xs font-medium"
              title="Start Tour"
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Tour</span>
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-[10px] sm:text-xs font-medium"
              title="Reset Interview"
              data-tour="reset-interview"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <div className="h-3 w-px bg-slate-300"></div>
            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1 sm:py-2 bg-red-500 text-white hover:bg-red-600 rounded-md sm:rounded-lg transition-all shadow-sm hover:shadow-md font-semibold text-[10px] sm:text-xs"
              title="Exit without completing"
              data-tour="exit-interview"
            >
              <LogOut className="h-3 w-3" />
              <span>Exit</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-[calc(100vh-120px)]">
          {/* Left Column - AI Interviewer */}
          <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 sm:mb-6 lg:mb-8 relative">
                <SpeakingAvatar 
                  isSpeaking={isPlayingQuestion || isPlayingFeedback} 
                  size="large" 
                />
                {(isPlayingQuestion || isPlayingFeedback) && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">PrepHire</h2>
              
              <div className="flex items-center gap-2 mb-4 sm:mb-6 lg:mb-8">
                <div className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                  loading 
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : isRecording
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : (isPlayingQuestion || isPlayingFeedback)
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : isRecording ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      Listening...
                    </>
                  ) : (isPlayingQuestion || isPlayingFeedback) ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      Speaking...
                    </>
                  ) : (
                    "Waiting"
                  )}
                </div>
              </div>

              <div className="h-16 flex items-center justify-center w-full max-w-[200px] mb-6">
                {(isPlayingQuestion || isPlayingFeedback || isRecording) ? (
                  <AudioVisualizer 
                    isPlaying={isPlayingQuestion || isPlayingFeedback}
                    isRecording={isRecording}
                    mode={isRecording ? "speaking" : "listening"}
                  />
                ) : (
                  <div className="flex gap-1">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                     ))}
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Section */}
            {feedback && (
              <motion.div 
                ref={feedbackRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 mt-auto pt-6 border-t border-slate-100"
              >
                <div className="relative">
                  <div 
                    className="max-h-[200px] overflow-y-auto pr-2 touch-pan-y"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#86efac #f0fdf4',
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Feedback</h3>
                          <button
                            onClick={() => {
                              if (isPlayingFeedback) {
                                stopBrowserTTS("feedback");
                              } else {
                                playBrowserTTS(feedback, "feedback");
                              }
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs transition-colors flex-shrink-0"
                            title={isPlayingFeedback ? "Stop audio" : "Listen to feedback"}
                          >
                            {isPlayingFeedback ? (
                              <>
                                <Pause className="h-3 w-3" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3" />
                                Listen
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-emerald-800 leading-relaxed break-words whitespace-pre-wrap">{feedback}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scroll indicator - gradient fade */}
                  {feedback.length > 150 && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <span className="text-[10px] text-emerald-600 font-semibold mb-1">Scroll for more</span>
                        <ChevronDown className="h-3 w-3 text-emerald-600 animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Interaction Area */}
          <div className="lg:col-span-9 flex flex-col gap-6 h-full overflow-hidden">
             <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Question Card */}
                <QuestionCard
                  question={currentQuestion}
                  isPlaying={isPlayingQuestion}
                  onPlayToggle={() => {
                    if (isPlayingQuestion) {
                      stopBrowserTTS("question");
                    } else {
                      playBrowserTTS(currentQuestion, "question");
                    }
                  }}
                />

                {/* Answer Area */}
                <div ref={answerAreaRef}>
                  <AnswerArea
                    isRecording={isRecording}
                    recordedAudio={recordedAudio}
                    currentAnswer={currentAnswer}
                    loading={loading}
                    isPlayingQuestion={isPlayingQuestion}
                    isPlayingFeedback={isPlayingFeedback}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    onClearRecording={() => setRecordedAudio(null)}
                    onSubmitVoice={handleSubmitVoiceAnswer}
                    onAnswerChange={setCurrentAnswer}
                    onSubmitText={handleSubmitAnswer}
                  />
                </div>
             </div>
             
             {/* End Interview Button */}
             <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleEndInterview()}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                  data-tour="end-interview"
                >
                  <StopCircle className="h-4 w-4" />
                  End Interview
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={confirmEndInterview}
        title="End Interview?"
        message={`Are you sure you want to end the interview? You've answered ${questionCount} questions. This action cannot be undone.`}
        confirmText="End Interview"
        cancelText="Continue Interview"
        type="warning"
        stats={{
          "Questions Answered": questionCount,
          "Status": "In Progress"
        }}
      />

      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitInterview}
        title="Exit Interview?"
        message={
          questionCount > 5 
            ? "⚠️ WARNING: You have already answered 5 questions. If you exit now, you will LOSE your interview credit. Are you sure?" 
            : "Are you sure you want to exit? Since you haven't answered any questions yet, your credit will be REFUNDED."
        }
        confirmText="Exit without Saving"
        cancelText="Continue Interview"
        type="warning"
      />
      
      {showResetModal && (
        <ConfirmModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetInterview}
          title="Reset Interview?"
          message="Are you sure you want to reset? This is a ONE-TIME option. You will lose all current progress and start fresh. You cannot undo this."
          confirmText="Yes, Reset Interview"
          cancelText="Cancel"
          isDestructive={true}
        />
      )}
      
      {showLimitModal && (
        <ConfirmModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onConfirm={() => setShowLimitModal(false)}
          title="Reset Limit Reached"
          message="You have already used your one-time reset for this interview. You cannot reset again."
          confirmText="Okay"
          cancelText="Cancel"
          isDestructive={false}
        />
      )}
      
      <InterviewTour start={startTour} onFinish={handleTourFinish} type="flow" />
    </PageLayout>
  );
};

export default InterviewFlow;