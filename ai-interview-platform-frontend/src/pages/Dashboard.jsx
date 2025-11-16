import React, { useEffect, useState } from "react";
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
  Mic, // New icon
  AlertTriangle, // New icon
  RefreshCw, // New icon
} from "lucide-react";
import Loader from "../components/Loader";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    weakAreas: [],
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

  return (
    // Use a simpler, cleaner background
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userDisplayName}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-gray-500">
            Ready to ace your next interview?
          </p>
        </div>

        {error && (
          // Add an icon to the error message for better visibility
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards - Softer shadows, cleaner look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-10">
          <StatCard
            title="Total Interviews"
            value={stats.totalInterviews}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            title="Average Score"
            value={
              stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"
            }
            icon={TrendingUp}
            color="green"
          />
          {/* Responsive col-span for a cleaner look on tablets */}
          <div className="sm:col-span-2 lg:col-span-1">
            <StatCard
              title="Top Weak Areas"
              value={stats.weakAreas.length}
              icon={AlertCircle}
              color="orange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Actions Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Primary CTA */}
            <Link
              to="/upload-resume" // <-- ASSUMED ROUTE, change if needed
              className="group block bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Start New Interview
                  </h2>
                  <p className="text-base sm:text-lg text-blue-100">
                    Practice with AI-generated questions now.
                  </p>
                </div>
                <Mic className="h-10 w-10 sm:h-12 sm:w-12 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* 2. Secondary Actions */}
            <h3 className="text-xl font-semibold text-gray-800 pt-2">
              Get Prepared
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ActionCard
                to="/upload-resume"
                icon={FileText}
                title="Upload Resume"
                description="Get personalized questions"
                iconColor="text-purple-600"
                bgColor="bg-purple-50"
              />
              <ActionCard
                to="/history"
                icon={Clock}
                title="View History"
                description="Review past interviews"
                iconColor="text-cyan-600"
                bgColor="bg-cyan-50"
              />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 3. Weak Areas (Now Actionable) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Top Weak Areas
              </h2>
              {stats.weakAreas.length > 0 ? (
                <div className="space-y-4">
                  {stats.weakAreas.map((area, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800 text-base truncate flex-1 mr-2">
                          {area._id}
                        </span>
                        <span className="text-sm font-bold text-orange-600 flex-shrink-0">
                          {parseFloat(area.avgScore).toFixed(1)}/10
                        </span>
                      </div>
                      {/* Cleaner progress bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3">
                        <div
                          className="bg-orange-500 h-2.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (parseFloat(area.avgScore) / 10) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="text-xs text-gray-500">
                           {area.attempts} attempt{area.attempts !== 1 ? "s" : ""}
                         </p>
                         {/* Actionable Link! */}
                         <Link 
                            to={`/practice?topic=${encodeURIComponent(area._id)}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                         >
                            Practice
                            <ArrowRight className="h-3 w-3" />
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // More positive empty state
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-base font-semibold text-gray-700 mb-1">
                    No weak areas found!
                  </p>
                  <p className="text-sm text-gray-500">
                    Keep up the great work.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Quick Tips (More thematic icons) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Tips
              </h2>
              <div className="space-y-3">
                <Tip
                  icon={TrendingUp}
                  text="Practice regularly to improve your scores"
                />
                <Tip
                  icon={FileText}
                  text="Upload your resume for personalized questions"
                />
                <Tip
                  icon={RefreshCw}
                  text="Review feedback to understand areas for improvement"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Components for a cleaner Dashboard --- */

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };
  const [bgColor, textColor] = colors[color].split(" ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            {value}
          </p>
        </div>
        <div
          className={`h-12 w-12 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-4`}
        >
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ to, icon: Icon, title, description, iconColor, bgColor }) => (
  <Link
    to={to}
    className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-300 flex items-center gap-4"
  >
    <div
      className={`h-12 w-12 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105`}
    >
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div className="flex-1">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5">
        {title}
      </h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
  </Link>
);

const Tip = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-gray-700">{text}</p>
  </div>
);

export default Dashboard;