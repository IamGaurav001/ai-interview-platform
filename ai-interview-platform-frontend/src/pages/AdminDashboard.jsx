import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Activity, Search, RefreshCw } from "lucide-react";
import { getDashboardStats, getAllUsers, getRecentActivity } from "../api/adminAPI";


import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalInterviews: 0, activeUsers: 0 });
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, activityData] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getRecentActivity(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setActivity(activityData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Interviews"
            value={stats.totalInterviews}
            icon={FileText}
            color="bg-green-500"
          />
          <StatsCard
            title="Active Users (30d)"
            value={stats.activeUsers}
            icon={Activity}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium text-base">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.slice(0, visibleCount).map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {user.usage?.freeInterviewsLeft + user.usage?.purchasedCredits}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredUsers.length > visibleCount && (
              <div className="p-4 border-t border-gray-100 text-center">
                <button
                  onClick={() => setVisibleCount(filteredUsers.length)}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700"
                >
                  View All Users
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {activity.map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.userId?.name || "Unknown User"}</span> completed an interview in{" "}
                        <span className="font-medium">{item.domain}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleString()} • Score: {item.score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="p-8 text-center text-gray-500">No recent activity.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4"
  >
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
      <Icon className={`h-8 w-8 ${color.replace("bg-", "text-")}`} />
    </div>
    <div>
      <p className="text-base text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
);

export default AdminDashboard;
