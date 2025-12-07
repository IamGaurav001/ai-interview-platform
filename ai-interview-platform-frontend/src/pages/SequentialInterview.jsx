import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { evaluateAnswer, saveCompleteSession, evaluateVoiceAnswer, cancelInterview } from "../api/interviewAPI";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  FileText,
  Volume2,
  Play,
  Pause,
  Mic,
  Square,
  StopCircle,
  AlertCircle,
  Sparkles,
  Bot,
  LogOut,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "../components/AudioVisualizer";
import SpeakingAvatar from "../components/SpeakingAvatar";
import ConfirmModal from "../components/ConfirmModal";
import PageLayout from "../components/PageLayout";
import InterviewTour from "../components/InterviewTour";
import QuestionCard from "../components/QuestionCard";
import AnswerArea from "../components/AnswerArea";
import VoiceSettingsModal from "../components/VoiceSettingsModal";
import logo from "../assets/prephire-icon-circle.png";
import { useToast } from "../context/ToastContext";


import { logEvent } from "../config/amplitude";
import SEO from "../components/SEO";

const SequentialInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions: initialQuestions, domain = "Resume-Based" } = location.state || {};

  const [questions] = useState(() => {
    if (!initialQuestions) return [];
    

    if (Array.isArray(initialQuestions)) {
      return initialQuestions.filter((q) => q && String(q).trim().length > 10);
    }
    

    if (typeof initialQuestions === 'string') {
      const lines = initialQuestions.split("\n").filter((line) => line.trim());
      return lines
        .map((line) => {
          // Remove leading numbers and clean up
          const cleaned = line.replace(/^\d+[\.\)]\s*/, "").trim();
          return cleaned;
        })
        .filter((q) => q && q.length > 10);
    }
    
    return [];
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();
  const [showSummary, setShowSummary] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionAudioUrls, setQuestionAudioUrls] = useState({});
  const [feedbackAudioUrls, setFeedbackAudioUrls] = useState({});
  const [playingAudio, setPlayingAudio] = useState({});
  const [audioInstances, setAudioInstances] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioStream, setAudioStream] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [startTour, setStartTour] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

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
    if (questions.length > 0) {
      logEvent('Start Interview', { type: 'Sequential', questionCount: questions.length });
    }
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenSequentialTour');
    console.log('SequentialInterview: hasSeenTour:', hasSeenTour, 'initialLoading:', initialLoading);
    if (!hasSeenTour && !initialLoading) {
      console.log('SequentialInterview: Setting startTour to true');
      setStartTour(true);
    }
  }, [initialLoading]);

  const handleTourFinish = () => {
    localStorage.setItem('hasSeenSequentialTour', 'true');
    setStartTour(false);
  };


  useEffect(() => {
    if (answers[currentQuestionIndex]) {
      setCurrentAnswer(answers[currentQuestionIndex]);
    } else {
      setCurrentAnswer("");
    }
  }, [currentQuestionIndex, answers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialQuestions || questions.length === 0) {
      navigate("/upload-resume", { replace: true });
    }
  }, [initialQuestions, questions.length, navigate]);


  useEffect(() => {
    return () => {
      Object.values(audioInstances).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });

      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
      
      window.speechSynthesis.cancel();
    };
  }, [audioInstances, mediaRecorder, isRecording]);


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
          const audioUrl = URL.createObjectURL(blob);
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
      const question = questions[currentQuestionIndex];
      const formData = new FormData();
      formData.append("audio", recordedAudio, "answer.webm");
      formData.append("domain", domain);
      formData.append("question", question);

      const res = await evaluateVoiceAnswer(formData);

      if (res.data && res.data.feedback) {
        const transcribed = res.data.transcribedText || "";
        setTranscribedText(transcribed);

        const newAnswers = [...answers, transcribed || "Voice answer"];
        const newFeedbacks = [...feedbacks, res.data.feedback];


        if (res.data.audioUrl) {
          setFeedbackAudioUrls((prev) => ({
            ...prev,
            [currentQuestionIndex]: res.data.audioUrl,
          }));
        }

        setAnswers(newAnswers);
        setFeedbacks(newFeedbacks);
        setCurrentAnswer(transcribed);
        setRecordedAudio(null);
        setTranscribedText("");


        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {

          handleShowSummary(newAnswers, newFeedbacks);
        }
      } else {
        toastError("Invalid response from server");
      }
    } catch (err) {
      console.error("Evaluate voice error:", err);
      if (err.networkError) {
        console.error("Cannot connect to server. Please make sure the backend is running.");
      } else {
        toastError(err.response?.data?.error || err.message || "Failed to evaluate voice answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answerText) => {
    const finalAnswer = typeof answerText === 'string' ? answerText : currentAnswer;
    
    if (!finalAnswer.trim()) {
      toastError("Please provide an answer");
      return;
    }

    setLoading(true);

    try {
      const question = questions[currentQuestionIndex];
      const res = await evaluateAnswer(domain, question, finalAnswer);

      if (res.data && res.data.feedback) {
        const newAnswers = [...answers, finalAnswer];
        const newFeedbacks = [...feedbacks, res.data.feedback];


        if (res.data.audioUrl) {
          setFeedbackAudioUrls((prev) => ({
            ...prev,
            [currentQuestionIndex]: res.data.audioUrl,
          }));
        }

        setAnswers(newAnswers);
        setFeedbacks(newFeedbacks);
        setCurrentAnswer("");
        setRecordedAudio(null);
        setTranscribedText("");


        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {

          handleShowSummary(newAnswers, newFeedbacks);
        }
      } else {
        toastError("Invalid response from server");
      }
    } catch (err) {
      console.error("Evaluate error:", err);
      if (err.networkError) {
        // toastError("Cannot connect to server. Please make sure the backend is running.");
        console.error("Cannot connect to server. Please make sure the backend is running.");
      } else {
        toastError(err.response?.data?.error || err.message || "Failed to evaluate answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowSummary = async (finalAnswers, finalFeedbacks) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSaving(true);
    try {

      await saveCompleteSession({
        domain,
        questions,
        answers: finalAnswers,
        feedbacks: finalFeedbacks,
      });
      logEvent('Complete Interview', { 
        type: 'Sequential', 
        questionCount: questions.length,
        score: calculateOverallScore()
      });
      setShowSummary(true);
    } catch (err) {
      console.error("Save session error:", err);

      setShowSummary(true);
    } finally {
      setSaving(false);
      setIsSubmitting(false);
    }
  };



  const handleEndInterview = () => {
    setShowEndModal(true);
  };

  const confirmEndInterview = () => {
    setShowEndModal(false);
    handleShowSummary(answers, feedbacks);
  };

  const handleExitInterview = async () => {
    try {

      await cancelInterview();
      console.log("✅ Interview session cancelled");
    } catch (err) {
      console.error("❌ Error cancelling interview:", err);

    } finally {
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentAnswer(answers[prevIndex] || "");
    }
  };

  const playAudio = (audioUrl, type, index) => {
    if (!audioUrl) return;

    const audioKey = `${type}_${index}`;


    if (audioInstances[audioKey]) {
      audioInstances[audioKey].pause();
      audioInstances[audioKey].src = "";
    }


    const audio = new Audio(audioUrl);

    setAudioInstances((prev) => ({
      ...prev,
      [audioKey]: audio,
    }));
    setPlayingAudio((prev) => ({
      ...prev,
      [audioKey]: true,
    }));

    audio.play().catch((err) => {
      console.error("Error playing audio:", err);
      setPlayingAudio((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
    });

    audio.onended = () => {
      setPlayingAudio((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
      setAudioInstances((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
    };

    audio.onerror = () => {
      console.error("Audio playback error");
      setPlayingAudio((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
      setAudioInstances((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
    };
  };

  const stopAudio = (type, index) => {
    const audioKey = `${type}_${index}`;
    if (audioInstances[audioKey]) {
      audioInstances[audioKey].pause();
      audioInstances[audioKey].src = "";
      setPlayingAudio((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
      setAudioInstances((prev) => {
        const newState = { ...prev };
        delete newState[audioKey];
        return newState;
      });
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

    // Try to find a good voice
    // Try to find a good voice
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

  const calculateOverallScore = () => {
    if (feedbacks.length === 0) return 0;
    let total = 0;
    let count = 0;
    feedbacks.forEach((fb) => {
      if (fb.correctness !== undefined && fb.clarity !== undefined && fb.confidence !== undefined) {
        const avg = (fb.correctness + fb.clarity + fb.confidence) / 3;
        total += avg;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : 0;
  };

  const renderScoreBar = (score, label, color) => {
    const percentage = (score / 10) * 100;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm font-semibold text-slate-900">{score}/10</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <motion.div
            className={`h-2.5 rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-40"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-2xl border border-white/20">
                <img src={logo} alt="Loading..." className="h-32 w-32 object-contain animate-pulse rounded-full" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Preparing Interview</h2>
            <p className="text-slate-500 text-lg font-medium">Setting up your secure environment...</p>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (saving) {
    return (
      <PageLayout>
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

  if (questions.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  if (showSummary) {
    const overallScore = calculateOverallScore();
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Trophy className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3">Interview Complete! 🎉</h1>
            <p className="text-base sm:text-lg text-slate-600">Here's your performance summary</p>
          </div>


          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Overall Score</h2>
            <div className="text-5xl sm:text-7xl font-bold text-blue-600 mb-2 tracking-tight">{overallScore}/10</div>
            <p className="text-slate-500 font-medium">
              Based on {feedbacks.length} question{feedbacks.length !== 1 ? "s" : ""}
            </p>
          </div>


          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Interview Questions</h2>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                {questions.length} Questions
              </span>
            </div>
            {questions.map((question, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl shadow-md p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        Question {idx + 1}
                      </span>
                      {feedbacks[idx] && (
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          Score:{" "}
                          {(
                            (feedbacks[idx].correctness +
                              feedbacks[idx].clarity +
                              feedbacks[idx].confidence) /
                            3
                          ).toFixed(1)}
                          /10
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 font-medium mb-3 text-lg">{question}</p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-slate-700 text-sm">
                        <strong className="text-slate-900 block mb-1">Your Answer:</strong> {answers[idx]}
                      </p>
                    </div>
                  </div>
                </div>

                {feedbacks[idx] && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                      <div className="bg-green-50/50 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm">
                        {renderScoreBar(feedbacks[idx].correctness, "Correctness", "bg-gradient-to-r from-green-400 to-green-500")}
                      </div>
                      <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
                        {renderScoreBar(feedbacks[idx].clarity, "Clarity", "bg-gradient-to-r from-blue-400 to-blue-500")}
                      </div>
                      <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
                        {renderScoreBar(feedbacks[idx].confidence, "Confidence", "bg-gradient-to-r from-blue-400 to-blue-500")}
                      </div>
                    </div>
                    {feedbacks[idx].overall_feedback && (
                      <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          AI Feedback
                        </h4>
                        <p className="text-blue-800 leading-relaxed">{feedbacks[idx].overall_feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
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
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
      </PageLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnswerForCurrent = answers[currentQuestionIndex] !== undefined;
  const hasFeedbackForCurrent = feedbacks[currentQuestionIndex] !== undefined;

  return (
    <PageLayout>
      <SEO title="Sequential Interview" description="Practice sequential interview questions tailored to your resume." />
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full bg-red-400"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
            </div>
            <span className="text-slate-300 mx-2">/</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Sequential Interview</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-red-500 px-3 py-1 rounded-md text-xs font-bold tracking-wider flex items-center gap-2 border border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              REC
            </div>
            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              title="Exit without completing"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md font-semibold text-xs sm:text-sm"
              title="End Interview"
            >
              <StopCircle className="h-4 w-4" />
              <span>End</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-140px)] min-h-[calc(100vh-140px)]">
          {/* Left Column - AI Interviewer */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 relative">
                <SpeakingAvatar 
                  isSpeaking={
                    playingAudio[`question_${currentQuestionIndex}`] || 
                    playingAudio[`feedback_${currentQuestionIndex}`]
                  } 
                  size="medium" 
                  showWave={true}
                />
                {(playingAudio[`question_${currentQuestionIndex}`] || playingAudio[`feedback_${currentQuestionIndex}`]) && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">AI Interviewer</h2>
              
              <div className="flex items-center gap-2 mb-6">
                <div className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                  loading 
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : isRecording
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : (playingAudio[`question_${currentQuestionIndex}`] || playingAudio[`feedback_${currentQuestionIndex}`])
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                  ) : (playingAudio[`question_${currentQuestionIndex}`] || playingAudio[`feedback_${currentQuestionIndex}`]) ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Speaking...
                    </>
                  ) : (
                    "Waiting"
                  )}
                </div>
              </div>

              <div className="h-16 flex items-center justify-center w-full max-w-[200px]">
                {(playingAudio[`question_${currentQuestionIndex}`] || playingAudio[`feedback_${currentQuestionIndex}`] || isRecording) ? (
                  <AudioVisualizer 
                    isPlaying={playingAudio[`question_${currentQuestionIndex}`] || playingAudio[`feedback_${currentQuestionIndex}`]}
                    isRecording={isRecording}
                    audioStream={audioStream}
                    mode={isRecording ? "speaking" : "listening"}
                  />
                ) : (
                  <div className="flex gap-1.5">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-2 h-2 rounded-full bg-slate-200"></div>
                     ))}
                  </div>
                )}
              </div>
            </div>
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

      <ConfirmModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={confirmEndInterview}
        title="End Interview?"
        message={`Are you sure you want to end the interview? You've answered ${answers.length} questions. This action cannot be undone.`}
        confirmText="End Interview"
        cancelText="Continue Interview"
        type="warning"
        isDestructive={true}
      />

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitInterview}
        title="Exit Interview?"
        message="Are you sure you want to exit? Your progress in this session will not be saved."
        confirmText="Exit without Saving"
        cancelText="Continue Interview"
        type="warning"
        isDestructive={true}
      />
      
      <InterviewTour start={startTour} onFinish={handleTourFinish} type="sequential" />
      
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceSelect={handleVoiceChange}
      />
    </PageLayout>
  );
};

export default SequentialInterview;
