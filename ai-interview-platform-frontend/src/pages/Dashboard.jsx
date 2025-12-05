import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHistory, getActiveSession } from "../api/interviewAPI";
import { getUserProfile } from "../api/userAPI";
import PricingModal from "../components/PricingModal";

import {
  Briefcase,
  TrendingUp,
  FileText,
  ArrowRight,
  Mic,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Activity,
  MessageCircle,
  Brain,
  CreditCard,
  PlayCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import Loader from "../components/Loader";
import PageLayout from "../components/PageLayout";
import { logEvent } from "../config/amplitude";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../components/SEO";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
  });
  const [userUsage, setUserUsage] = useState({
    freeInterviewsLeft: 0,
    purchasedCredits: 0,
  });
  const [chartData, setChartData] = useState({
    trend: []
  });
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQAIndex, setCurrentQAIndex] = useState(0);
  const [recentQAs, setRecentQAs] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);


  // Auto-rotate Q&A preview every 5 seconds
  useEffect(() => {
    if (recentQAs.length > 1) {
      const interval = setInterval(() => {
        setCurrentQAIndex((prev) => (prev + 1) % recentQAs.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [recentQAs.length]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [historyRes, profileRes, sessionRes] = await Promise.all([
        getHistory(),
        getUserProfile(),
        getActiveSession(),
      ]);

      const history = historyRes.data;
      const userProfile = profileRes.data.user;
      
      if (sessionRes.data && sessionRes.data.hasActiveSession) {
        setActiveSession(sessionRes.data);
      } else {
        setActiveSession(null);
      }

      if (userProfile && userProfile.usage) {
        setUserUsage(userProfile.usage);
      }



      // Calculate stats
      const totalInterviews = history.total || 0;
      
      // Calculate true average from all sessions
      let totalScoreSum = 0;
      let totalSessionCount = 0;

      if (history.groupedHistory) {
        Object.values(history.groupedHistory).forEach(sessions => {
          sessions.forEach(session => {
            const score = parseFloat(session.score || 0);
            if (!isNaN(score)) {
              totalScoreSum += score;
              totalSessionCount++;
            }
          });
        });
      }

      const avgScore = totalSessionCount > 0 
        ? (totalScoreSum / totalSessionCount).toFixed(1) 
        : 0;

      processChartData(history);

      const qaList = extractRecentQAs(history);
      setRecentQAs(qaList);

      setStats({
        totalInterviews,
        averageScore: avgScore,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.networkError) {

        console.error("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    if (activeSession) {
      logEvent('Resume Interview', { source: 'Dashboard' });
      navigate("/interview-flow");
      return;
    }

    logEvent('Click Start Interview', { source: 'Dashboard' });
    const totalCredits = (userUsage.freeInterviewsLeft || 0) + (userUsage.purchasedCredits || 0);
    if (totalCredits > 0) {
      navigate("/upload-resume");
    } else {
      setShowPricingModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    fetchDashboardData();
  };



  const extractRecentQAs = (historyData) => {
    if (!historyData || !historyData.groupedHistory) {
      return [];
    }

    const qaList = [];
    
    Object.keys(historyData.groupedHistory).forEach(domain => {
      historyData.groupedHistory[domain].forEach(session => {
        let feedbackArray = [];
        if (session.feedback) {
          if (Array.isArray(session.feedback)) {
            feedbackArray = session.feedback;
          } else if (session.feedback.all && Array.isArray(session.feedback.all)) {
            feedbackArray = session.feedback.all;
          }
        }

        if (feedbackArray.length > 0) {
          feedbackArray.forEach(fb => {
            if (fb.question && fb.user_answer) {
              qaList.push({
                question: fb.question,
                answer: fb.user_answer,
                score: fb.overall_score || ((fb.correctness + fb.clarity + fb.confidence) / 3).toFixed(1),
                clarity: fb.clarity,
                pace: fb.confidence >= 7 ? 'Optimal' : 'Needs Work',
                confidence: fb.confidence >= 7 ? 'Strong' : fb.confidence >= 5 ? 'Moderate' : 'Weak'
              });
            }
          });
        }
      });
    });

    return qaList.slice(-5);
  };

  const processChartData = (historyData) => {
    if (!historyData || !historyData.groupedHistory) return;

    let allSessions = [];
    Object.keys(historyData.groupedHistory).forEach(domain => {
      historyData.groupedHistory[domain].forEach(session => {
        allSessions.push({
          date: new Date(session.createdAt || session.date),
          score: parseFloat(session.score || 0),
          domain: domain
        });
      });
    });

    allSessions.sort((a, b) => a.date - b.date);

    const trend = allSessions.slice(-10).map((s, i) => ({
      id: `session-${i}`,
      date: s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.score,
      fullDate: s.date.toLocaleDateString()
    }));

    setChartData({ trend });
  };

  const userDisplayName =
    (user?.displayName && user.displayName.trim()) ||
    user?.email?.split("@")[0] ||
    "User";

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      </PageLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const totalCredits = (userUsage.freeInterviewsLeft || 0) + (userUsage.purchasedCredits || 0);

  const lastReset = new Date(userUsage.lastMonthlyReset || Date.now());
  const now = new Date();
  const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
  const daysLeftToRefill = Math.max(0, Math.ceil(30 - daysSinceReset));

  return (
    <PageLayout>
      <SEO title="Dashboard" description="Track your interview progress, view recent sessions, and start new practice interviews." />

      
      <div className="min-h-screen bg-slate-50/50 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
        </div>

        <motion.div
          className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-10" variants={itemVariants}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                  Welcome back, <span className="text-[#1d2f62]">{userDisplayName.toUpperCase()}</span>! 👋
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                  Ready to ace your next interview? Let's get started.
                </p>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            <div className="lg:col-span-8 space-y-8">
              
              <motion.div variants={itemVariants}>
                <motion.div
                  onClick={handleStartInterview}
                  className="group relative block overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f8fbff] via-[#eef7ff] to-[#dbeafe] p-6 sm:p-10 shadow-sm cursor-pointer"
                  whileHover="hover"
                  initial="initial"
                  animate="initial"
                >
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl transition-all duration-500 group-hover:scale-125"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-200/10 blur-3xl transition-all duration-500 group-hover:scale-125"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#1d2f62] mb-4 shadow-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>{activeSession ? "Session In Progress" : "AI-Powered Interviewer"}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-bold text-[#1d2f62] mb-3 tracking-tight">
                        {activeSession ? "Resume Interview" : "Start New Interview"}
                      </h2>
                      <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
                        {activeSession 
                          ? `You are currently on question ${activeSession.questionCount}. Continue where you left off.`
                          : "Practice with personalized AI-generated questions based on your resume. Get instant feedback and improve your confidence."
                        }
                      </p>
                      
                      <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-[#1d2f62] text-white rounded-2xl font-bold text-lg shadow-lg group-hover:bg-[#1d2f62]/90 transition-colors">
                        <span>{activeSession ? "Resume Session" : "Begin Session"}</span>
                        <motion.div
                          variants={{
                            initial: { x: 0 },
                            hover: { x: 5 }
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {activeSession ? <PlayCircle className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block relative">
                        <motion.div
                            className="absolute inset-0 bg-[#1d2f62]/5 rounded-[2.5rem] blur-md"
                            variants={{
                                initial: { scale: 0.8, opacity: 0 },
                                hover: { 
                                    scale: 1.2, 
                                    opacity: 1,
                                    transition: { duration: 0.4 }
                                }
                            }}
                        />
                        <motion.div 
                            className="h-32 w-32 flex items-center justify-center rounded-[2.5rem] bg-white shadow-lg shadow-blue-100/50 relative z-10"
                            variants={{
                                initial: { scale: 1, rotate: 0, y: 0 },
                                hover: { 
                                    scale: 1.05, 
                                    rotate: -3,
                                    y: -5,
                                    boxShadow: "0 25px 50px -12px rgba(29, 47, 98, 0.15)"
                                }
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <motion.div
                                variants={{
                                    initial: { scale: 1, rotate: 0 },
                                    hover: { 
                                        scale: 1.1, 
                                        rotate: [0, -10, 10, -5, 5, 0],
                                        transition: { 
                                            rotate: {
                                                repeat: Infinity,
                                                duration: 1.2,
                                                ease: "easeInOut",
                                                repeatType: "mirror"
                                            },
                                            scale: { duration: 0.2 }
                                        }
                                    }
                                }}
                            >
                                <Mic className="h-12 w-12 text-[#1d2f62]" />
                            </motion.div>
                        </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Performance Chart */}
              <motion.div variants={itemVariants}>
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl">
                          <Activity className="h-6 w-6 text-[#1d2f62]" />
                        </div>
                        Performance Trend
                      </h3>
                      <p className="text-base text-slate-500 font-medium mt-1 ml-14">Your scores over the last 10 sessions</p>
                    </div>
                  </div>
                  
                  {chartData.trend.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1d2f62" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1d2f62" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="id" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                            dy={10}
                            tickFormatter={(value) => {
                              const item = chartData.trend.find(i => i.id === value);
                              return item ? item.date : '';
                            }}
                          />
                          <YAxis 
                            domain={[0, 10]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff',
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              padding: '16px'
                            }}
                            itemStyle={{ color: '#1d2f62', fontWeight: 700, fontSize: '16px' }}
                            labelStyle={{ color: '#64748b', marginBottom: '8px', fontWeight: 500 }}
                            cursor={{ stroke: '#1d2f62', strokeWidth: 1, strokeDasharray: '4 4' }}
                            formatter={(value) => [`${value}/10`, 'Score']}
                            labelFormatter={(value) => {
                              const item = chartData.trend.find(i => i.id === value);
                              return item ? item.fullDate : value;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#1d2f62" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#1d2f62' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="text-center px-6">
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Activity className="h-8 w-8 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">No Data Yet</h4>
                        <p className="text-sm text-slate-500 max-w-sm font-medium">
                          Complete your first interview to start tracking your performance over time.
                        </p>
                        <button 
                          onClick={handleStartInterview}
                          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1d2f62] text-white rounded-xl font-bold hover:bg-[#1d2f62]/90 transition-all shadow-lg hover:shadow-xl"
                        >
                          Start First Interview
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column (Stats & Tips) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Stats Stack */}
              <motion.div variants={itemVariants} className="space-y-4">
                <StatCard
                  title="Credits Left"
                  value={totalCredits === 0 ? `${daysLeftToRefill} Days` : totalCredits}
                  subtitle={
                    totalCredits === 0 ? "Refill in" : (
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-slate-500 font-medium">Free: {userUsage.freeInterviewsLeft || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#1d2f62]"></div>
                          <span className="text-slate-500 font-medium">Paid: {userUsage.purchasedCredits || 0}</span>
                        </div>
                      </div>
                    )
                  }
                  icon={CreditCard}
                  action={
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPricingModal(true)}
                      className="text-xs font-bold text-white bg-[#1d2f62] hover:bg-[#1d2f62]/90 px-4 py-2 rounded-xl transition-all w-full flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg"
                    >
                      Buy More Credits <ArrowRight className="h-3 w-3" />
                    </motion.button>
                  }
                />
                <StatCard
                  title="Total Interviews"
                  value={stats.totalInterviews}
                  subtitle="Lifetime sessions"
                  icon={Briefcase}
                />
                <StatCard
                  title="Average Score"
                  value={stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
                  icon={TrendingUp}
                />
              </motion.div>

              {/* Pro Tips */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 relative overflow-hidden"
              >
                
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3 relative z-10 text-slate-900">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-[#1d2f62]" />
                  </div>
                  Pro Tips
                </h2>
                <div className="space-y-4 relative z-10">
                  <Tip
                    icon={TrendingUp}
                    text="Consistency is key. Try one short session daily."
                  />
                  <Tip
                    icon={FileText}
                    text="Tailor your resume for specific job descriptions."
                  />
                  <Tip
                    icon={RefreshCw}
                    text="Revisit old sessions to track your progress."
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)}
        onSuccess={handlePaymentSuccess}
        userEmail={user?.email}
        userName={user?.displayName || "User"}
      />
    </PageLayout>
  );
};

/* --- Helper Components --- */

const StatCard = ({ title, value, subtitle, icon: Icon, action }) => {
  return (
    <motion.div 
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex flex-col h-full justify-between relative z-10">
        <div className="flex justify-between items-start mb-6">
          <motion.div 
            className="p-3 bg-slate-50 rounded-2xl text-[#1d2f62]"
            whileHover={{ scale: 1.1, rotate: 5, backgroundColor: "#eef2ff" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
        
        <div>
          <motion.h3 
            className="text-4xl font-bold text-slate-900 tracking-tight mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {value}
          </motion.h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-[#1d2f62] transition-colors duration-300">{title}</p>
          {subtitle && <div className="text-xs font-medium text-slate-400">{subtitle}</div>}
          
          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Tip = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
    <Icon className="h-5 w-5 text-[#1d2f62] mt-0.5 flex-shrink-0" />
    <p className="text-sm text-slate-600 leading-relaxed font-medium">{text}</p>
  </div>
);

export default Dashboard;