import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview, nextInterviewStep, endInterview, getActiveSession, evaluateVoiceAnswer, cancelInterview } from "../api/interviewAPI";
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
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "../components/AudioVisualizer";
import ConfirmModal from "../components/ConfirmModal";
import SpeakingAvatar from "../components/SpeakingAvatar";
import PageLayout from "../components/PageLayout";

const InterviewFlow = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  
  // Modal state
  const [showEndModal, setShowEndModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Check for active session on mount
  useEffect(() => {
    checkActiveSession();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
      // Stop browser TTS
      window.speechSynthesis.cancel();
    };
  }, [mediaRecorder, isRecording]);

  // Recording timer
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
      const res = await getActiveSession();
      if (res.data.hasActiveSession) {
        setCurrentQuestion(res.data.currentQuestion);
        setQuestionCount(res.data.questionCount);
        setConversationHistory(res.data.history || []);
      } else {
        // No active session, start new interview
        startNewInterview();
      }
    } catch (err) {
      console.error("Error checking active session:", err);
      startNewInterview();
    }
  };

  const startNewInterview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await startInterview();
      if (res.data.success) {
        setCurrentQuestion(res.data.question);
        setQuestionCount(1);
        setConversationHistory([
          { role: "interviewer", text: res.data.question, timestamp: new Date().toISOString() }
        ]);
        // Auto-play question using browser TTS
        playBrowserTTS(res.data.question, "question");
      } else {
        setError(res.data.message || "Failed to start interview");
      }
    } catch (err) {
      console.error("Start interview error:", err);
      if (err.response?.status === 400) {
        setError("Please upload your resume first before starting an interview.");
        setTimeout(() => navigate("/upload-resume"), 2000);
      } else if (err.response?.status === 429 || err.response?.status === 503) {
        setError(err.response?.data?.message || "AI service is busy. Please wait a moment and try again.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to start interview");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || currentAnswer.trim().length < 10) {
      setError("Please provide a detailed answer (at least 10 characters)");
      return;
    }

    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const res = await nextInterviewStep(currentAnswer.trim());
      
      if (res.data.success) {
        // Add user answer to history
        const updatedHistory = [
          ...conversationHistory,
          { role: "user", text: currentAnswer.trim(), timestamp: new Date().toISOString() }
        ];

        setConversationHistory(updatedHistory);

        // Add feedback and next question
        if (res.data.feedback) {
          setFeedback(res.data.feedback);
          // Auto-play feedback using browser TTS
          playBrowserTTS(res.data.feedback, "feedback");
        }

        if (res.data.isComplete) {
          // Interview is complete
          const finalCount = res.data.questionCount ?? questionCount;
          setQuestionCount(finalCount);
          setIsComplete(true);
          handleEndInterview(true);
        } else if (res.data.question) {
          // Add interviewer's next question to history
          const finalHistory = [
            ...updatedHistory,
            { role: "interviewer", text: res.data.question, timestamp: new Date().toISOString() }
          ];
          setConversationHistory(finalHistory);
          setCurrentQuestion(res.data.question);
          setQuestionCount(res.data.questionCount || questionCount + 1);
          setCurrentAnswer("");
        }
      } else {
        setError(res.data.message || "Failed to process answer");
      }
    } catch (err) {
      console.error("Next step error:", err);
      if (err.response?.status === 429 || err.response?.status === 503) {
        setError(err.response?.data?.message || "AI service is busy. Please wait a moment and try again.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to process answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const playBrowserTTS = (text, type = "question") => {
    // Use browser's built-in speech synthesis (no backend required)
    if (!("speechSynthesis" in window)) {
      console.warn("Browser TTS not supported");
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural voice
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
    // Stop browser TTS
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
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedAudio(null);
      setTranscribedText("");
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone. Please check permissions.");
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
      setError("Please record an answer first");
      return;
    }

    setLoading(true);
    setError("");
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

        // Clear recording
        setRecordedAudio(null);

        // Now continue the interview flow using nextInterviewStep
        // This will get feedback and next question
        try {
          const nextRes = await nextInterviewStep(transcribed.trim());
          
          if (nextRes.data.success) {
            // Add user answer to history
            const updatedHistory = [
              ...conversationHistory,
              { role: "user", text: transcribed.trim(), timestamp: new Date().toISOString() }
            ];

            setConversationHistory(updatedHistory);

            // Add feedback and next question
            if (nextRes.data.feedback) {
              setFeedback(nextRes.data.feedback);
              // Auto-play feedback using browser TTS
              playBrowserTTS(nextRes.data.feedback, "feedback");
            }

            if (nextRes.data.isComplete) {
              // Interview is complete
              const finalCount = nextRes.data.questionCount ?? questionCount;
              setQuestionCount(finalCount);
              setIsComplete(true);
              handleEndInterview(true);
            } else if (nextRes.data.question) {
              // Add interviewer's next question to history
              const finalHistory = [
                ...updatedHistory,
                { role: "interviewer", text: nextRes.data.question, timestamp: new Date().toISOString() }
              ];
              setConversationHistory(finalHistory);
              setCurrentQuestion(nextRes.data.question);
              setQuestionCount(nextRes.data.questionCount || questionCount + 1);
              setCurrentAnswer("");
              setTranscribedText(""); // Clear transcribed text for next question
            }
          } else {
            setError(nextRes.data.message || "Failed to process answer");
          }
        } catch (nextErr) {
          console.error("Next step error after voice answer:", nextErr);
          // Still show the transcribed text and feedback from voice evaluation
          if (res.data.feedback) {
            setFeedback(res.data.feedback.overall_feedback || res.data.feedback);
          }
          setError("Voice transcribed successfully, but failed to continue interview. Please try submitting again.");
        }
      } else {
        setError(res.data?.error || "Invalid response from server");
      }
    } catch (err) {
      console.error("Evaluate voice error:", err);
      if (err.networkError) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to evaluate voice answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async (skipConfirm = false) => {
    // Show modal for confirmation unless auto-complete
    if (!skipConfirm) {
      setShowEndModal(true);
      return;
    }

    // Proceed with ending interview
    setSaving(true);
    setIsComplete(true);
    setError("");
    
    try {
      const res = await endInterview();
      if (res.data.success) {
        setSummary(res.data.summary);
      } else {
        setError("Failed to complete interview");
        setIsComplete(false);
      }
    } catch (err) {
      console.error("End interview error:", err);
      setError(err.response?.data?.message || "Failed to complete interview");
      setIsComplete(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmEndInterview = () => {
    handleEndInterview(true);
  };

  const handleExitInterview = async () => {
    try {
      // Call the cancel API to clear the session in Redis
      await cancelInterview();
      console.log("✅ Interview session cancelled");
    } catch (err) {
      console.error("❌ Error cancelling interview:", err);
      // Navigate anyway even if the API call fails
    } finally {
      navigate("/dashboard");
    }
  };

  if (loading && !currentQuestion) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Starting your interview...</p>
          </div>
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
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="hidden sm:block text-lg font-bold text-slate-900">AI Interview Session</h1>
              <span className="text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                Q {questionCount} / ~25
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowExitModal(true)}
                className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
              <button
                onClick={() => handleEndInterview()}
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                End <span className="hidden sm:inline">Interview</span>
              </button>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-indigo-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((questionCount / 25) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:h-[calc(100vh-180px)] h-auto min-h-[calc(100vh-180px)]">
          
          {/* LEFT PANEL - INTERVIEWER */}
          <AnimatePresence mode="wait">
            <motion.div
              key={questionCount}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Interviewer Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <SpeakingAvatar isSpeaking={isPlayingQuestion || isPlayingFeedback} size="large" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Interviewer</h2>
                    <p className="text-indigo-100 text-sm">Evaluating your responses</p>
                  </div>
                </div>
              </div>

              {/* Question Content */}
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

                  {/* Audio Visualizer */}
                  <div className="h-12 flex items-center justify-center bg-slate-50 rounded-xl">
                    <AudioVisualizer isPlaying={isPlayingQuestion} isRecording={false} mode="speaking" />
                  </div>
                </div>

                {/* Feedback Section */}
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

                {/* Tips */}
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

          {/* RIGHT PANEL - CANDIDATE */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Candidate Header */}
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
              
              {/* Error Display - Moved to top for visibility */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center gap-3 mb-4 shadow-sm"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
              
              {/* Recording Controls */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Input Mode</label>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || isComplete}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all shadow-md ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse ring-4 ring-red-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
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
              <div className="relative">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your detailed answer here... Be specific and provide examples from your experience."
                  className="w-full p-4 sm:p-5 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[200px] sm:min-h-[300px] text-slate-800 leading-relaxed transition-all shadow-sm focus:shadow-md"
                  disabled={loading || isComplete || isRecording}
                />
                <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  {currentAnswer.length} characters
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
        message="Are you sure you want to exit? Your progress in this session will not be saved."
        confirmText="Exit without Saving"
        cancelText="Continue Interview"
        type="warning"
      />
    </div>
    </PageLayout>
  );
};

export default InterviewFlow;