import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  LogOut, 
  Camera,
  ChevronRight,
  Mail,
  Lock,
  Trash2,
  Save
} from "lucide-react";

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
      setMessage({ type: "success", text: "Profile updated successfully" });
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
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send reset email" });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: User, description: "Manage your personal information" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Configure how you receive alerts" },
    { id: "security", label: "Security", icon: Shield, description: "Protect your account" },
  ];

  return (
    <div className="pb-12">
      {/* Header Background */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-600">Manage your account preferences and settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-32">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary-400" />}
                  </button>
                );
              })}
              
              <div className="pt-8 mt-8 border-t border-slate-200">
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
              
              {/* Message Alert */}
              {message.text && (
                <div className={`p-4 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {message.text}
                </div>
              )}

              {/* Profile Section */}
              {activeTab === "profile" && (
                <div className="p-6 lg:p-8 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-black">Profile Information</h2>
                    <p className="mt-1 text-sm text-slate-500">Update your photo and personal details.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">Email address cannot be changed.</p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-50"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Section */}
              {activeTab === "notifications" && (
                <div className="p-6 lg:p-8 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage how you receive updates and alerts.</p>
                  </div>

                  <div className="space-y-6 max-w-2xl">
                    {[
                      { id: "email", label: "Email Notifications", desc: "Receive updates about your interview progress via email" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-4 rounded-lg border border-slate-200 hover:border-primary-200 transition-colors">
                        <div>
                          <h3 className="text-base font-medium text-slate-900">{item.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={async () => {
                            const newValue = !notifications[item.id];
                            const newNotifications = { ...notifications, [item.id]: newValue };
                            setNotifications(newNotifications);
                            
                            try {
                              await updateUser({ notifications: newNotifications });
                              setMessage({ type: "success", text: "Preferences saved" });
                              setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                            } catch (err) {
                              console.error("Failed to update notifications", err);
                              setNotifications(prev => ({ ...prev, [item.id]: !newValue })); // Revert on error
                              setMessage({ type: "error", text: "Failed to save preferences" });
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                            notifications[item.id] ? 'bg-primary-600' : 'bg-slate-200'
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
                <div className="p-6 lg:p-8 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Security</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage your password and account security.</p>
                  </div>

                  <div className="space-y-6 max-w-xl">
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Lock className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-slate-900">Password</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Change your password regularly to keep your account secure.
                          </p>
                          <button
                            onClick={handlePasswordReset}
                            disabled={loading}
                            className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
