import React, { useEffect, useState } from "react";
import { getHistory } from "../api/interviewAPI";
import { Clock, TrendingUp, MessageSquare, Calendar, ChevronDown, ChevronUp, Trophy, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import Loader from "../components/Loader";

const History = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSessions, setExpandedSessions] = useState({});
  const [viewMode, setViewMode] = useState("sessions"); // "sessions" or "domains"

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res.data);
      // Expand first session by default
      if (res.data.sessions && res.data.sessions.length > 0) {
        setExpandedSessions({ [res.data.sessions[0].id]: true });
      }
    } catch (err) {
      console.error("History error:", err);
      if (err.networkError) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Failed to load interview history");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Flatten all sessions from all domains
  const getAllSessions = () => {
    if (!history || !history.groupedHistory) return [];
    const allSessions = [];
    Object.keys(history.groupedHistory).forEach(domain => {
      history.groupedHistory[domain].forEach(session => {
        allSessions.push({ ...session, domain });
      });
    });
    // Sort by date (newest first) - use createdAt if available, otherwise parse date string
    return allSessions.sort((a, b) => {
      let dateA, dateB;
      if (a.createdAt) {
        dateA = new Date(a.createdAt);
      } else if (a.date) {
        // Try to parse the date string
        dateA = new Date(a.date);
      } else {
        dateA = new Date(0);
      }
      
      if (b.createdAt) {
        dateB = new Date(b.createdAt);
      } else if (b.date) {
        dateB = new Date(b.date);
      } else {
        dateB = new Date(0);
      }
      
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getConfidenceBadge = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
          🟢 Strong
        </span>
      );
    } else if (numScore >= 5) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          🟡 Average
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
          🔴 Weak
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!history || history.total === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Interview History</h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and start practicing interviews to see your history here.
            </p>
            <a
              href="/upload-resume"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Upload Resume
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview History</h1>
          <p className="text-lg text-gray-600">
            Review your past interviews and track your progress
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{history.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Domains Covered</p>
                <p className="text-3xl font-bold text-gray-900">{history.summary?.length || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {history.summary && history.summary.length > 0
                    ? (
                        history.summary.reduce(
                          (sum, s) => sum + parseFloat(s.averageScore),
                          0
                        ) / history.summary.length
                      ).toFixed(1)
                    : "0.0"}
                  /10
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setViewMode("sessions")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "sessions"
                  ? "bg-primary-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              By Session
            </button>
            <button
              onClick={() => setViewMode("domains")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "domains"
                  ? "bg-primary-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              By Domain
            </button>
          </div>
        </div>

        {/* Sessions View - Clear Session-by-Session Display */}
        {viewMode === "sessions" && (
          <div className="space-y-6">
            {getAllSessions().map((session) => {
              const isExpanded = expandedSessions[session.id];
              const sessionScore = parseFloat(session.score || 0);
              const sessionFeedback = session.feedback || {};
              const summaryFeedback = sessionFeedback.summary || {};
              
              // Get question count
              const questionCount = session.questions?.length || 0;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden"
                >
                  {/* Session Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 border-b-2 border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-14 w-14 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              Interview Session #{getAllSessions().indexOf(session) + 1}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {session.date || (session.createdAt ? new Date(session.createdAt).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }) : "Date not available")}
                              </span>
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {questionCount} Questions
                              </span>
                              <span className="text-sm font-medium text-primary-700">
                                {session.domain || "Resume-Based"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Session Score Card */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Overall Score</span>
                              {getConfidenceBadge(sessionScore)}
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-gray-900">
                                {sessionScore.toFixed(1)}
                              </span>
                              <span className="text-lg text-gray-500">/10</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  sessionScore >= 8
                                    ? "bg-green-500"
                                    : sessionScore >= 5
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${(sessionScore / 10) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Summary Scores if available */}
                          {summaryFeedback.technicalDepth !== undefined && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <span className="text-sm font-medium text-gray-600 block mb-2">
                                Technical Depth
                              </span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {summaryFeedback.technicalDepth?.toFixed(1) || "N/A"}
                                </span>
                                <span className="text-sm text-gray-500">/10</span>
                              </div>
                            </div>
                          )}

                          {summaryFeedback.problemSolving !== undefined && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <span className="text-sm font-medium text-gray-600 block mb-2">
                                Problem Solving
                              </span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {summaryFeedback.problemSolving?.toFixed(1) || "N/A"}
                                </span>
                                <span className="text-sm text-gray-500">/10</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Session Summary Feedback */}
                        {summaryFeedback.summary && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <Star className="h-5 w-5 text-blue-600" />
                              Session Summary
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {summaryFeedback.summary}
                            </p>
                          </div>
                        )}

                        {/* Strengths and Weaknesses */}
                        {(summaryFeedback.strengths || summaryFeedback.weaknesses) && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summaryFeedback.strengths && summaryFeedback.strengths.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  Strengths
                                </h4>
                                <ul className="space-y-1">
                                  {summaryFeedback.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-green-600 mt-1">•</span>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {summaryFeedback.weaknesses && summaryFeedback.weaknesses.length > 0 && (
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-orange-600" />
                                  Areas for Improvement
                                </h4>
                                <ul className="space-y-1">
                                  {summaryFeedback.weaknesses.map((weakness, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-orange-600 mt-1">•</span>
                                      <span>{weakness}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleSession(session.id)}
                        className="ml-4 p-2 rounded-lg hover:bg-white/50 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Session Details */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Questions and Answers */}
                      {session.questions && session.questions.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary-600" />
                            Questions & Answers ({questionCount})
                          </h4>
                          <div className="space-y-4">
                            {session.questions.map((q, qIdx) => {
                              const answer = session.answers?.[qIdx];
                              const feedback = Array.isArray(sessionFeedback.all) 
                                ? sessionFeedback.all[qIdx] 
                                : (qIdx === 0 ? sessionFeedback : null);

                              return (
                                <div key={qIdx} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full">
                                        Q{qIdx + 1}
                                      </span>
                                      <h5 className="font-semibold text-gray-900">Question</h5>
                                    </div>
                                    <p className="text-gray-800 ml-12">{q}</p>
                                  </div>

                                  {answer && (
                                    <div className="mb-4 ml-12">
                                      <h5 className="font-semibold text-gray-900 mb-2">Your Answer</h5>
                                      <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
                                        {answer}
                                      </p>
                                    </div>
                                  )}

                                  {feedback && (
                                    <div className="ml-12 bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3">Feedback</h5>
                                      {feedback.correctness !== undefined && (
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 mb-1">Correctness</div>
                                            <div className="text-lg font-bold text-green-600">
                                              {feedback.correctness}/10
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 mb-1">Clarity</div>
                                            <div className="text-lg font-bold text-blue-600">
                                              {feedback.clarity}/10
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 mb-1">Confidence</div>
                                            <div className="text-lg font-bold text-purple-600">
                                              {feedback.confidence}/10
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {feedback.overall_feedback && (
                                        <p className="text-sm text-gray-700 border-t border-gray-200 pt-3">
                                          {feedback.overall_feedback}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {summaryFeedback.recommendations && summaryFeedback.recommendations.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {summaryFeedback.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-purple-600 mt-1">→</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Domain View - Original Grouped View */}
        {viewMode === "domains" && (
        <div className="space-y-4">
          {history.summary?.map((summary) => {
            const domainSessions = history.groupedHistory[summary.domain] || [];

            return (
              <div
                key={summary.domain}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                  <div className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                      <div>
                      <h3 className="text-xl font-bold text-gray-900">{summary.domain}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                            {summary.totalAttempts} session{summary.totalAttempts !== 1 ? "s" : ""}
                        </span>
                          <span className="text-sm font-semibold text-gray-900">
                            Avg Score: {summary.averageScore}/10
                        </span>
                        {getConfidenceBadge(summary.averageScore)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {domainSessions.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">No sessions found</p>
                    ) : (
                      domainSessions.map((session) => {
                        const isSessionExpanded = expandedSessions[session.id];
                        const sessionScore = parseFloat(session.score || 0);

                        return (
                          <div
                            key={session.id}
                            className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleSession(session.id)}
                              className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      Score: {sessionScore.toFixed(1)}/10
                                    </span>
                                    {getConfidenceBadge(sessionScore)}
                                    <span className="text-sm text-gray-500">
                                      {session.questions?.length || 0} questions
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {session.date}
                                  </span>
                                </div>
                              </div>
                              {isSessionExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </button>

                            {isSessionExpanded && (
                              <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
                                {session.questions?.map((q, qIdx) => (
                                  <div key={qIdx} className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      Question {qIdx + 1}:
                                    </h4>
                                    <p className="text-gray-700 mb-3">{q}</p>
                                    {session.answers?.[qIdx] && (
                                      <>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                          Your Answer:
                                        </h4>
                                        <p className="text-gray-700 mb-3 bg-white p-3 rounded border">
                                          {session.answers[qIdx]}
                                        </p>
                                      </>
                                    )}
                                    {session.feedback && (
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                          Feedback:
                                        </h4>
                                        {session.feedback.correctness !== undefined && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            Correctness: {session.feedback.correctness}/10
                                          </p>
                                        )}
                                        {session.feedback.clarity !== undefined && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            Clarity: {session.feedback.clarity}/10
                                          </p>
                                        )}
                                        {session.feedback.confidence !== undefined && (
                                          <p className="text-sm text-gray-600 mb-1">
                                            Confidence: {session.feedback.confidence}/10
                                          </p>
                                        )}
                                        {session.feedback.overall_feedback && (
                                          <p className="text-gray-700 mt-2">
                                            {session.feedback.overall_feedback}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};

export default History;
