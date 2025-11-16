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
} from "lucide-react";

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
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (showSummary) {
    const overallScore = calculateOverallScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete! 🎉</h1>
            <p className="text-lg text-gray-600">Here's your performance summary</p>
          </div>

          {/* Overall Score Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Score</h2>
              <div className="text-6xl font-bold text-primary-600 mb-2">{overallScore}/10</div>
              <p className="text-gray-600">
                Based on {feedbacks.length} question{feedbacks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Question-by-Question Summary */}
          <div className="space-y-4 mb-8">
            {questions.map((question, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        Question {idx + 1}
                      </span>
                      {feedbacks[idx] && (
                        <span className="text-sm text-gray-600">
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
                    <p className="text-gray-900 font-medium mb-2">{question}</p>
                    <p className="text-gray-700 text-sm mb-3">
                      <strong>Your Answer:</strong> {answers[idx]}
                    </p>
                  </div>
                </div>

                {feedbacks[idx] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        {renderScoreBar(feedbacks[idx].correctness, "Correctness", "bg-green-500")}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {renderScoreBar(feedbacks[idx].clarity, "Clarity", "bg-blue-500")}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {renderScoreBar(feedbacks[idx].confidence, "Confidence", "bg-purple-500")}
                      </div>
                    </div>
                    {feedbacks[idx].overall_feedback && (
                      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                        <p className="text-gray-700">{feedbacks[idx].overall_feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/history")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-5 w-5" />
              View History
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnswerForCurrent = answers[currentQuestionIndex] !== undefined;
  const hasFeedbackForCurrent = feedbacks[currentQuestionIndex] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Question {currentQuestionIndex + 1}</h2>
          </div>
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="text-lg text-gray-800 leading-relaxed flex-1">{currentQuestion}</p>
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
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0"
                title={
                  playingAudio[`question_${currentQuestionIndex}`]
                    ? "Stop audio"
                    : "Play question audio"
                }
              >
                {playingAudio[`question_${currentQuestionIndex}`] ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span className="hidden sm:inline">Play</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Answer Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Your Answer</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">or</span>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isRecording
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4" />
                      <span>Stop Recording</span>
                      <span className="text-xs">({recordingTime}s)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Record Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Transcribed text display */}
            {transcribedText && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Transcribed:</strong> {transcribedText}
                </p>
              </div>
            )}

            {/* Recorded audio preview */}
            {recordedAudio && !transcribedText && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-green-600" />
                <audio
                  src={URL.createObjectURL(recordedAudio)}
                  controls
                  className="flex-1"
                />
                <button
                  onClick={handleSubmitVoiceAnswer}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Submit Voice Answer"}
                </button>
              </div>
            )}

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here... Be detailed and specific. Or use the Record Answer button above."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              rows="8"
              disabled={loading}
            />
            <div className="mt-2 text-sm text-gray-500">{currentAnswer.length} characters</div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              {error}
            </div>
          )}

          {/* Previous Answer Feedback */}
          {hasAnswerForCurrent && hasFeedbackForCurrent && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Feedback
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  {renderScoreBar(
                    feedbacks[currentQuestionIndex].correctness,
                    "Correctness",
                    "bg-green-500"
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  {renderScoreBar(feedbacks[currentQuestionIndex].clarity, "Clarity", "bg-blue-500")}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  {renderScoreBar(
                    feedbacks[currentQuestionIndex].confidence,
                    "Confidence",
                    "bg-purple-500"
                  )}
                </div>
              </div>
              {feedbacks[currentQuestionIndex].overall_feedback && (
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex items-start gap-2">
                    <p className="text-gray-700 flex-1">{feedbacks[currentQuestionIndex].overall_feedback}</p>
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
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0 ml-2"
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
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !currentAnswer.trim() || saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default SequentialInterview;

