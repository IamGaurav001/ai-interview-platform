import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";

const VerifyEmail = () => {
  const { user, sendVerificationEmail, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.emailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    setSending(true);
    setMessage("");
    setError("");
    try {
      await sendVerificationEmail(user);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error("Error sending verification email:", err);
      if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please wait a moment before trying again.");
      } else {
        setError("Failed to send verification email. Please try again later.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!user) {
    return null; // Or redirect to login, handled by ProtectedRoute usually
  }

  return (
    <PageLayout showNavbar={false}>
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 relative overflow-hidden text-center"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-24 w-24 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <Mail className="h-12 w-12 text-blue-600" />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Verify your email
            </h2>
            
            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
              We've sent a verification email to <br/>
              <span className="font-semibold text-slate-900">{user.email}</span>
            </p>

            <div className="space-y-4 w-full">
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800 text-left shadow-sm">
                <p className="leading-relaxed">
                  Click the link in the email to verify your account. If you don't see it, check your spam folder.
                </p>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {message}
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleCheckVerification}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                >
                  I've Verified My Email
                </button>

                <button
                  onClick={handleResendEmail}
                  disabled={sending}
                  className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-semibold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 w-full">
               <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default VerifyEmail;
