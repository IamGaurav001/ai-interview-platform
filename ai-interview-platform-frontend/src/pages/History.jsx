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
  Filter,
  Search,
  Clock,
  ArrowRight
} from "lucide-react";
import Loader from "../components/Loader";
import { motion, AnimatePresence } from "framer-motion";

// --- Utility Functions ---

const getConfidenceBadge = (score) => {
  const numScore = parseFloat(score);
  if (numScore >= 8) {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
        <TrendingUp className="h-3 w-3" /> Strong
      </span>
    );
  } else if (numScore >= 5) {
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-yellow-500" /> Average
      </span>
    );
  } else {
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Weak
      </span>
    );
  }
};

const formatSessionDate = (session) => {
  const dateStr = session.createdAt || session.date;
  if (!dateStr) return "Date not available";

  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (e) {
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

// --- Main Component ---

const History = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSessions, setExpandedSessions] = useState({});
  const [filterDomain, setFilterDomain] = useState("All");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'score'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error("History error:", err);
      setError("Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  // Process sessions
  const processedSessions = useMemo(() => {
    if (!history || !history.groupedHistory) return [];

    let flat = [];
    Object.keys(history.groupedHistory).forEach((domain) => {
      history.groupedHistory[domain].forEach((session) => {
        flat.push({ ...session, domain });
      });
    });

    // Filter
    if (filterDomain !== "All") {
      flat = flat.filter(s => s.domain === filterDomain);
    }

    // Sort
    return flat.sort((a, b) => {
      if (sortBy === "score") {
        return parseFloat(b.score || 0) - parseFloat(a.score || 0);
      }
      // Default by date
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [history, filterDomain, sortBy]);

  // Get unique domains for filter
  const availableDomains = useMemo(() => {
    if (!history || !history.groupedHistory) return ["All"];
    return ["All", ...Object.keys(history.groupedHistory)];
  }, [history]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!processedSessions.length) return { avg: 0, total: 0, best: null };
    
    const totalScore = processedSessions.reduce((sum, s) => sum + parseFloat(s.score || 0), 0);
    const avg = (totalScore / processedSessions.length).toFixed(1);
    
    // Find best session in current view
    const best = processedSessions.reduce((max, s) => 
      parseFloat(s.score) > parseFloat(max.score || 0) ? s : max
    , processedSessions[0]);

    return { avg, total: processedSessions.length, best };
  }, [processedSessions]);

  const toggleSession = (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading History</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={fetchHistory} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!history || history.total === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Interviews Yet</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Start your first AI interview to track your progress and get detailed feedback.
            </p>
            <a
              href="/upload-resume"
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Interview <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Interview History</h1>
          <p className="text-lg text-slate-600">Track your progress and review AI feedback</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <SummaryCard 
            title="Total Interviews" 
            value={stats.total} 
            icon={MessageSquare} 
            color="blue" 
            delay={0.1}
          />
          <SummaryCard 
            title="Average Score" 
            value={`${stats.avg}/10`} 
            icon={Trophy} 
            color="purple" 
            delay={0.2}
          />
          <SummaryCard 
            title="Best Session" 
            value={stats.best ? `${parseFloat(stats.best.score).toFixed(1)}/10` : "N/A"} 
            subValue={stats.best?.domain}
            icon={Star} 
            color="yellow" 
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">Most Recent</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </div>

        {/* Session List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {processedSessions.map((session, index) => (
              <SessionCard
                key={session.id || index}
                session={session}
                index={index}
                isExpanded={!!expandedSessions[session.id]}
                onToggle={() => toggleSession(session.id)}
              />
            ))}
          </AnimatePresence>
          
          {processedSessions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No interviews found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, subValue, icon: Icon, color, delay }) => {
  const colors = {
    blue: "bg-blue-50 text-orange-600 border-blue-100",
    purple: "bg-purple-50 text-red-500 border-purple-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          {subValue && <p className="text-sm font-medium text-slate-400 mt-1">{subValue}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

const SessionCard = ({ session, index, isExpanded, onToggle }) => {
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div 
        onClick={onToggle}
        className="p-6 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border ${
              sessionScore >= 8 ? "bg-green-50 border-green-100 text-green-700" :
              sessionScore >= 5 ? "bg-yellow-50 border-yellow-100 text-yellow-700" :
              "bg-red-50 border-red-100 text-red-700"
            }`}>
              <span className="text-2xl font-bold">{sessionScore.toFixed(1)}</span>
              <span className="text-[10px] font-bold uppercase opacity-80">Score</span>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-slate-900">{session.domain || "Resume"} Interview</h3>
                {getConfidenceBadge(sessionScore)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatSessionDate(session)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {questionCount} Questions
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end gap-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-6 rounded-full ${
                      (i + 1) * 2 <= sessionScore 
                        ? sessionScore >= 8 ? "bg-green-500" : sessionScore >= 5 ? "bg-yellow-500" : "bg-red-500"
                        : "bg-slate-200"
                    }`} 
                  />
                ))}
              </div>
            </div>
            <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? "bg-slate-100 rotate-180" : "bg-white"}`}>
              <ChevronDown className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-6 space-y-8">
              {/* Summary Section */}
              {summaryFeedback.summary && (
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                  <h4 className="text-sm font-bold text-orange-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" /> Executive Summary
                  </h4>
                  <p className="text-orange-900 leading-relaxed">{summaryFeedback.summary}</p>
                  
                  {(summaryFeedback.strengths || summaryFeedback.weaknesses) && (
                    <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-orange-100/50">
                      {summaryFeedback.strengths?.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Key Strengths
                          </h5>
                          <ul className="space-y-2">
                            {summaryFeedback.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summaryFeedback.weaknesses?.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-orange-700 uppercase mb-3 flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" /> Growth Areas
                          </h5>
                          <ul className="space-y-2">
                            {summaryFeedback.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Questions Accordion */}
              {session.questions && session.questions.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Detailed Q&A Analysis</h4>
                  <div className="space-y-4">
                    {session.questions.map((q, qIdx) => (
                      <QuestionItem 
                        key={qIdx} 
                        question={q} 
                        answer={session.answers?.[qIdx]} 
                        feedback={getQuestionFeedback(session, qIdx)} 
                        index={qIdx} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const QuestionItem = ({ question, answer, feedback, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const feedbackText = feedback?.overall_feedback || feedback?.summary || feedback?.feedback || "No detailed feedback available.";
  const scores = {
    correctness: feedback?.correctness,
    clarity: feedback?.clarity,
    confidence: feedback?.confidence
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
          Q{index + 1}
        </div>
        <div className="flex-1">
          <p className="text-slate-900 font-medium leading-snug">{question}</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100"
          >
            <div className="p-4 pl-16 space-y-4 bg-slate-50/30">
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Your Answer</h5>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 text-sm leading-relaxed">
                  {answer || <span className="text-slate-400 italic">No answer recorded</span>}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">AI Feedback</h5>
                <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                  <p className="text-slate-800 text-sm leading-relaxed mb-3">{feedbackText}</p>
                  
                  {(scores.correctness !== undefined || scores.clarity !== undefined) && (
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(scores).map(([key, val]) => val !== undefined && (
                        <div key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
                          <span className="text-xs font-semibold text-slate-500 capitalize">{key}</span>
                          <span className={`text-xs font-bold ${
                            val >= 8 ? "text-green-600" : val >= 5 ? "text-yellow-600" : "text-red-600"
                          }`}>{val}/10</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;