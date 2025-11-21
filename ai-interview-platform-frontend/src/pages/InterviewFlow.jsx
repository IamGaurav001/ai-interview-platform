import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview, nextInterviewStep, endInterview, getActiveSession, evaluateVoiceAnswer } from "../api/interviewAPI";
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
  StopCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "../components/AudioVisualizer";

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
  const [questionAudioUrl, setQuestionAudioUrl] = useState(null);
  const [feedbackAudioUrl, setFeedbackAudioUrl] = useState(null);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);
  const [questionAudio, setQuestionAudio] = useState(null);
  const [feedbackAudio, setFeedbackAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  // Check for active session on mount
  useEffect(() => {
    checkActiveSession();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (questionAudio) {
        questionAudio.pause();
        questionAudio.src = "";
      }
      if (feedbackAudio) {
        feedbackAudio.pause();
        feedbackAudio.src = "";
      }
      // Stop recording if active
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
      // Stop browser TTS
      window.speechSynthesis.cancel();
    };
  }, [questionAudio, feedbackAudio, mediaRecorder, isRecording]);

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
        // Set audio URL if available
        if (res.data.audioUrl) {
          console.log("✅ Audio URL received:", res.data.audioUrl);
          setQuestionAudioUrl(res.data.audioUrl);
        } else {
          console.warn("⚠️ No audio URL in response:", res.data);
        }
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
        }

        // Set audio URLs if available
        if (res.data.feedbackAudioUrl) {
          console.log("✅ Feedback audio URL received:", res.data.feedbackAudioUrl);
          setFeedbackAudioUrl(res.data.feedbackAudioUrl);
        }
        if (res.data.questionAudioUrl) {
          console.log("✅ Question audio URL received:", res.data.questionAudioUrl);
          setQuestionAudioUrl(res.data.questionAudioUrl);
        } else {
          console.warn("⚠️ No question audio URL in response:", res.data);
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

  const playAudio = (audioUrl, type = "question", text = null) => {
    // If audioUrl is available, use it
    if (audioUrl) {
      // Stop any currently playing audio
      if (type === "question" && questionAudio) {
        questionAudio.pause();
        questionAudio.src = "";
      }
      if (type === "feedback" && feedbackAudio) {
        feedbackAudio.pause();
        feedbackAudio.src = "";
      }

      // Create new audio instance
      const audio = new Audio(audioUrl);
      
      if (type === "question") {
        setQuestionAudio(audio);
        setIsPlayingQuestion(true);
      } else {
        setFeedbackAudio(audio);
        setIsPlayingFeedback(true);
      }

      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        // Fallback to browser TTS if audio file fails
        if (text) {
          playBrowserTTS(text, type);
        } else {
          if (type === "question") {
            setIsPlayingQuestion(false);
          } else {
            setIsPlayingFeedback(false);
          }
        }
      });

      audio.onended = () => {
        if (type === "question") {
          setIsPlayingQuestion(false);
          setQuestionAudio(null);
        } else {
          setIsPlayingFeedback(false);
          setFeedbackAudio(null);
        }
      };

      audio.onerror = () => {
        console.error("Audio playback error, falling back to browser TTS");
        // Fallback to browser TTS
        if (text) {
          playBrowserTTS(text, type);
        } else {
          if (type === "question") {
            setIsPlayingQuestion(false);
            setQuestionAudio(null);
          } else {
            setIsPlayingFeedback(false);
            setFeedbackAudio(null);
          }
        }
      };
    } else if (text) {
      // No audio URL, use browser TTS as fallback
      playBrowserTTS(text, type);
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

  const stopAudio = (type = "question") => {
    // Stop file-based audio
    if (type === "question" && questionAudio) {
      questionAudio.pause();
      questionAudio.src = "";
      setQuestionAudio(null);
      setIsPlayingQuestion(false);
    }
    if (type === "feedback" && feedbackAudio) {
      feedbackAudio.pause();
      feedbackAudio.src = "";
      setFeedbackAudio(null);
      setIsPlayingFeedback(false);
    }
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
            }

            // Set audio URLs if available
            if (nextRes.data.feedbackAudioUrl) {
              setFeedbackAudioUrl(nextRes.data.feedbackAudioUrl);
            }
            if (nextRes.data.questionAudioUrl) {
              setQuestionAudioUrl(nextRes.data.questionAudioUrl);
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
          if (res.data.audioUrl) {
            setFeedbackAudioUrl(res.data.audioUrl);
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
    // Confirm with user before ending, unless auto-complete
    const shouldProceed =
      skipConfirm ||
      window.confirm(
        `Are you sure you want to end the interview? You've answered ${questionCount} questions. This action cannot be undone.`
      );

    if (!shouldProceed) {
      if (!skipConfirm) {
        setIsComplete(false);
      }
      return;
    }

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

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Starting your interview...</p>
        </div>
      </div>
    );
  }

  if (isComplete && summary) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
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
              Overall Score: <span className="text-orange-600">{summary.overallScore}/10</span>
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
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {summary.weaknesses?.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-orange-800">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
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
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">Key Recommendations</h3>
                <ul className="space-y-3">
                  {summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-orange-800">
                      <ArrowRight className="h-5 w-5 mt-0.5 flex-shrink-0 text-orange-500" />
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                Question {questionCount}
              </span>
              <span className="text-sm text-slate-500 ml-2">of ~15-25</span>
            </div>
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {questionCount >= 25 ? "Maximum Reached" : questionCount >= 15 ? "Near Completion" : "In Progress"}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-orange-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((questionCount / 25) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {questionCount >= 20 && (
            <p className="text-xs text-orange-500 mt-3 font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Interview is approaching completion. You can end it anytime.
            </p>
          )}
        </motion.div>

        {/* Current Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionCount}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Current Question</h2>
                </div>
                <p className="text-xl text-slate-800 leading-relaxed font-medium">{currentQuestion}</p>
              </div>
              
              <button
                onClick={() => {
                  if (isPlayingQuestion) {
                    stopAudio("question");
                  } else {
                    playAudio(questionAudioUrl, "question", currentQuestion);
                  }
                }}
                className={`flex items-center justify-center h-12 w-12 rounded-full transition-all shadow-md hover:shadow-lg flex-shrink-0 ${
                  isPlayingQuestion 
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
                title={isPlayingQuestion ? "Stop audio" : "Play question audio"}
              >
                {isPlayingQuestion ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Audio Visualizer for Question */}
            <div className="h-8 mb-6 flex items-center justify-center">
              <AudioVisualizer isPlaying={isPlayingQuestion} isRecording={false} mode="speaking" />
            </div>

            {/* Feedback from previous answer */}
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100"
              >
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">Feedback on previous answer</h3>
                    <p className="text-emerald-900 leading-relaxed">{feedback}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (isPlayingFeedback) {
                        stopAudio("feedback");
                      } else {
                        playAudio(feedbackAudioUrl, "feedback", feedback);
                      }
                    }}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-emerald-600 hover:bg-emerald-50 shadow-sm border border-emerald-200 transition-colors flex-shrink-0"
                    title={isPlayingFeedback ? "Stop audio" : "Play feedback audio"}
                  >
                    {isPlayingFeedback ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-4 flex justify-center">
                  <AudioVisualizer isPlaying={isPlayingFeedback} isRecording={false} mode="speaking" />
                </div>
              </motion.div>
            )}

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Your Answer</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Input Mode</span>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading || isComplete}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                      isRecording
                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 animate-pulse"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="h-4 w-4" />
                        <span>Stop ({recordingTime}s)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span>Record Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Audio Visualizer for Recording */}
              <div className="h-8 flex items-center justify-center">
                <AudioVisualizer isPlaying={false} isRecording={isRecording} mode="listening" />
              </div>

              {/* Transcribed text display */}
              <AnimatePresence>
                {transcribedText && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-orange-50 border border-orange-100 rounded-xl"
                  >
                    <p className="text-sm text-orange-900">
                      <span className="font-semibold">Transcribed:</span> {transcribedText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recorded audio preview */}
              {recordedAudio && !transcribedText && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4"
                >
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                    <Volume2 className="h-5 w-5 text-slate-600" />
                  </div>
                  <audio
                    src={URL.createObjectURL(recordedAudio)}
                    controls
                    className="flex-1 h-10"
                  />
                  <button
                    onClick={handleSubmitVoiceAnswer}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
                  >
                    {loading ? "Processing..." : "Submit Voice"}
                  </button>
                </motion.div>
              )}

              <div className="relative">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your detailed answer here... Be specific and provide examples."
                  className="w-full p-5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[200px] text-slate-700 leading-relaxed transition-shadow shadow-sm focus:shadow-md"
                  disabled={loading || isComplete}
                />
                <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                  {currentAnswer.length} chars
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                onClick={handleEndInterview}
                disabled={loading || isComplete || saving}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <StopCircle className="h-5 w-5" />
                End Interview
              </button>
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !currentAnswer.trim() || saving}
                className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewFlow;
