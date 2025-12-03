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
  Filter,
  Search,
  Clock,
  ArrowRight,
  BarChart3,
  Sparkles
} from "lucide-react";
import Loader from "../components/Loader";
import PageLayout from "../components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../components/SEO";

const getConfidenceBadge = (score) => {
  const numScore = parseFloat(score);
  if (numScore >= 8) {
    return (
      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full flex items-center gap-2 border border-emerald-200">
        <TrendingUp className="h-4 w-4" /> Strong
      </span>
    );
  } else if (numScore >= 5) {
    return (
      <span className="px-4 py-1.5 bg-amber-100 text-amber-800 text-sm font-bold rounded-full flex items-center gap-2 border border-amber-200">
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Average
      </span>
    );
  } else {
    return (
      <span className="px-4 py-1.5 bg-red-100 text-red-800 text-sm font-bold rounded-full flex items-center gap-2 border border-red-200">
        <AlertCircle className="h-4 w-4" /> Weak
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

const ReadMoreText = ({ text, limit = 150, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  if (text.length <= limit) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className={className}>
      <p className="inline">
        {isExpanded ? text : `${text.slice(0, limit)}...`}
      </p>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="ml-1 text-blue-600 font-bold text-sm hover:underline focus:outline-none inline-flex items-center gap-0.5"
      >
        {isExpanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
};

const History = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSessions, setExpandedSessions] = useState({});
  const [filterDomain, setFilterDomain] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res.data);
    } catch (err) {
      setError("Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  const processedSessions = useMemo(() => {
    if (!history || !history.groupedHistory) return [];

    let flat = [];
    Object.keys(history.groupedHistory).forEach((domain) => {
      history.groupedHistory[domain].forEach((session) => {
        flat.push({ ...session, domain });
      });
    });

    if (filterDomain !== "All") {
      flat = flat.filter(s => s.domain === filterDomain);
    }

    return flat.sort((a, b) => {
      if (sortBy === "score") {
        return parseFloat(b.score || 0) - parseFloat(a.score || 0);
      }
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [history, filterDomain, sortBy]);

  const stats = useMemo(() => {
    if (!processedSessions.length) return { avg: 0, total: 0, best: null };
    
    const totalScore = processedSessions.reduce((sum, s) => sum + parseFloat(s.score || 0), 0);
    const avg = (totalScore / processedSessions.length).toFixed(1);
    
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

  if (loading) return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader />
      </div>
    </PageLayout>
  );

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-2xl border border-red-100 max-w-lg">
            <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Error Loading History</h3>
            <p className="text-slate-600 mb-8 text-lg">{error}</p>
            <button onClick={fetchHistory} className="px-8 py-3 bg-[#1d2f62] text-white rounded-xl font-bold hover:bg-[#1d2f62]/90 transition-all shadow-lg hover:shadow-xl">
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!history || history.total === 0) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
           {/* Background Blobs */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-xl relative z-10"
          >
            <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white">
              <div className="h-24 w-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <MessageSquare className="h-12 w-12 text-[#1d2f62]" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">No Interviews Yet</h2>
              <p className="text-slate-600 mb-10 text-xl leading-relaxed">
                Start your first AI interview to track your progress and get detailed feedback tailored to you.
              </p>
              <a
                href="/upload-resume"
                className="inline-flex items-center px-10 py-5 bg-[#1d2f62] text-white rounded-2xl font-bold text-lg hover:bg-[#1d2f62]/90 hover:shadow-2xl hover:shadow-[#1d2f62]/30 hover:-translate-y-1 transition-all"
              >
                Start Interview <ArrowRight className="ml-3 h-6 w-6" />
              </a>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO title="Interview History" description="Review your past interview sessions, scores, and detailed AI feedback." />
      
      <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center lg:text-left"
          >
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 border border-slate-100 lg:hidden">
              <BarChart3 className="h-6 w-6 text-[#1d2f62]" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Interview History
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 font-medium max-w-2xl">
              Track your progress, analyze your performance, and review detailed AI feedback.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            <SummaryCard 
              title="Total Interviews" 
              value={stats.total} 
              icon={MessageSquare} 
              delay={0.1}
            />
            <SummaryCard 
              title="Average Score" 
              value={stats.avg}
              suffix="/10"
              icon={Trophy} 
              delay={0.2}
            />
            <SummaryCard 
              title="Best Session" 
              value={stats.best ? parseFloat(stats.best.score).toFixed(1) : "N/A"} 
              suffix={stats.best ? "/10" : ""}
              subValue={stats.best?.domain}
              icon={Star} 
              delay={0.3}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-2 pl-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white">
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 font-bold text-sm uppercase tracking-wider">Filter</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-100/50 p-1.5 rounded-[1.5rem]">
              <span className="text-sm text-slate-500 font-bold pl-4">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1d2f62] shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="date">Most Recent</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
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
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const SummaryCard = ({ title, value, suffix, subValue, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 bg-white border border-white group hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors duration-500" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-[#1d2f62] group-hover:border-[#1d2f62] transition-colors duration-300">
            <Icon className="h-6 w-6 text-[#1d2f62] group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
        
        <div>
          <h3 className="text-5xl font-bold mb-1 tracking-tight text-slate-900">
            {value}<span className="text-2xl text-slate-400 font-medium">{suffix}</span>
          </h3>
          <p className="text-base font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          {subValue && (
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
              {subValue}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ExecutiveSummarySection = ({ summary, strengths, weaknesses }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
      
      <div 
        className="p-5 sm:p-6 lg:p-8 cursor-pointer flex justify-between items-center gap-4 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" /> Executive Summary
        </h4>
        
        <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:bg-blue-100 ${isOpen ? "rotate-180" : ""}`}>
           <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-5 sm:p-6 lg:px-8 pb-6 lg:pb-8 pt-0">
               <ReadMoreText text={summary} limit={200} className="text-slate-700 leading-relaxed text-base lg:text-lg" />
               
               {(strengths?.length > 0 || weaknesses?.length > 0) && (
                  <div className="mt-6 lg:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {strengths?.length > 0 && (
                        <FeedbackSection
                          title="Key Strengths"
                          icon={CheckCircle2}
                          items={strengths}
                          color="emerald"
                        />
                      )}
                      {weaknesses?.length > 0 && (
                        <FeedbackSection
                          title="Growth Areas"
                          icon={TrendingUp}
                          items={weaknesses}
                          color="amber"
                        />
                      )}
                  </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 hover:scale-[1.005]"
    >
      <div 
        onClick={onToggle}
        className="p-5 sm:p-6 lg:p-8 cursor-pointer bg-white group"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-8">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className={`h-20 w-20 lg:h-24 lg:w-24 rounded-[2rem] flex flex-col items-center justify-center border-4 shadow-inner ${
              sessionScore >= 8 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
              sessionScore >= 5 ? "bg-amber-50 border-amber-100 text-amber-700" :
              "bg-red-50 border-red-100 text-red-700"
            }`}>
              <span className="text-2xl lg:text-3xl font-bold">{sessionScore.toFixed(1)}</span>
              <span className="text-[10px] lg:text-xs font-bold uppercase opacity-70">Score</span>
            </div>
          </div>
            
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 truncate group-hover:text-[#1d2f62] transition-colors">
                {session.domain || "Resume"} Interview
              </h3>
              {getConfidenceBadge(sessionScore)}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm lg:text-base text-slate-500 font-medium">
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatSessionDate(session)}
              </span>
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Clock className="h-4 w-4 text-slate-400" />
                {questionCount} Questions
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0">
            <div className="hidden lg:flex flex-col items-end gap-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance</div>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-8 rounded-full transition-all duration-500 ${
                      (i + 1) * 2 <= sessionScore 
                        ? sessionScore >= 8 ? "bg-emerald-500 shadow-sm shadow-emerald-200" : sessionScore >= 5 ? "bg-amber-500 shadow-sm shadow-amber-200" : "bg-red-500 shadow-sm shadow-red-200"
                        : "bg-slate-100"
                    }`} 
                  />
                ))}
              </div>
            </div>
            
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              isExpanded 
                ? "bg-[#1d2f62] border-[#1d2f62] text-white rotate-180 shadow-lg shadow-[#1d2f62]/30" 
                : "bg-white border-slate-100 text-slate-400 group-hover:border-[#1d2f62] group-hover:text-[#1d2f62]"
            }`}>
              <ChevronDown className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-6 lg:p-10 space-y-8 lg:space-y-10">

              {summaryFeedback.summary && (
                <ExecutiveSummarySection 
                  summary={summaryFeedback.summary}
                  strengths={summaryFeedback.strengths}
                  weaknesses={summaryFeedback.weaknesses}
                />
              )}

              {session.questions && session.questions.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs">Q&A</div>
                    Detailed Analysis
                  </h4>
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
    <div className={`bg-white rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:border-blue-200'}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 lg:p-6 flex items-start gap-4 lg:gap-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Q{index + 1}
        </div>
        <div className="flex-1">
          <p className="text-slate-900 font-bold text-lg leading-snug">{question}</p>
        </div>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 transition-transform duration-300 ${isOpen ? "rotate-180 bg-blue-50 border-blue-100 text-blue-600" : "text-slate-400"}`}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100"
          >
            <div className="p-5 sm:p-6 lg:p-8 lg:pl-20 space-y-6 bg-slate-50/30">
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Answer</h5>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 text-slate-700 text-base leading-relaxed shadow-sm">
                  {answer ? (
                    <ReadMoreText text={answer} limit={300} />
                  ) : (
                    <span className="text-slate-400 italic">No answer recorded</span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">AI Feedback</h5>
                <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100">
                  <ReadMoreText text={feedbackText} limit={300} className="text-slate-800 text-base leading-relaxed mb-6 font-medium" />
                  
                  {(scores.correctness !== undefined || scores.clarity !== undefined) && (
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(scores).map(([key, val]) => val !== undefined && (
                        <div key={key} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                          <span className="text-xs font-bold text-slate-500 capitalize tracking-wide">{key}</span>
                          <div className="h-4 w-px bg-slate-200" />
                          <span className={`text-sm font-bold ${
                            val >= 8 ? "text-emerald-600" : val >= 5 ? "text-amber-600" : "text-red-600"
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

const FeedbackSection = ({ title, icon: Icon, items, color }) => {
  const colors = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    blue: "text-blue-700 bg-blue-50 border-blue-100"
  };

  const iconColors = {
    emerald: "text-emerald-600 bg-emerald-100",
    amber: "text-amber-600 bg-amber-100",
    blue: "text-blue-600 bg-blue-100"
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color] || colors.blue}`}>
      <h5 className="text-sm font-bold uppercase flex items-center gap-3 mb-4 tracking-wide">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconColors[color] || iconColors.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
        {title}
      </h5>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm font-medium flex items-start gap-3 leading-relaxed opacity-90">
            <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;