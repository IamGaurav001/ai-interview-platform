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
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Starting your interview...</p>
        </div>
      </div>
    );
  }

  if (isComplete && summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center mb-6">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete! 🎉</h1>
            <p className="text-lg text-gray-600 mb-6">
              You answered {questionCount} questions. Here's your comprehensive evaluation:
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Score: {summary.overallScore}/10</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {summary.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {summary.weaknesses?.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{summary.summary}</p>
            </div>

            {summary.recommendations && summary.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <ArrowRight className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {questionCount} of ~15-25
            </span>
            <span className="text-sm font-medium text-gray-700">
              {questionCount >= 25 ? "Maximum Reached" : questionCount >= 15 ? "Near Completion" : "Interview in Progress"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((questionCount / 25) * 100, 100)}%` }}
            />
          </div>
          {questionCount >= 20 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Interview is approaching completion. You can end it anytime using the "End Interview" button.
            </p>
          )}
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Question {questionCount}</h2>
          </div>
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="text-lg text-gray-800 leading-relaxed flex-1">{currentQuestion}</p>
            <button
              onClick={() => {
                if (isPlayingQuestion) {
                  stopAudio("question");
                } else {
                  playAudio(questionAudioUrl, "question", currentQuestion);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0"
              title={isPlayingQuestion ? "Stop audio" : "Play question audio"}
            >
              {isPlayingQuestion ? (
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
          </div>

          {/* Feedback from previous answer */}
          {feedback && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-700">{feedback}</p>
                </div>
                <button
                  onClick={() => {
                    if (isPlayingFeedback) {
                      stopAudio("feedback");
                    } else {
                      playAudio(feedbackAudioUrl, "feedback", feedback);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0 ml-2"
                  title={isPlayingFeedback ? "Stop audio" : "Play feedback audio"}
                >
                  {isPlayingFeedback ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Answer Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Your Answer</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">or</span>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || isComplete}
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
              placeholder="Type your detailed answer here... Be specific and provide examples. Or use the Record Answer button above."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              rows="8"
              disabled={loading || isComplete}
            />
            <div className="mt-2 text-sm text-gray-500">{currentAnswer.length} characters</div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center gap-4">
            <button
              onClick={handleEndInterview}
              disabled={loading || isComplete || saving}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="h-4 w-4" />
              End Interview
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !currentAnswer.trim() || currentAnswer.trim().length < 10 || isComplete}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : isComplete ? (
                <>
                  <Trophy className="h-5 w-5" />
                  Interview Complete
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    msg.role === "interviewer"
                      ? "bg-primary-50 border border-primary-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "interviewer"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {msg.role === "interviewer" ? "I" : "Y"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {msg.role === "interviewer" ? "Interviewer" : "You"}
                      </p>
                      <p className="text-gray-800">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewFlow;

