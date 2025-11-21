import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../api/authAPI";
import { User, Mail, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        nickname: user.nickname || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await updateUserProfile({
        name: formData.name,
        nickname: formData.nickname,
      });
      setSuccess("Profile updated successfully!");
      // Optionally reload user context if needed, but for now we assume local state is enough or page reload
      // In a real app, we might want to update the global auth context user object here.
      // Since useAuth probably listens to Firebase auth state changes, updating the backend might not immediately reflect in `user` object if it comes from Firebase token.
      // However, our `user` object in context usually comes from the backend sync or is a mix.
      // If `useAuth` only uses Firebase user, we might not see the nickname update immediately unless we re-sync.
      // For now, let's just show success message.
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-8 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile information and preferences
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="h-5 w-5 text-red-500" />
                {error}
              </motion.div>
            )}

            <div className="grid gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Email address cannot be changed.
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nickname
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="How should we call you?"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
