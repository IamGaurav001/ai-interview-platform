import React, { useEffect, useState, useMemo } from "react";
import { getHistory } from "../api/interviewAPI";
import {
  TrendingUp,
  MessageSquare,
  Calendar,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Loader from "../components/Loader";


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

const formatSessionDate = (session) => {
  const dateStr = session.createdAt || session.date;
  if (!dateStr) return "Date not available";

  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "Pm" : "Am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${day} ${month} ${displayHours}:${displayMinutes}${ampm}`;
  } catch (e) {
    console.error("Invalid date format:", dateStr);
    return "Invalid date";
  }
};

const isFeedbackObject = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const hasFeedbackProps = ('correctness' in obj) || 
                        ('clarity' in obj) || 
                        ('confidence' in obj) || 
                        ('overall_feedback' in obj && typeof obj.overall_feedback === 'string' && obj.overall_feedback.length > 0) ||
                        ('feedback' in obj && typeof obj.feedback === 'string' && obj.feedback.length > 0);
  if (!hasFeedbackProps) return false;
  const isSummary = ('overallScore' in obj) || 
                  ('strengths' in obj && Array.isArray(obj.strengths) && obj.strengths.length > 0);
  return !isSummary;
};


const isSummaryObject = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return 'overallScore' in obj || 
         'strengths' in obj || 
         'weaknesses' in obj ||
         'summary' in obj ||
         'recommendations' in obj;
};


const getQuestionFeedback = (session, qIdx) => {
  const feedbackRoot = session.feedback || {};

  // Priority 1: `feedbackRoot.all` array
  if (Array.isArray(feedbackRoot.all)) {
    const feedbackItem = feedbackRoot.all[qIdx];
    if (feedbackItem && isFeedbackObject(feedbackItem)) {
      return feedbackItem;
    }
  }


  if (session.questions?.length === 1 && qIdx === 0 && isFeedbackObject(feedbackRoot)) {
    return feedbackRoot;
  }

  return null;
};


// --- Main History Component ---

const History = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSessions, setExpandedSessions] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  // Memoize the flattened and sorted list of all sessions
  const allSessions = useMemo(() => {
    if (!history || !history.groupedHistory) return [];

    const flat = [];
    Object.keys(history.groupedHistory).forEach((domain) => {
      history.groupedHistory[domain].forEach((session) => {
        flat.push({ ...session, domain });
      });
    });

    // Sort by date (newest first)
    return flat.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [history]);


  const { averageScore, bestDomain } = useMemo(() => {
    if (!allSessions || allSessions.length === 0) {
      return { averageScore: "0.0", bestDomain: null };
    }

    const totalScore = allSessions.reduce((sum, s) => sum + parseFloat(s.score || 0), 0);
    const avg = (totalScore / allSessions.length).toFixed(1);

    let best = null;
    if (history?.summary && history.summary.length > 0) {
      best = history.summary.reduce((max, s) => 
        parseFloat(s.averageScore) > parseFloat(max.averageScore) ? s : max, 
        history.summary[0]
      );
    }
    
    return { averageScore: avg, bestDomain: best };
  }, [allSessions, history?.summary]);


  // Set the default expanded session *after* allSessions is calculated
  useEffect(() => {
    if (allSessions.length > 0 && Object.keys(expandedSessions).length === 0) {
      if (allSessions[0].id) {
        setExpandedSessions({ [allSessions[0].id]: true });
      }
    }

  }, [allSessions, expandedSessions]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error("History error:", err);
      if (err.networkError) {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load interview history"
        );
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Interview History
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and start practicing interviews to see your
              history here.
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interview History
          </h1>
          <p className="text-lg text-gray-600">
            Review your past interviews and track your progress
          </p>
        </div>

        {/* ENHANCED: Pass new props to summary cards */}
        <HistorySummaryCards
          total={history.total}
          averageScore={averageScore}
          bestDomain={bestDomain}
        />

        <SessionView
          allSessions={allSessions}
          expandedSessions={expandedSessions}
          onToggle={toggleSession}
        />
      </div>
    </div>
  );
};

