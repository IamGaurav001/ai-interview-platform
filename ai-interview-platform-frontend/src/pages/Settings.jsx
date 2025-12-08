import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight,
  Mail,
  Lock,
  Save,
  CheckCircle2,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import { getTransactionHistory } from "../api/monetizationAPI";
import { logEvent } from "../config/amplitude";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
  const { user, updateUser, logout, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [transactions, setTransactions] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [notifications, setNotifications] = useState({
    email: true
  });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.name || "");
      if (user.notifications) {
        setNotifications(user.notifications);
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "billing") {
      const fetchTransactions = async () => {
        setLoading(true);
        try {
          const data = await getTransactionHistory();
          if (data.success) {
            setTransactions(data.transactions);
          }
        } catch (error) {
          console.error("Failed to fetch transactions", error);
          setMessage({ type: "error", text: "Failed to load payment history" });
        } finally {
          setLoading(false);
        }
      };
      
      fetchTransactions();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await updateUser({ displayName });
      logEvent('Update Profile', { field: 'displayName' });
      setMessage({ type: "success", text: "Profile updated successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await resetPassword(user.email);
      setMessage({ type: "success", text: "Password reset email sent" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send reset email" });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: User, description: "Personal info" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Alert preferences" },
    { id: "billing", label: "Billing", icon: CreditCard, description: "Payment history" },
    { id: "security", label: "Security", icon: Shield, description: "Password & safety" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <SEO title="Settings" description="Manage your profile, notifications, and security settings." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account preferences and details.</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mobile Tab Nav */}
          <div className="lg:hidden col-span-1 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-200/60">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-1 lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-slate-200 overflow-hidden"
            >
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-b ${message.type === "success" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
                  >
                    <div className="px-6 py-3 flex items-center gap-3">
                      {message.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-red-600" />
                      )}
                      <p className={`text-sm font-medium ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
                        {message.text}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 lg:p-10">
                {/* Profile Section */}
                {activeTab === "profile" && (
                  <div className="max-w-2xl">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                      <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                      <p className="mt-1 text-sm text-slate-500">Update your photo and personal details.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                          <Lock className="h-3 w-3" />
                          Email address cannot be changed
                        </p>
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#1d2f62] hover:bg-[#1d2f62]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all min-w-[140px]"
                        >
                          {loading ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notifications Section */}
                {activeTab === "notifications" && (
                  <div className="max-w-2xl">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                      <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                      <p className="mt-1 text-sm text-slate-500">Manage how you receive updates and alerts.</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: "email", label: "Email Notifications", desc: "Receive promotional emails and updates about your interview progress" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-start sm:items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all">
                          <div className="pr-4">
                            <h3 className="text-sm font-semibold text-slate-900">{item.label}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={async () => {
                              const newValue = !notifications[item.id];
                              const newNotifications = { ...notifications, [item.id]: newValue };
                              setNotifications(newNotifications);
                              
                              try {
                                await updateUser({ notifications: newNotifications });
                                logEvent('Update Settings', { type: 'Notifications', setting: item.id, value: newValue });
                                setMessage({ type: "success", text: "Preferences saved" });
                                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                              } catch (err) {
                                console.error("Failed to update notifications", err);
                                setNotifications(prev => ({ ...prev, [item.id]: !newValue })); // Revert on error
                                setMessage({ type: "error", text: "Failed to save preferences" });
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notifications[item.id] ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                notifications[item.id] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Section */}
                {activeTab === "security" && (
                  <div className="max-w-2xl">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                      <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                      <p className="mt-1 text-sm text-slate-500">Manage your password and account security.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Lock className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Password</h3>
                          <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-lg mb-4">
                            Ensure your account stays secure by updating your password regularly. We'll send a secure link to your email.
                          </p>
                          <button
                            onClick={handlePasswordReset}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Send Reset Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Section */}
                {activeTab === "billing" && (
                  <div className="max-w-5xl">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                      <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
                      <p className="mt-1 text-sm text-slate-500">View your past transactions and receipts.</p>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : transactions.length > 0 ? (
                      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {transactions.map((transaction) => (
                              <tr key={transaction._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900">
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                  {transaction.planId === "3_interviews" ? "Value Bundle" : "Single Interview"}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                  ₹{transaction.amount ? transaction.amount / 100 : 0}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                  {transaction.creditsAdded}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    transaction.status === 'success' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                                    transaction.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : 
                                    'bg-red-50 text-red-700 ring-red-600/20'
                                  }`}>
                                    {transaction.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <CreditCard className="mx-auto h-8 w-8 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No transactions</h3>
                        <p className="mt-1 text-sm text-slate-500">You haven't made any purchases yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
