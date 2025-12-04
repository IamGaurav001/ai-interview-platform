import React, { useState, useEffect } from "react";
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
  CheckCircle2
} from "lucide-react";
import { logEvent } from "../config/amplitude";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
  const { user, updateUser, logout, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
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
    { id: "security", label: "Security", icon: Shield, description: "Password & safety" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <SEO title="Settings" description="Manage your profile, notifications, and security settings." />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Settings</h1>
              <p className="mt-2 text-lg text-slate-500">Manage your account</p>
            </div>

            <nav className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                      isActive
                        ? "bg-white shadow-md border border-blue-100 text-blue-600"
                        : "hover:bg-white hover:shadow-sm text-slate-600 border border-transparent"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                      isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <span className={`block text-lg font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {item.label}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        {item.description}
                      </span>
                    </div>
                    {isActive && <ChevronRight className="ml-auto h-5 w-5 text-blue-500" />}
                  </button>
                );
              })}
              
              <div className="pt-6 mt-6 border-t border-slate-200/60">
                <button
                  onClick={logout}
                  className="w-full flex items-center p-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                    <LogOut className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-bold">Sign Out</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]"
            >
              {/* Message Alert */}
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`px-8 py-4 ${message.type === "success" ? "bg-green-50 text-green-700 border-b border-green-100" : "bg-red-50 text-red-700 border-b border-red-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                      <p className="font-medium text-lg">{message.text}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-8 sm:p-12">
                {/* Profile Section */}
                {activeTab === "profile" && (
                  <div className="max-w-3xl">
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Profile Information</h2>
                      <p className="text-xl text-slate-500">Update your photo and personal details.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div>
                        <label className="block text-lg font-bold text-slate-700 mb-3">Display Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-medium outline-none bg-slate-50 focus:bg-white"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-lg font-bold text-slate-700 mb-3">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                          <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-500 text-lg font-medium cursor-not-allowed"
                          />
                        </div>
                        <p className="mt-3 text-sm text-slate-400 font-medium flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Email address cannot be changed
                        </p>
                      </div>

                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center justify-center px-10 py-4 bg-[#1d2f62] text-white rounded-2xl hover:bg-[#1d2f62]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 text-lg font-bold w-full sm:w-auto min-w-[200px]"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            <>
                              <Save className="mr-3 h-5 w-5" />
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
                  <div className="max-w-3xl">
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h2>
                      <p className="text-xl text-slate-500">Manage how you receive updates and alerts.</p>
                    </div>

                    <div className="space-y-6">
                      {[
                        { id: "email", label: "Email Notifications", desc: "Receive promotional emails and updates" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                          <div className="pr-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{item.label}</h3>
                            <p className="text-base text-slate-500 font-medium">{item.desc}</p>
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
                            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                              notifications[item.id] ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                notifications[item.id] ? 'translate-x-6' : 'translate-x-0'
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
                  <div className="max-w-3xl">
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Security</h2>
                      <p className="text-xl text-slate-500">Manage your password and account security.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100">
                        <div className="flex items-start gap-6">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <Lock className="h-8 w-8 text-slate-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Password</h3>
                            <p className="text-base text-slate-600 leading-relaxed mb-6">
                              Change your password regularly to keep your account secure. We'll send you an email with instructions.
                            </p>
                            <button
                              onClick={handlePasswordReset}
                              disabled={loading}
                              className="px-6 py-3 text-base font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
                            >
                              Send Password Reset Email
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
