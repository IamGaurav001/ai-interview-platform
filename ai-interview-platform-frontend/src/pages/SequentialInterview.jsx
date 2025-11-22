import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { evaluateAnswer, saveCompleteSession, evaluateVoiceAnswer } from "../api/interviewAPI";
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
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioVisualizer from "../components/AudioVisualizer";
import SpeakingAvatar from "../components/SpeakingAvatar";
import PageLayout from "../components/PageLayout";

const SequentialInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions: initialQuestions, domain = "Resume-Based" } = location.state || {};

  const [questions] = useState(() => {
    if (!initialQuestions) return [];
    
    // If it's already an array, use it directly
    if (Array.isArray(initialQuestions)) {
      return initialQuestions.filter((q) => q && String(q).trim().length > 10);
    }
    
    // Otherwise, parse questions from text (numbered list format)
    if (typeof initialQuestions === 'string') {
      const lines = initialQuestions.split("\n").filter((line) => line.trim());
      return lines
        .map((line) => {
          // Remove numbering (1., 2., etc.) and clean up
          const cleaned = line.replace(/^\d+[\.\)]\s*/, "").trim();
          return cleaned;
        })
        .filter((q) => q.length > 10); // Filter out very short lines
    }
    
    return [];
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
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

  // Update current answer when question index changes
  useEffect(() => {
    if (answers[currentQuestionIndex]) {
      setCurrentAnswer(answers[currentQuestionIndex]);
    } else {
      setCurrentAnswer("");
    }
  }, [currentQuestionIndex, answers]);

  useEffect(() => {
    if (!initialQuestions || questions.length === 0) {
      navigate("/upload-resume", { replace: true });
    }
  }, [initialQuestions, questions.length, navigate]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioInstances).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
      // Stop recording if active
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
    };
  }, [audioInstances, mediaRecorder, isRecording]);

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
        const audioUrl = URL.createObjectURL(blob);
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

        // Store audio URLs if available
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

        // Move to next question or show summary
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // All questions answered - show summary
          handleShowSummary(newAnswers, newFeedbacks);
        }
      } else {
        setError("Invalid response from server");
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

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError("Please provide an answer");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const question = questions[currentQuestionIndex];
      const res = await evaluateAnswer(domain, question, currentAnswer);

      if (res.data && res.data.feedback) {
        const newAnswers = [...answers, currentAnswer];
        const newFeedbacks = [...feedbacks, res.data.feedback];

        // Store audio URLs if available
        if (res.data.audioUrl) {
          setFeedbackAudioUrls((prev) => ({
            ...prev,
            [currentQuestionIndex]: res.data.audioUrl,
          }));
        }

        setAnswers(newAnswers);
        setFeedbacks(newFeedbacks);
        setCurrentAnswer("");

        // Move to next question or show summary
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // All questions answered - show summary
          handleShowSummary(newAnswers, newFeedbacks);
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Evaluate error:", err);
      if (err.networkError) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to evaluate answer");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowSummary = async (finalAnswers, finalFeedbacks) => {
    setSaving(true);
    try {
      // Save complete session
      await saveCompleteSession({
        domain,
        questions,
        answers: finalAnswers,
        feedbacks: finalFeedbacks,
      });
      setShowSummary(true);
    } catch (err) {
      console.error("Save session error:", err);
      // Still show summary even if save fails
      setShowSummary(true);
    } finally {
      setSaving(false);
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

    // Stop any currently playing audio
    if (audioInstances[audioKey]) {
      audioInstances[audioKey].pause();
      audioInstances[audioKey].src = "";
    }

    // Create new audio instance
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

  if (questions.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
      </PageLayout>
    );
  }

  if (showSummary) {
    const overallScore = calculateOverallScore();
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Trophy className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Interview Complete! 🎉</h1>
            <p className="text-lg text-slate-600">Here's your performance summary</p>
          </div>

          {/* Overall Score Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Overall Score</h2>
            <div className="text-7xl font-bold text-indigo-600 mb-2 tracking-tight">{overallScore}/10</div>
            <p className="text-slate-500 font-medium">
              Based on {feedbacks.length} question{feedbacks.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Question-by-Question Summary */}
          <div className="space-y-6 mb-12">
            {questions.map((question, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        {renderScoreBar(feedbacks[idx].correctness, "Correctness", "bg-green-500")}
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        {renderScoreBar(feedbacks[idx].clarity, "Clarity", "bg-blue-500")}
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        {renderScoreBar(feedbacks[idx].confidence, "Confidence", "bg-purple-500")}
                      </div>
                    </div>
                    {feedbacks[idx].overall_feedback && (
                      <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-2">Feedback</h4>
                        <p className="text-indigo-800 leading-relaxed">{feedbacks[idx].overall_feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnswerForCurrent = answers[currentQuestionIndex] !== undefined;
  const hasFeedbackForCurrent = feedbacks[currentQuestionIndex] !== undefined;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} <span className="text-slate-400">/</span> {questions.length}
            </span>
            <span className="text-sm font-bold text-slate-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-indigo-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Current Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <SpeakingAvatar 
                    isSpeaking={
                      playingAudio[`question_${currentQuestionIndex}`] || 
                      playingAudio[`feedback_${currentQuestionIndex}`]
                    } 
                    size="small" 
                  />
                  <h2 className="text-xl font-bold text-slate-900">Question {currentQuestionIndex + 1}</h2>
                </div>
                <p className="text-xl text-slate-800 leading-relaxed font-medium">{currentQuestion}</p>
              </div>
              
              {questionAudioUrls[currentQuestionIndex] && (
                <button
                  onClick={() => {
                    const audioKey = `question_${currentQuestionIndex}`;
                    if (playingAudio[audioKey]) {
                      stopAudio("question", currentQuestionIndex);
                    } else {
                      playAudio(questionAudioUrls[currentQuestionIndex], "question", currentQuestionIndex);
                    }
                  }}
                  className={`flex items-center justify-center h-12 w-12 rounded-full transition-all shadow-md hover:shadow-lg flex-shrink-0 ${
                    playingAudio[`question_${currentQuestionIndex}`]
                      ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  title={
                    playingAudio[`question_${currentQuestionIndex}`]
                      ? "Stop audio"
                      : "Play question audio"
                  }
                >
                  {playingAudio[`question_${currentQuestionIndex}`] ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>

            {/* Audio Visualizer for Question */}
            <div className="h-8 mb-6 flex items-center justify-center">
              <AudioVisualizer 
                isPlaying={playingAudio[`question_${currentQuestionIndex}`]} 
                isRecording={false} 
                mode="speaking" 
              />
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {/* Error Display - Moved to top for visibility */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center gap-3 mb-2 shadow-sm"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Your Answer</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Input Mode</span>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
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
                    className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl"
                  >
                    <p className="text-sm text-indigo-900">
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
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
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
                  className="w-full p-5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[200px] text-slate-700 leading-relaxed transition-shadow shadow-sm focus:shadow-md"
                  disabled={loading}
                />
                <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                  {currentAnswer.length} chars
                </div>
              </div>
            </div>



            {/* Previous Answer Feedback */}
            {hasAnswerForCurrent && hasFeedbackForCurrent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 pt-8 border-t border-slate-100"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  Feedback
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    {renderScoreBar(
                      feedbacks[currentQuestionIndex].correctness,
                      "Correctness",
                      "bg-green-500"
                    )}
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    {renderScoreBar(feedbacks[currentQuestionIndex].clarity, "Clarity", "bg-blue-500")}
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    {renderScoreBar(
                      feedbacks[currentQuestionIndex].confidence,
                      "Confidence",
                      "bg-purple-500"
                    )}
                  </div>
                </div>
                {feedbacks[currentQuestionIndex].overall_feedback && (
                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-2">Overall Feedback</h4>
                        <p className="text-indigo-800 leading-relaxed">{feedbacks[currentQuestionIndex].overall_feedback}</p>
                      </div>
                      {feedbackAudioUrls[currentQuestionIndex] && (
                        <button
                          onClick={() => {
                            const audioKey = `feedback_${currentQuestionIndex}`;
                            if (playingAudio[audioKey]) {
                              stopAudio("feedback", currentQuestionIndex);
                            } else {
                              playAudio(
                                feedbackAudioUrls[currentQuestionIndex],
                                "feedback",
                                currentQuestionIndex
                              );
                            }
                          }}
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm border border-indigo-200 transition-colors flex-shrink-0"
                          title={
                            playingAudio[`feedback_${currentQuestionIndex}`]
                              ? "Stop audio"
                              : "Play feedback audio"
                          }
                        >
                          {playingAudio[`feedback_${currentQuestionIndex}`] ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <AudioVisualizer 
                        isPlaying={playingAudio[`feedback_${currentQuestionIndex}`]} 
                        isRecording={false} 
                        mode="speaking" 
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || loading}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !currentAnswer.trim() || saving}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Evaluating...
                  </>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <Trophy className="h-5 w-5" />
                    Finish Interview
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit & Next
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default SequentialInterview;
