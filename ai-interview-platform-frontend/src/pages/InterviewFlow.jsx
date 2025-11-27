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
import logo from "../assets/prephire-icon-circle.png";
import { useToast } from "../context/ToastContext";

const InterviewFlow = () => {
  const navigate = useNavigate();
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
  

  const [showEndModal, setShowEndModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTips, setShowTips] = useState(false);


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
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <img src={logo} alt="Prephire" className="h-16 w-16 object-contain animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Finalizing Interview</h2>
            <p className="text-slate-500 text-lg font-medium">
              Generating your comprehensive performance report...
            </p>
            
            <div className="mt-8 flex gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Starting Interview</h2>
            <p className="text-slate-500 text-lg font-medium">
              Our AI is preparing your personalized session...
            </p>
            
            <div className="mt-8 flex gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
              Overall Score: <span className="text-indigo-600">{summary.overallScore}/10</span>
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
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {summary.weaknesses?.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-indigo-800">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
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
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">Key Recommendations</h3>
                <ul className="space-y-3">
                  {summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-indigo-800">
                      <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-500" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="hidden sm:block text-lg font-bold text-slate-900 tracking-tight">AI Interview Session</h1>
              <span className="text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full whitespace-nowrap border border-indigo-100">
                Q {questionCount} <span className="text-indigo-300 mx-1">/</span> ~25
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowResetModal(true)}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={() => setShowExitModal(true)}
                className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
              <button
                onClick={() => handleEndInterview()}
                className="text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                <StopCircle className="h-4 w-4" />
                End <span className="hidden sm:inline">Interview</span>
              </button>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((questionCount / 25) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:h-[calc(100vh-180px)] h-auto min-h-[calc(100vh-180px)]">
          

          <AnimatePresence mode="wait">
            <motion.div
              key={questionCount}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col"
            >

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="flex-shrink-0 relative">
                    <SpeakingAvatar isSpeaking={isPlayingQuestion || isPlayingFeedback} size="large" />
                    {(isPlayingQuestion || isPlayingFeedback) && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-indigo-700 w-4 h-4 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">AI Interviewer</h2>
                    <p className="text-indigo-100 text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Evaluating your responses in real-time
                    </p>
                  </div>
                </div>
              </div>


              <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                      Current Question
                    </span>
                    <button
                      onClick={() => {
                        if (isPlayingQuestion) {
                          stopBrowserTTS("question");
                        } else {
                          playBrowserTTS(currentQuestion, "question");
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                        isPlayingQuestion 
                          ? "bg-indigo-100 text-indigo-700" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isPlayingQuestion ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4" />
                          Listen
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-lg sm:text-2xl text-slate-900 leading-relaxed font-medium mb-4">
                    {currentQuestion}
                  </p>


                  <div className="h-12 flex items-center justify-center bg-slate-50 rounded-xl">
                    <AudioVisualizer isPlaying={isPlayingQuestion} isRecording={false} mode="speaking" />
                  </div>
                </div>


                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 rounded-xl p-6 border border-emerald-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide mb-2">
                          Feedback on Previous Answer
                        </h3>
                        <p className="text-emerald-900 leading-relaxed">{feedback}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (isPlayingFeedback) {
                            stopBrowserTTS("feedback");
                          } else {
                            playBrowserTTS(feedback, "feedback");
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 font-semibold text-sm transition-colors shadow-sm"
                      >
                        {isPlayingFeedback ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4" />
                            Listen
                          </>
                        )}
                      </button>
                      <div className="flex-1 h-8">
                        <AudioVisualizer isPlaying={isPlayingFeedback} isRecording={false} mode="speaking" />
                      </div>
                    </div>
                  </motion.div>
                )}


                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button 
                    onClick={() => setShowTips(!showTips)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Interview Tips</h4>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showTips ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showTips && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5">
                          <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>Be specific and provide concrete examples</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>Structure your answer clearly (situation, action, result)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>Take your time to think before answering</span>
                            </li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>


          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">

            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <SpeakingAvatar 
                    isSpeaking={isRecording} 
                    size="large" 
                    Icon={User}
                    color="blue"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Response</h2>
                  <p className="text-slate-300 text-sm">Type or record your answer</p>
                </div>
              </div>
            </div>

            {/* Answer Input Area */}
            <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Error Display - Removed inline error */}
              
              {/* Recording Controls */}
              <div className="flex items-center justify-between bg-slate-50/50 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 mb-4">
                <div className="flex items-center gap-3 px-2">
                  <div className={`h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-slate-300"}`} />
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {isRecording ? "Recording..." : "Input Mode"}
                  </label>
                </div>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || isComplete}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    isRecording
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse"
                      : "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="h-5 w-5" />
                      Stop Recording ({recordingTime}s)
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Record Voice Answer
                    </>
                  )}
                </button>
              </div>

              {/* Audio Visualizer for Recording */}
              {isRecording && (
                <div className="h-16 flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
                  <AudioVisualizer isPlaying={false} isRecording={true} mode="listening" />
                </div>
              )}

              {/* Transcribed Text */}
              <AnimatePresence>
                {transcribedText && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl"
                  >
                    <p className="text-sm text-indigo-900">
                      <span className="font-bold">Transcribed:</span> {transcribedText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recorded Audio Preview */}
              {recordedAudio && !transcribedText && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Volume2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Recorded Answer</span>
                  </div>
                  <audio
                    src={URL.createObjectURL(recordedAudio)}
                    controls
                    className="w-full mb-3"
                  />
                  <button
                    onClick={handleSubmitVoiceAnswer}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-bold transition-colors shadow-md"
                  >
                    {loading ? "Processing..." : "Submit Voice Answer"}
                  </button>
                </motion.div>
              )}

              {/* Text Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your detailed answer here... Be specific and provide examples from your experience."
                  className="relative w-full p-5 sm:p-6 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-0 focus:border-transparent resize-none min-h-[200px] sm:min-h-[300px] text-slate-800 leading-relaxed transition-all shadow-inner text-lg placeholder:text-slate-400"
                  disabled={loading || isComplete || isRecording}
                />
                <div className="absolute bottom-4 right-4 text-xs font-bold text-indigo-600 bg-indigo-50/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-2">
                  <span className={currentAnswer.length < 10 ? "text-red-500" : "text-green-600"}>
                    {currentAnswer.length} chars
                  </span>
                  {currentAnswer.length >= 10 && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                </div>
              </div>

              {/* Error Display */}

            </div>

            {/* Submit Button */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || isComplete || !currentAnswer.trim()}
                className="w-full px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Processing Your Answer...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="h-6 w-6" />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                Press Enter + Shift for new line • Minimum 10 characters required
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* End Interview Confirmation Modal */}
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

      {/* Exit Confirmation Modal */}
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
    </div>
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
    </PageLayout>
  );
};

export default InterviewFlow;