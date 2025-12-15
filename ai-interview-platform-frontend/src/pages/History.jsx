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
  Sparkles,
  Target,
  Zap,
  BookOpen
} from "lucide-react";
import Loader from "../components/Loader";
import PageLayout from "../components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../components/SEO";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

// --- Utility Functions ---

const getConfidenceBadge = (score) => {
  const numScore = parseFloat(score);
  if (numScore >= 8) {
    return (
      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 border border-emerald-200">
        <TrendingUp className="h-3 w-3" /> Strong
      </span>
    );
  } else if (numScore >= 5) {
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center gap-1.5 border border-blue-200">
        <div className="h-2 w-2 rounded-full bg-blue-500" /> Good Progress
      </span>
    );
  } else {
    return (
      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5 border border-amber-200">
        <Target className="h-3 w-3" /> Needs Focus
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
        className="ml-1 text-blue-600 font-bold text-xs hover:underline focus:outline-none inline-flex items-center gap-0.5"
      >
        {isExpanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
};

// --- Components ---

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border ${
      active 
        ? "bg-[#1d2f62] text-white border-[#1d2f62] shadow-md shadow-[#1d2f62]/20" 
        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    {label}
  </button>
);

const TrendSparkline = ({ data, color = "#10b981" }) => {
  if (!data || data.length < 2) return null;
  
  const chartData = data.map((d, i) => ({ i, score: parseFloat(d.score || 0) })).reverse();

  return (
    <div className="h-10 w-full -mx-1 opacity-50 hover:opacity-100 transition-opacity duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke={color} 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const History = () => {
  const navigate = useNavigate();
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
      if (filterDomain === "Needs Focus") {
         flat = flat.filter(s => parseFloat(s.score || 0) < 5);
      } else {
         flat = flat.filter(s => s.domain === filterDomain);
      }
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
    if (!processedSessions.length) return { avg: 0, total: 0, best: null, trend: 0 };
    
    const scores = processedSessions.map(s => parseFloat(s.score || 0));
    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    const avg = (totalScore / processedSessions.length).toFixed(1);
    
    const best = processedSessions.reduce((max, s) => 
      parseFloat(s.score) > parseFloat(max.score || 0) ? s : max
    , processedSessions[0]);

    let trend = 0;
    if (processedSessions.length >= 2) {
       const sortedByDate = [...processedSessions].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
       const recentLength = Math.min(3, sortedByDate.length);
       const recent = sortedByDate.slice(-recentLength);
       const previous = sortedByDate.slice(0, -recentLength);
       
       const avgRecent = recent.reduce((a, b) => a + parseFloat(b.score || 0), 0) / recent.length;
       const avgPrevious = previous.length 
          ? previous.reduce((a, b) => a + parseFloat(b.score || 0), 0) / previous.length 
          : 0; 
          
       if (previous.length > 0) {
           trend = (avgRecent - avgPrevious).toFixed(1);
       }
    }

    const scoresForChart = processedSessions
        .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
        .map(s => ({ score: s.score || 0 }));

    return { avg, total: processedSessions.length, best, trend, scores: scoresForChart };
  }, [processedSessions]);

  const toggleSession = (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const getFilterOptions = () => {
    const base = ["All"];
    if (history?.groupedHistory) {
      base.push(...Object.keys(history.groupedHistory));
    }
    base.push("Needs Focus");
    return base;
  };

  if (loading) return (
    <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    </PageLayout>
  );

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100 max-w-md">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading History</h3>
            <p className="text-slate-600 mb-6 text-sm">{error}</p>
            <button onClick={fetchHistory} className="px-6 py-2.5 bg-[#1d2f62] text-white rounded-xl font-bold hover:bg-[#1d2f62]/90 transition-all text-sm shadow-lg">
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
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl pointer-events-none z-0">
            <div className="absolute top-20 left-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-lg relative z-10"
          >
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white">
              <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <MessageSquare className="h-10 w-10 text-[#1d2f62]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">No Interviews Yet</h2>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                Start your first AI interview to track your progress and get detailed feedback tailored to you.
              </p>
              <a
                href="/upload-resume"
                className="inline-flex items-center px-8 py-4 bg-[#1d2f62] text-white rounded-xl font-bold hover:bg-[#1d2f62]/90 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Start Interview <ArrowRight className="ml-2 h-5 w-5" />
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
      
      <div className="min-h-screen bg-slate-50/50 py-6 lg:py-10 relative overflow-hidden">
        {/* Background Blobs (Smaller) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-40 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Header Section (Compact) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 mb-1 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                 Performance Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Your Progress
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl">
                Track your growth, spot patterns, and master your interview skills.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button 
                onClick={() => navigate('/upload-resume')}
                className="w-full lg:w-auto px-6 py-3 bg-[#1d2f62] text-white rounded-xl font-bold text-sm sm:text-base hover:bg-[#1d2f62]/90 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                 <Zap className="h-4 w-4" /> Take Another Mock Interview
              </button>
            </motion.div>
          </div>

          {/* Metrics Grid (Compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
             {/* Best Session Card - Large */}
             <div className="md:col-span-2 lg:col-span-2">
                <SummaryCard 
                  title="Best Session" 
                  value={stats.best ? parseFloat(stats.best.score).toFixed(1) : "N/A"} 
                  suffix={stats.best ? "/10" : ""}
                  subValue={stats.best?.domain}
                  icon={Trophy} 
                  delay={0.1}
                  variant="primary"
                  trendLabel="Personal Record"
                />
             </div>
             
             {/* Trend / Average */}
             <SummaryCard 
                  title="Average Score" 
                  value={stats.avg}
                  suffix="/10"
                  icon={Target} 
                  delay={0.2}
                  trendValue={stats.trend}
                  trendLabel={parseFloat(stats.trend) >= 0 ? "Recent Improvement" : "Needs Attention"}
                  data={stats.scores} 
                  variant="trend"
            />
            
            {/* Total */}
             <SummaryCard 
                  title="Total Sprints" 
                  value={stats.total} 
                  icon={CheckCircle2} 
                  delay={0.3}
                  subValue="Completed"
            />
          </div>

          {/* Coaching Insight Section (Compact) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-gradient-to-br from-indigo-600 to-[#1d2f62] text-white rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-white/10">
                    <Sparkles className="h-3 w-3" /> Coach's Insight
                 </div>
                 <h2 className="text-xl sm:text-2xl font-bold mb-2">
                   {parseFloat(stats.trend) > 0 
                     ? "You're getting better! Keep the momentum."
                     : parseFloat(stats.avg) > 7 
                       ? "You're consistently strong. Challenge yourself."
                       : "Focus on consistency to boost confidence."}
                 </h2>
                 <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                    {stats.best?.domain 
                      ? `Your ${stats.best.domain} interviews are your strongest suit. Try focusing on your weaker areas next.` 
                      : "Review your valid feedback to identify key areas for improvement in your next session."}
                 </p>
               </div>
               <div className="flex-shrink-0">
                  <button 
                    onClick={() => navigate('/upload-resume')}
                    className="px-6 py-2.5 bg-white text-[#1d2f62] rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Start Targeted Practice
                  </button>
               </div>
             </div>
          </motion.div>

          {/* Filters & Sort (Compact) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
             <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mr-2">Filter:</span>
                {getFilterOptions().map(opt => (
                  <FilterChip 
                    key={opt} 
                    label={opt} 
                    active={filterDomain === opt} 
                    onClick={() => setFilterDomain(opt)} 
                  />
                ))}
             </div>

             <div className="flex items-center gap-3">
               <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Sort by:</span>
               <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1d2f62] cursor-pointer hover:bg-slate-50"
              >
                <option value="date">Most Recent</option>
                <option value="score">Score: High to Low</option>
              </select>
             </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
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
              <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
                <p className="text-slate-500 text-sm font-medium">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const SummaryCard = ({ title, value, suffix, subValue, icon: Icon, delay, variant = "default", trendValue, trendLabel, data }) => {
  const isPrimary = variant === "primary";
  const isTrend = variant === "trend";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-[2rem] p-5 sm:p-6 border group hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between h-full ${
        isPrimary 
          ? "bg-gradient-to-br from-[#1d2f62] to-[#2a407c] text-white border-[#1d2f62] shadow-lg shadow-[#1d2f62]/20" 
          : "bg-white border-slate-100 shadow-lg shadow-slate-200/50"
      }`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 ${
        isPrimary ? "bg-white/10" : "bg-slate-50 group-hover:bg-blue-50"
      }`} />
      
      <div className="relative z-10 flex justify-between items-start mb-3">
         <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${
           isPrimary 
            ? "bg-white/10 border-white/20 text-white" 
            : "bg-slate-50 border-slate-100 text-[#1d2f62] group-hover:bg-[#1d2f62] group-hover:border-[#1d2f62] group-hover:text-white"
         }`}>
           <Icon className="h-5 w-5" />
         </div>
         {trendValue !== undefined && trendValue !== 0 && (
           <div className={`text-xs font-bold ${
             parseFloat(trendValue) > 0 ? (isPrimary ? "text-emerald-300" : "text-emerald-600") : "text-amber-500"
           }`}>
             {parseFloat(trendValue) > 0 ? "▲" : "▼"} {Math.abs(parseFloat(trendValue))}
             <span className={`block text-[9px] uppercase tracking-wide opacity-70 ${isPrimary ? "text-white" : "text-slate-500"}`}>
               {trendLabel}
             </span>
           </div>
         )}
      </div>
      
      <div className="relative z-10">
        <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-1 ${isPrimary ? "text-white" : "text-slate-900"}`}>
          {value}<span className={`text-lg sm:text-x font-medium ${isPrimary ? "text-white/60" : "text-slate-400"}`}>{suffix}</span>
        </h3>
        <p className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? "text-white/70" : "text-slate-500"}`}>{title}</p>
        
        {subValue && (
          <div className={`mt-2.5 inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
             isPrimary 
               ? "bg-white/10 border-white/20 text-white" 
               : "bg-slate-100 border-slate-200 text-slate-600"
          }`}>
            {subValue}
          </div>
        )}

        {isTrend && data && (
          <div className="mt-3">
            <TrendSparkline data={data} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ExecutiveSummarySection = ({ summary, strengths, weaknesses }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-[1.5rem] border border-blue-100 shadow-sm relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      
      <div 
        className="p-4 sm:p-5 lg:p-6 cursor-pointer flex justify-between items-center gap-3 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" /> Executive Summary
        </h4>
        
        <div className={`h-7 w-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:bg-blue-100 ${isOpen ? "rotate-180" : ""}`}>
           <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 sm:px-5 lg:px-6 pb-5 lg:pb-6 pt-0">
               <ReadMoreText text={summary} limit={200} className="text-slate-700 leading-relaxed text-sm" />
               
               {(strengths?.length > 0 || weaknesses?.length > 0) && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          title="Focus Areas"
                          icon={Target}
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

  // Extract quick insights for card face
  const keyWeakness = summaryFeedback.weaknesses?.[0];
  const keyStrength = summaryFeedback.strengths?.[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white overflow-hidden hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 hover:scale-[1.005]"
    >
      <div 
        onClick={onToggle}
        className="p-4 sm:p-5 lg:p-6 cursor-pointer bg-white group"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
          {/* Score Circle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-shrink-0">
              <div className={`h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 rounded-2xl flex flex-col items-center justify-center border-4 shadow-inner ${
                sessionScore >= 8 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                sessionScore >= 5 ? "bg-blue-50 border-blue-100 text-blue-700" :
                "bg-amber-50 border-amber-100 text-amber-700"
              }`}>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">{sessionScore.toFixed(1)}</span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase opacity-70">Score</span>
              </div>
            </div>
            
            <div className="md:hidden flex-1 min-w-0">
               <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#1d2f62] transition-colors">
                {session.domain || "Resume"} Interview
              </h3>
              <div className="mt-1">
                {getConfidenceBadge(sessionScore)}
              </div>
            </div>
          </div>
            
          <div className="hidden md:block flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 truncate group-hover:text-[#1d2f62] transition-colors">
                {session.domain || "Resume"} Interview
              </h3>
              {getConfidenceBadge(sessionScore)}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs lg:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatSessionDate(session)}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {questionCount} Questions
              </span>
            </div>

            {/* Quick Insight (Desktop - Compact) */}
            {(keyWeakness || keyStrength) && (
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                 {keyWeakness ? (
                    <span className="flex items-center gap-1.5">
                       <Target className="h-3.5 w-3.5 text-amber-500" /> 
                       Focus: <span className="font-medium">{keyWeakness.slice(0, 50)}...</span>
                    </span>
                 ) : (
                    <span className="flex items-center gap-1.5">
                       <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                       Strength: <span className="font-medium">{keyStrength.slice(0, 50)}...</span>
                    </span>
                 )}
              </div>
            )}
          </div>

          {/* Mobile Meta Data (Compact) */}
          <div className="flex flex-col md:hidden w-full gap-2">
             <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {formatSessionDate(session)}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {questionCount} Qs
                </span>
             </div>
             {(keyWeakness) && (
                <div className="text-[10px] text-slate-600 bg-amber-50 p-1.5 rounded border border-amber-100 flex items-start gap-1">
                   <Target className="h-3 w-3 text-amber-500 mt-0.5" />
                   <span className="line-clamp-1">{keyWeakness}</span>
                </div>
             )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-2 md:mt-0">
            <div className="flex flex-col items-end gap-1.5">
              <div className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-5 sm:h-1.5 sm:w-6 rounded-full transition-all duration-500 ${
                      (i + 1) * 2 <= sessionScore 
                        ? sessionScore >= 8 ? "bg-emerald-500" : sessionScore >= 5 ? "bg-blue-500" : "bg-amber-500"
                        : "bg-slate-100"
                    }`} 
                  />
                ))}
              </div>
            </div>
            
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
              isExpanded 
                ? "bg-[#1d2f62] border-[#1d2f62] text-white rotate-180" 
                : "bg-white border-slate-100 text-slate-400 group-hover:border-[#1d2f62] group-hover:text-[#1d2f62]"
            }`}>
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
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
            <div className="p-4 sm:p-5 lg:p-8 space-y-5 lg:space-y-8">

              {summaryFeedback.summary && (
                <ExecutiveSummarySection 
                  summary={summaryFeedback.summary}
                  strengths={summaryFeedback.strengths}
                  weaknesses={summaryFeedback.weaknesses}
                />
              )}

              {session.questions && session.questions.length > 0 && (
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2.5">
                    <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center text-white text-[10px]">Q&A</div>
                    Detailed Analysis
                  </h4>
                  <div className="space-y-3">
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
    <div className={`bg-white rounded-[1.25rem] border transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:border-blue-200'}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 sm:p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className={`h-7 w-7 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Q{index + 1}
        </div>
        <div className="flex-1">
          <p className="text-slate-900 font-bold text-sm sm:text-base leading-snug">{question}</p>
        </div>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 transition-transform duration-300 ${isOpen ? "rotate-180 bg-blue-50 border-blue-100 text-blue-600" : "text-slate-400"}`}>
          <ChevronDown className="h-4 w-4" />
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
            <div className="p-4 sm:p-5 lg:p-6 lg:pl-16 space-y-4 bg-slate-50/30">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Answer</h5>
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed shadow-sm">
                  {answer ? (
                    <ReadMoreText text={answer} limit={300} />
                  ) : (
                    <span className="text-slate-400 italic">No answer recorded</span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">AI Feedback</h5>
                <div className="bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
                  <ReadMoreText text={feedbackText} limit={300} className="text-slate-800 text-sm leading-relaxed mb-4 font-medium" />
                  
                  {(scores.correctness !== undefined || scores.clarity !== undefined) && (
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(scores).map(([key, val]) => val !== undefined && (
                        <div key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-500 capitalize tracking-wide">{key}</span>
                          <div className="h-3 w-px bg-slate-200" />
                          <span className={`text-xs font-bold ${
                            val >= 8 ? "text-emerald-600" : val >= 5 ? "text-blue-600" : "text-amber-600"
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
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <h5 className="text-xs font-bold uppercase flex items-center gap-2 mb-3 tracking-wide">
        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconColors[color] || iconColors.blue}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        {title}
      </h5>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs sm:text-sm font-medium flex items-start gap-2.5 leading-relaxed opacity-90">
            <span className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;