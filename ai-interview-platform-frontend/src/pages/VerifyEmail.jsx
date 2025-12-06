import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, RefreshCw, LogOut, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import SEO from "../components/SEO";
import { auth } from "../config/firebase";

const VerifyEmail = () => {
  const { user, sendVerificationEmail, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                navigate("/dashboard");
            }
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

    useEffect(() => {
    if (user?.emailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setSending(true);
    setMessage("");
    setError("");
    try {
      // Pass the auth.currentUser to ensure we have the method if context user is plain object
      const userToSend = auth.currentUser || user;
      await sendVerificationEmail(userToSend);
      setMessage("Verification email sent! Please check your inbox.");
      setCountdown(60); // 60 seconds cooldown
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const openEmailProvider = () => {
    const emailDomain = user?.email?.split('@')[1]?.toLowerCase();
    
    if (emailDomain?.includes('gmail')) {
      window.open('https://mail.google.com', '_blank');
    } else if (emailDomain?.includes('outlook') || emailDomain?.includes('hotmail')) {
      window.open('https://outlook.live.com', '_blank');
    } else if (emailDomain?.includes('yahoo')) {
      window.open('https://mail.yahoo.com', '_blank');
    } else {
       window.location.href = `mailto:`;
    }
  };

  if (!user) {
    return null; 
  }

  return (
    <PageLayout showNavbar={false}>
      <SEO title="Verify Email" description="Verify your email address to access PrepHire." />
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-400/10 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-400/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 sm:p-12 relative overflow-hidden text-center z-10"
        >
          <div className="relative z-10 flex flex-col items-center">
            
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="h-28 w-28 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 rotate-3"
            >
              <Mail className="h-14 w-14 text-white" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Check your inbox
            </h2>
            
            <p className="text-slate-600 mb-8 text-lg leading-relaxed max-w-sm mx-auto">
              We've sent a verification link to <br/>
              <span className="font-bold text-slate-900 bg-blue-50 px-3 py-1 rounded-lg mt-2 inline-block border border-blue-100">{user.email}</span>
            </p>

            <div className="space-y-4 w-full">

               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openEmailProvider}
                  className="w-full py-4 px-6 bg-[#1d2f62] hover:bg-[#1d2f62]/90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center gap-3"
                >
                  <Mail className="h-5 w-5" />
                  Open Email App
                  <ArrowRight className="h-5 w-5 opacity-50" />
                </motion.button>


              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 text-left">
                <p className="leading-relaxed flex gap-3">
                  <span className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">i</span>
                  <span>Click the link in the email to verify your account. If you don't see it, please check your spam or junk folder.</span>
                </p>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
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

              <div className="pt-2">

                <button
                  onClick={handleResendEmail}
                  disabled={sending || countdown > 0}
                  className="text-sm font-medium text-slate-500 hover:text-[#1d2f62] transition-colors flex items-center justify-center gap-2 mx-auto py-2"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <span className="text-slate-400">Resend email in {countdown}s</span>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Didn't receive the email? Click to resend
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 w-full">
               <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors group"
              >
                <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Sign out & try another email
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default VerifyEmail;
