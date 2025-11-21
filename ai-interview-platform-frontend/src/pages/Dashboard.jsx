import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHistory, getWeakAreas } from "../api/interviewAPI";
import {
  Briefcase,
  TrendingUp,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mic,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
  Activity
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
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    weakAreas: [],
  });
  const [chartData, setChartData] = useState({
    trend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [historyRes, weakAreasRes] = await Promise.all([
        getHistory(),
        getWeakAreas(),
      ]);

      const history = historyRes.data;
      const weakAreas = weakAreasRes.data.analysis || [];

      // Calculate stats
      const totalInterviews = history.total || 0;
      const allScores =
        history.summary?.map((s) => parseFloat(s.averageScore)) || [];
      const avgScore =
        allScores.length > 0
          ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
          : 0;

      // Process Chart Data
      processChartData(history);

      setStats({
        totalInterviews,
        averageScore: avgScore,
        weakAreas: weakAreas.slice(0, 3), // Still get top 3
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.networkError) {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
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

  const processChartData = (historyData) => {
    if (!historyData || !historyData.groupedHistory) return;

    // 1. Trend Data (Last 10 sessions)
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

    // Sort by date ascending
    allSessions.sort((a, b) => a.date - b.date);

    const trend = allSessions.slice(-10).map(s => ({
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Animation variants
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

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans text-slate-900">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div className="mb-10" variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Welcome back, <span className="text-orange-600">{userDisplayName}</span>! 👋
              </h1>
              <p className="text-lg text-slate-500">
                Ready to ace your next interview? Let's get started.
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-8 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm"
          >
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Column (Left - 75%) */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* 1. Start New Interview (Hero) */}
            <motion.div variants={itemVariants}>
              <Link
                to="/upload-resume"
                className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-700 p-8 sm:p-10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl transition-all duration-500 group-hover:scale-125"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md mb-4">
                      <Sparkles className="h-3 w-3" />
                      <span>AI-Powered Interviewer</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Start New Interview
                    </h2>
                    <p className="text-lg text-orange-100 max-w-xl leading-relaxed">
                      Practice with personalized AI-generated questions based on your resume. Get instant feedback and improve your confidence.
                    </p>
                    
                    <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg group-hover:bg-orange-50 transition-colors">
                      <span>Begin Session</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="hidden sm:flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:rotate-12 border border-white/30">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* 2. Analytics Section */}
            {chartData.trend.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-600" />
                        Performance Trend
                      </h3>
                      <p className="text-sm text-slate-500">Your scores over the last 10 sessions</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          domain={[0, 10]} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#ea580c" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#ea580c' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Quick Actions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ActionCard
                  to="/upload-resume"
                  icon={FileText}
                  title="Upload Resume"
                  description="Update your profile for better questions"
                  iconColor="text-red-500"
                  bgColor="bg-purple-50"
                  borderColor="border-purple-100"
                />
                <ActionCard
                  to="/history"
                  icon={Clock}
                  title="View History"
                  description="Review past performance and feedback"
                  iconColor="text-cyan-600"
                  bgColor="bg-cyan-50"
                  borderColor="border-cyan-100"
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar Column (Right - 25%) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. Stats Stack */}
            <motion.div variants={itemVariants} className="space-y-4">
              <StatCard
                title="Total Interviews"
                value={stats.totalInterviews}
                icon={Briefcase}
                color="blue"
                trend="+2 this week"
              />
              <StatCard
                title="Average Score"
                value={stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
                icon={TrendingUp}
                color="green"
                trend="Top 15%"
              />
              <StatCard
                title="Focus Areas"
                value={stats.weakAreas.length}
                icon={Target}
                color="orange"
                trend="Action needed"
              />
            </motion.div>

            {/* 2. Weak Areas */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Areas to Improve
                </h2>
              </div>
              
              {stats.weakAreas.length > 0 ? (
                <div className="space-y-5">
                  {stats.weakAreas.map((area, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-700 text-sm truncate flex-1 mr-2">
                          {area._id}
                        </span>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                          {parseFloat(area.avgScore).toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((parseFloat(area.avgScore) / 10) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          className="bg-orange-600 h-full rounded-full"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="text-xs text-slate-400">
                           Based on {area.attempts} session{area.attempts !== 1 ? "s" : ""}
                         </p>
                         <Link 
                            to={`/practice?topic=${encodeURIComponent(area._id)}`}
                            className="text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
                         >
                            Practice
                            <ArrowRight className="h-3 w-3" />
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-green-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-base font-semibold text-slate-800 mb-1">
                    All systems go!
                  </p>
                  <p className="text-sm text-slate-500">
                    You're performing well across all tracked topics.
                  </p>
                </div>
              )}
            </motion.div>

            {/* 3. Quick Tips */}
            <motion.div
              variants={itemVariants}
              className="bg-blue-800 rounded-2xl shadow-lg p-6 text-white"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Pro Tips
              </h2>
              <div className="space-y-4">
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
  );
};

/* --- Helper Components --- */

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: "bg-blue-50 text-orange-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  const [bgColor, textColor, borderColor] = colors[color].split(" ");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`h-12 w-12 ${bgColor} rounded-xl flex items-center justify-center ${borderColor} border`}
        >
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
};

const ActionCard = ({ to, icon: Icon, title, description, iconColor, bgColor, borderColor }) => (
  <Link
    to={to}
    className={`group bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-orange-200 transition-all duration-300 flex items-center gap-4`}
  >
    <div
      className={`h-12 w-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 border ${borderColor}`}
    >
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-orange-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 truncate">{description}</p>
    </div>
    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
    </div>
  </Link>
);

const Tip = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <Icon className="h-5 w-5 text-orange-300 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-slate-200 leading-relaxed">{text}</p>
  </div>
);

export default Dashboard;