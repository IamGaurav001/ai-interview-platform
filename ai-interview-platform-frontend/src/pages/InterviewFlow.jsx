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
  MicOff,
  Settings,
  X,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "../components/AudioVisualizer";
import ConfirmModal from "../components/ConfirmModal";
import PageLayout from "../components/PageLayout";
import InterviewTour from "../components/InterviewTour";
import QuestionCard from "../components/QuestionCard";
import AnswerArea from "../components/AnswerArea";
import logo from "../assets/prephire-icon-circle.png";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import InterviewSetupModal from "../components/InterviewSetupModal";
import VoiceSettingsModal from "../components/VoiceSettingsModal";

import { logEvent } from "../config/amplitude";
import SEO from "../components/SEO";

const InterviewFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true); 
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
  const [audioStream, setAudioStream] = useState(null);
  
  const answerAreaRef = useRef(null);
  const feedbackRef = useRef(null);

  const [showEndModal, setShowEndModal] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [startTour, setStartTour] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const feedbackContentRef = useRef(null);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [hasReset, setHasReset] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      
      if (englishVoices.length === 0) {
        setVoices([]);
        return;
      }

      let femaleVoice = englishVoices.find(v => v.name === "Google UK English Female");
      let maleVoice = englishVoices.find(v => v.name === "Google UK English Male");

      if (!femaleVoice) {
        femaleVoice = englishVoices.find(v => 
          v.name.includes("Female") || 
          v.name.includes("Samantha") || 
          v.name.includes("Victoria") || 
          v.name.includes("Karen") ||
          v.name.includes("Zira")
        );
      }

      if (!maleVoice) {
        maleVoice = englishVoices.find(v => 
          v.name.includes("Male") || 
          v.name.includes("Daniel") || 
          v.name.includes("Alex") || 
          v.name.includes("David") ||
          v.name.includes("Fred")
        );
      }

      if (!femaleVoice && englishVoices.length > 0) femaleVoice = englishVoices[0];
      if (!maleVoice && englishVoices.length > 1) maleVoice = englishVoices[1];
      
      const simplifiedOptions = [];
      
      if (femaleVoice) {
        simplifiedOptions.push({
          name: "Voice 1 (Female)",
          originalName: femaleVoice.name,
          voice: femaleVoice,
          lang: femaleVoice.lang
        });
      }
      
      if (maleVoice && maleVoice.name !== femaleVoice?.name) {
        simplifiedOptions.push({
          name: "Voice 2 (Male)",
          originalName: maleVoice.name,
          voice: maleVoice,
          lang: maleVoice.lang
        });
      }

      setVoices(simplifiedOptions);
      
      const savedVoiceName = localStorage.getItem('preferredVoice');
      
      if (savedVoiceName) {
        const savedOption = simplifiedOptions.find(opt => opt.originalName === savedVoiceName);
        if (savedOption) {
          setSelectedVoice(savedOption);
          return;
        }
      }

      if (simplifiedOptions.length > 0) {
        setSelectedVoice(simplifiedOptions[0]);
      }
    };

    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleVoiceChange = (voiceOption) => {
    setSelectedVoice(voiceOption);
    localStorage.setItem('preferredVoice', voiceOption.originalName);
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello, I am your AI interviewer.");
    utterance.voice = voiceOption.voice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (feedback && feedbackContentRef.current) {
      const { scrollHeight, clientHeight } = feedbackContentRef.current;
      setShowScrollIndicator(scrollHeight > clientHeight);
    }
  }, [feedback]);

  const handleFeedbackScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isBottom = scrollHeight - scrollTop - clientHeight < 10;
    setShowScrollIndicator(!isBottom);
  };

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
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const checkActiveSession = async () => {
    try {
      // Keep loading true while checking
      const res = await getActiveSession();
      if (res.data.hasActiveSession) {
        setCurrentQuestion(res.data.currentQuestion);
        setQuestionCount(res.data.questionCount);
        setConversationHistory(res.data.history || []);
        if (res.data.hasReset) {
          setHasReset(true);
        }
        setLoading(false);
      } else {
        setShowSetupModal(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error checking active session:", err);
      setShowSetupModal(true);
      setLoading(false);
    }
  };

  const isStartingRef = useRef(false);

  const startNewInterview = async (setupData = {}) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setLoading(true);
    
    try {
      const res = await startInterview(setupData);
      if (res.data.success) {
        setCurrentQuestion(res.data.question);
        setQuestionCount(1);
        setConversationHistory([
          { role: "interviewer", text: res.data.question, timestamp: new Date().toISOString() }
        ]);
        logEvent('Start Interview', { type: 'Flow' });

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



  const handleSubmitAnswer = async (answerText) => {
    const finalAnswer = typeof answerText === 'string' ? answerText : currentAnswer;

    if (!finalAnswer.trim() || finalAnswer.trim().length < 2) {
      toastError("Please provide an answer");
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const res = await nextInterviewStep(finalAnswer.trim());
      
      if (res.data.success) {
        const result = res.data;
        
        const updatedHistory = [
          ...conversationHistory,
          { role: "user", text: finalAnswer.trim(), timestamp: new Date().toISOString() }
        ];
        setConversationHistory(updatedHistory);

        if (result.feedback) {
          setFeedback(result.feedback);
        }

        if (result.isComplete) {
          const finalCount = result.questionCount ?? questionCount;
          setQuestionCount(finalCount);
          setIsComplete(true);
          handleEndInterview(true);
        } else if (result.question) {
          const finalHistory = [
            ...updatedHistory,
            { role: "interviewer", text: result.question, timestamp: new Date().toISOString() }
          ];
          setConversationHistory(finalHistory);
          setCurrentQuestion(result.question);
          setQuestionCount(questionCount + 1);
          setCurrentAnswer("");
          setRecordedAudio(null);
          setTranscribedText("");
        }
        setLoading(false);
      } else {
        toastError(res.data.message || "Failed to process answer");
        setLoading(false);
      }
    } catch (err) {
      console.error("Next step error:", err);
      if (err.response?.status === 429 || err.response?.status === 503) {
        toastError(err.response?.data?.message || "AI service is busy. Please wait a moment and try again.");
      } else {
        toastError(err.response?.data?.message || err.message || "Failed to process answer");
      }
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
    
    if (selectedVoice) {
      utterance.voice = selectedVoice.voice;
    } else {
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
      setAudioStream(stream);
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
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          setRecordedAudio(blob);
          stream.getTracks().forEach((track) => track.stop());
          setAudioStream(null);
        } catch (err) {
          console.error("Error processing recorded audio:", err);
          toastError("Failed to process recording. Please try again.");
          setRecordedAudio(null);
          setIsRecording(false);
          stream.getTracks().forEach((track) => track.stop());
          setAudioStream(null);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedAudio(null);
      setTranscribedText("");
      
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
            const result = nextRes.data;
            
            const updatedHistory = [
              ...conversationHistory,
              { role: "user", text: transcribed.trim(), timestamp: new Date().toISOString() }
            ];
            setConversationHistory(updatedHistory);

            if (result.feedback) {
              setFeedback(result.feedback);
              setTimeout(() => {
                feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 300);
            }

            if (result.isComplete) {
              const finalCount = result.questionCount ?? questionCount;
              setQuestionCount(finalCount);
              setIsComplete(true);
              handleEndInterview(true);
            } else if (result.question) {
              const finalHistory = [
                ...updatedHistory,
                { role: "interviewer", text: result.question, timestamp: new Date().toISOString() }
              ];
              setConversationHistory(finalHistory);
              setCurrentQuestion(result.question);
              setQuestionCount(questionCount + 1);
              setCurrentAnswer("");
              setTranscribedText("");
            }
            setLoading(false);
          } else {
            toastError(nextRes.data.message || "Failed to process answer");
            setLoading(false);
          }
        } catch (nextErr) {
          console.error("Next step error after voice answer:", nextErr);
          toastError("Voice transcribed successfully, but failed to continue interview. Please try submitting again.");
          setLoading(false);
        }
      } else {
        toastError(res.data?.error || "Invalid response from server");
        setLoading(false);
      }
    } catch (err) {
      console.error("Evaluate voice error:", err);
      
      // Handle timeout errors specifically
      if (err.response?.data?.isTimeout) {
        toastError("Voice processing timed out. Please try recording a shorter answer or use text input instead.");
        setLoading(false);
        return;
      }
      
      if (err.networkError) {
        console.error("Cannot connect to server. Please make sure the backend is running.");
        toastError("Cannot connect to server. Please check your internet connection and try again.");
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to evaluate voice answer";
        toastError(errorMsg);
      }
      setLoading(false);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      window.speechSynthesis.resume();
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
      }
    } else {
      setIsPaused(true);
      window.speechSynthesis.pause();
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
      }
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
        if (res.data.isCancelled) {
          toastSuccess(res.data.message || "Interview cancelled. No credits deducted.");
          navigate("/dashboard");
          return;
        }

        setSummary(res.data.summary);
        if (res.data.questionCount !== undefined) {
          setQuestionCount(res.data.questionCount);
        }
        logEvent('Complete Interview', { 
          type: 'Flow', 
          questionCount: res.data.questionCount || questionCount,
          score: res.data.summary.overallScore 
        });
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
        

        
        
        setHasReset(true);
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



  if (saving) {
    return (
      <PageLayout showNavbar={false}>
        <SEO title="Interview Session" description="Live AI interview session in progress." />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md mx-auto p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <img src={logo} alt="Prephire" className="h-32 w-32 object-contain animate-pulse rounded-full" />
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
        <SEO title="Interview Session" description="Live AI interview session in progress." />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md mx-auto p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <img src={logo} alt="Loading..." className="h-32 w-32 object-contain animate-pulse rounded-full" />
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

  if (showSetupModal) {
    return (
      <InterviewSetupModal
        isOpen={showSetupModal}
        onClose={() => navigate("/dashboard")}
        onConfirm={(data) => {
          setShowSetupModal(false);
          startNewInterview(data);
        }}
      />
    );
  }

  if (isComplete && summary) {
    return (
      <PageLayout>
        <SEO title="Interview Complete" description="View your interview summary and feedback." />
        <div className="max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative mb-8">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
            
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-yellow-50 rounded-full mb-6 ring-8 ring-yellow-50/50">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Interview Complete! 🎉</h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                You answered <span className="font-bold text-slate-900">{questionCount} questions</span>. Here's your comprehensive evaluation:
              </p>
            </div>

            <div className="bg-slate-50/50 border-t border-slate-100 p-8 sm:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Section */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-200 text-center h-full flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h2 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-6 relative z-10">Overall Score</h2>
                    <div className="relative mb-6 z-10">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          className="text-slate-100"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * summary.overallScore) / 10}
                          className="text-blue-600 transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-5xl font-bold text-slate-900">{summary.overallScore}</span>
                        <span className="text-sm font-medium text-slate-400">out of 10</span>
                      </div>
                    </div>
                    <div className="flex gap-1 relative z-10">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(summary.overallScore / 2)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-200 fill-slate-200"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-emerald-50/50 rounded-[2rem] p-8 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
                    <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      Key Strengths
                    </h3>
                    <ul className="space-y-4">
                      {summary.strengths?.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-emerald-800 font-medium">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-amber-50/50 rounded-[2rem] p-8 border border-amber-100 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300">
                    <h3 className="text-lg font-bold text-amber-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      Areas for Growth
                    </h3>
                    <ul className="space-y-4">
                      {summary.weaknesses?.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-amber-800 font-medium">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          <span className="leading-relaxed">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="mt-8 bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1d2f62]" />
                <h3 className="text-lg font-bold text-[#1d2f62] mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="h-5 w-5" /> Executive Summary
                </h3>
                <p className="text-slate-700 leading-loose text-lg">{summary.summary}</p>
              </div>

              {/* Recommendations */}
              {summary.recommendations && summary.recommendations.length > 0 && (
                <div className="mt-8 bg-blue-50 rounded-[2rem] p-8 sm:p-10 border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <Target className="h-5 w-5" /> Key Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <div className="mt-1 p-1 bg-blue-100 rounded-full">
                          <ArrowRight className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-blue-900 font-medium">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/history")}
              className="w-full sm:w-auto px-8 py-4 bg-[#1d2f62] text-white rounded-2xl font-bold text-lg hover:bg-[#1d2f62]/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
            >
              <FileText className="h-5 w-5" />
              <span>View Detailed History</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
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
        <header className="max-w-7xl mx-auto mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <h1 className="text-slate-600 font-medium text-base sm:text-lg">{user?.displayName || 'User'}</h1>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-[#1d2f62] font-semibold text-xs sm:text-sm bg-[#1d2f62]/10 px-3 py-1 rounded-full border border-[#1d2f62]/20">
              Q {questionCount} / ~25
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setStartTour(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#1d2f62] hover:bg-[#1d2f62]/10 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              title="Start Tour"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>
            <button
              onClick={() => setShowVoiceSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#1d2f62] hover:bg-[#1d2f62]/10 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              title="Voice Settings"
              data-tour="voice-settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#1d2f62] hover:bg-[#1d2f62]/10 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              title="Reset Interview"
              data-tour="reset-interview"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={togglePause}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#1d2f62] hover:bg-[#1d2f62]/10 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              title="Pause Interview"
              data-tour="pause-interview"
            >
              <Pause className="h-4 w-4" />
              <span className="hidden sm:inline">Pause</span>
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => handleEndInterview()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all shadow-sm hover:shadow-md font-semibold text-xs sm:text-sm"
              title="End Interview"
              data-tour="end-interview"
            >
              <StopCircle className="h-4 w-4" />
              <span>End</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-120px)]">
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col relative overflow-hidden lg:order-first">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 relative">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                  <div className="absolute inset-0 rounded-full bg-[#1d2f62] opacity-20 blur-xl animate-pulse"></div>
                  
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#1d2f62] to-[#2a407a] shadow-xl flex items-center justify-center overflow-visible">
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent z-10 pointer-events-none"></div>
                    
                    {/* Advanced Sound Wave Effect */}
                    {(isPlayingQuestion || isPlayingFeedback || isRecording) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ 
                              opacity: [0, 0.6, 0],
                              scale: [1, 1.4 + (i * 0.3)],
                              borderWidth: ["2px", "1px", "0px"]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              delay: i * 0.4,
                              ease: "easeOut",
                              repeatDelay: 0.5
                            }}
                          />
                        ))}
                        <motion.div
                          className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    )}

                    <motion.svg 
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white relative z-20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      animate={
                        (isPlayingQuestion || isPlayingFeedback) ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, -3, 3, 0],
                          filter: ["drop-shadow(0 0 0px rgba(255,255,255,0))", "drop-shadow(0 0 8px rgba(255,255,255,0.5))", "drop-shadow(0 0 0px rgba(255,255,255,0))"]
                        } : {
                          scale: 1,
                          rotate: 0,
                          filter: "drop-shadow(0 0 0px rgba(255,255,255,0))"
                        }
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3"/>
                      <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  </div>
                  
                  {/* Speaking indicator */}
                  {(isPlayingQuestion || isPlayingFeedback) && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Prism AI</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium text-center max-w-[280px] mb-4 italic">
                "I'm Prism, seeing your potential from every angle"
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 ${
                  loading 
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : isRecording
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : (isPlayingQuestion || isPlayingFeedback)
                    ? "bg-[#1d2f62]/10 text-[#1d2f62] border border-[#1d2f62]/20"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking...
                    </>
                  ) : isRecording ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Listening...
                    </>
                  ) : (isPlayingQuestion || isPlayingFeedback) ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      Speaking...
                    </>
                  ) : (
                    "Ready"
                  )}
                </div>
              </div>

              <div className="h-12 flex items-center justify-center w-full max-w-[200px] mb-2">
                {(isPlayingQuestion || isPlayingFeedback || isRecording) ? (
                  <AudioVisualizer 
                    isPlaying={isPlayingQuestion || isPlayingFeedback}
                    isRecording={isRecording}
                    audioStream={audioStream}
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

            {/* First Question Indicator */}
            {questionCount === 1 && !feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 mt-auto pt-6 border-t border-slate-100"
              >
                <div className="text-center px-6">
                  <p className="text-xl font-bold text-slate-700 mb-4">👋 Welcome to your AI Interview</p>
                  <p className="text-lg text-slate-500 leading-relaxed">Listen to the question or read it on the right, then answer using voice</p>
                </div>
              </motion.div>
            )}

            {/* Feedback Section */}
            {feedback && (
              <motion.div 
                ref={feedbackRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 mt-auto pt-4 border-t border-slate-100"
              >
                <div className="relative">
                  <div 
                    ref={feedbackContentRef}
                    onScroll={handleFeedbackScroll}
                    className="max-h-[150px] overflow-y-auto pr-2 touch-pan-y"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#86efac #f0fdf4',
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
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
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-[10px] transition-colors flex-shrink-0"
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
                        <p className="text-base text-emerald-800 leading-relaxed break-words whitespace-pre-wrap">{feedback}</p>
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {showScrollIndicator && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/95 to-transparent cursor-pointer flex items-end justify-center pb-1"
                        onClick={() => {
                          feedbackContentRef.current?.scrollBy({ top: 50, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex flex-col items-center animate-bounce">
                          <span className="text-[10px] text-emerald-600 font-semibold mb-0.5">Scroll</span>
                          <ChevronDown className="h-3 w-3 text-emerald-600" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Interaction Area */}
          <div className="lg:col-span-9 flex flex-col gap-6 h-full overflow-hidden">
             {/* Question Section - Flexible */}
             <div className="flex-1 min-h-0 flex flex-col">
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
                  className="h-full"
                />
             </div>

             {/* Answer Section - Fixed */}
             <div className="flex-shrink-0">
               <div ref={answerAreaRef}>
                  <AnswerArea
                    isRecording={isRecording}
                    recordedAudio={recordedAudio}
                    currentAnswer={currentAnswer}
                    transcribedText={transcribedText}
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
          </div>
         </div>
      </div>

      <ConfirmModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={confirmEndInterview}
        title="End Interview?"
        message={
          questionCount <= 1 && hasReset
            ? "You have reset this interview. Ending it now will still deduct a credit even if you haven't answered any questions. Are you sure?"
            : questionCount <= 1
            ? "You haven't answered any questions. Ending now will cancel the session and NO credit will be deducted."
            : `Are you sure you want to end the interview? You've answered ${Math.max(0, questionCount - 1)} questions. This action cannot be undone.`
        }
        confirmText="End Interview"
        cancelText="Continue Interview"
        type="warning"
        isDestructive={true}
        stats={{
          "Questions Answered": Math.max(0, questionCount - 1),
          "Status": "In Progress"
        }}
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
      
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceSelect={handleVoiceChange}
      />

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-white/20"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pause className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Paused</h2>
            <p className="text-slate-600 mb-8">
              Your interview is currently paused. Take a break and resume when you're ready.
            </p>
            <button
              onClick={togglePause}
              className="w-full py-3.5 bg-[#1d2f62] text-white rounded-xl font-semibold text-lg hover:bg-[#1d2f62]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mb-3"
            >
              <Play className="h-5 w-5 fill-current" />
              Resume Interview
            </button>
            <button
              onClick={() => {
                toastSuccess("Session saved. You can resume anytime from the dashboard.");
                navigate("/dashboard");
              }}
              className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Resume Later
            </button>
          </motion.div>
        </div>
      )}
    </PageLayout>
  );
};

export default InterviewFlow;