const HistorySummaryCards = ({ total, averageScore, bestDomain }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Total Interviews */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Interviews
            </p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Card 2: Average Score (FIXED) */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1 ">
              Average Score
            </p>
            <p className="text-3xl font-bold text-gray-900  ">
              {averageScore}/10
            </p>
            
          </div>
          {/* FIXED: Changed icon from Calendar to Trophy */}
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Trophy className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      {/* Card 3: Best Domain (NEW) */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Best Domain
            </p>
            {bestDomain ? (
              <>
                <p className="text-xl font-bold text-gray-900 truncate">
                  {bestDomain.domain}
                </p>
                <p className="text-sm font-medium text-green-600">
                  {parseFloat(bestDomain.averageScore).toFixed(1)}/10 Avg
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-500">N/A</p>
            )}
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Child Component: SessionView (View Mode 1) ---

const SessionView = ({ allSessions, expandedSessions, onToggle }) => (
  <div className="space-y-6">
    {allSessions.map((session, index) => (
      <SessionCard
        key={session.id || index}
        session={session}
        // MODIFIED: Pass the *total count* for session numbering
        sessionIndex={allSessions.length - index}
        isExpanded={!!expandedSessions[session.id]}
        onToggle={() => onToggle(session.id)}
      />
    ))}
  </div>
);

const SessionCard = ({ session, sessionIndex, isExpanded, onToggle }) => {
  const sessionScore = parseFloat(session.score || 0);
  const sessionFeedback = session.feedback || {};
  
  let summaryFeedback = {};
  if (sessionFeedback.summary && typeof sessionFeedback.summary === 'object') {
    summaryFeedback = sessionFeedback.summary;
  } else if (sessionFeedback.summary) {
    summaryFeedback = { summary: sessionFeedback.summary };
  } else if (isSummaryObject(sessionFeedback)) {
    summaryFeedback = sessionFeedback;
  }
  
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
                  {/* MODIFIED: Show domain in title and use reverse index */}
                  {session.domain || "Resume"} Interview #{sessionIndex}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {/* REFACTORED: Use new utility function */}
                    {formatSessionDate(session)}
                  </span>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {questionCount} Ques
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
                  <span className="text-sm font-medium text-gray-600">
                    Overall Score
                  </span>
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
                {summaryFeedback.strengths &&
                  summaryFeedback.strengths.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {summaryFeedback.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 flex items-start gap-2"
                          >
                            <span className="text-green-600 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {summaryFeedback.weaknesses &&
                  summaryFeedback.weaknesses.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {summaryFeedback.weaknesses.map((weakness, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 flex items-start gap-2"
                          >
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
            onClick={onToggle}
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
          {/* Questions and Answers - USING YOUR NEW SNIPPET */}
          {session.questions && session.questions.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary-600" />
                Questions & Answers ({questionCount})
              </h4>
              <div className="space-y-4">
                {session.questions.map((q, qIdx) => {
                  const answer = session.answers?.[qIdx] || "";
                  
                  const qFeedback = getQuestionFeedback(session, qIdx);

                  const feedbackText =
                    qFeedback?.overall_feedback ||
                    qFeedback?.summary ||
                    qFeedback?.feedback ||
                    "";

                  const correctness = qFeedback?.correctness;
                  const clarity = qFeedback?.clarity;
                  const confidence = qFeedback?.confidence;

                  return (
                    // Your new Q&A item JSX
                    <div
                      key={qIdx}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                            Q{qIdx + 1}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="text-sm text-gray-700 mb-2">{q}</div>

                          <div className="text-xs text-gray-500 mb-1">
                            Your Answer
                          </div>
                          <div className="bg-gray-50 border rounded-md p-3 text-sm text-gray-800 mb-3">
                            {answer || "No answer available"}
                          </div>

                          <div className="text-xs text-gray-500 mb-1">
                            Feedback
                          </div>
                          <div className="bg-gray-50 border rounded-md p-3 text-sm text-gray-800">
                            {feedbackText || "No feedback available"}
                            {(correctness !== undefined ||
                              clarity !== undefined ||
                              confidence !== undefined) && (
                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                {correctness !== undefined && (
                                  <span className="px-2 py-1 bg-gray-100 rounded">{`Correctness: ${correctness}/10`}</span>
                                )}
                                {clarity !== undefined && (
                                  <span className="px-2 py-1 bg-gray-100 rounded">{`Clarity: ${clarity}/10`}</span>
                                )}
                                {confidence !== undefined && (
                                  <span className="px-2 py-1 bg-gray-100 rounded">{`Confidence: ${confidence}/10`}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summaryFeedback.recommendations &&
            summaryFeedback.recommendations.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {summaryFeedback.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
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
};


export default History;