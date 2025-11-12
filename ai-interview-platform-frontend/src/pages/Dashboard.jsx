import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getHistory, getWeakAreas } from "../api/interviewAPI";
import {
  Briefcase,
  TrendingUp,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Loader from "../components/Loader";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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
      const allScores = history.summary?.map((s) => parseFloat(s.averageScore)) || [];
      const avgScore =
        allScores.length > 0
          ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
          : 0;

      setStats({
        totalInterviews,
        averageScore: avgScore,
        weakAreas: weakAreas.slice(0, 3),
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.networkError) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-8 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-visible">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Ready to ace your next interview? Let's get started.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Interviews</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{stats.totalInterviews}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Weak Areas</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {stats.weakAreas.length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 overflow-visible">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full auto-rows-fr overflow-visible">
                <Link
                  to="/upload-resume"
                  className="group p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white hover:shadow-xl transition-all min-h-[120px] flex flex-col justify-between w-full block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-1">Upload Resume</h3>
                    <p className="text-xs sm:text-sm text-blue-100">
                      Get personalized questions
                    </p>
                  </div>
                </Link>

                <Link
                  to="/history"
                  className="group p-4 sm:p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl text-white hover:shadow-xl transition-all min-h-[120px] flex flex-col justify-between w-full block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-1">View History</h3>
                    <p className="text-xs sm:text-sm text-purple-100">
                      Review past interviews
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Weak Areas & Insights */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Weak Areas</h2>
              {stats.weakAreas.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto">
                  {stats.weakAreas.map((area, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base truncate flex-1 mr-2">{area._id}</span>
                        <span className="text-xs sm:text-sm text-orange-700 flex-shrink-0">
                          {parseFloat(area.avgScore).toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((parseFloat(area.avgScore) / 10) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {area.attempts} attempt{area.attempts !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-gray-600">
                    Complete interviews to see weak areas
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Tips</h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-700">
                    Practice regularly to improve your scores
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-700">
                    Upload your resume for personalized questions
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-700">
                    Review feedback to understand areas for improvement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
