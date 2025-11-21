import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Loader2, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { syncUser } from "../api/authAPI.jsx";
import { motion } from "framer-motion";
import logo from "../assets/intervueai-logo.png";

const Login = () => {
  const { login, googleLogin, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if user is already authenticated (prevents accessing login page when logged in)
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      try {
        await syncUser();
      } catch (syncError) {
        console.error("User sync error (non-critical):", syncError);
        // Continue even if sync fails - middleware will handle it on first API call
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
      switch (err.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError(err.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await googleLogin();
      // If googleLogin returned null, we are in redirect flow (handled automatically)
      if (user) {
        try {
          await syncUser();
        } catch (syncError) {
          console.error("User sync error (non-critical):", syncError);
        }
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google login error:", err);
      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError("Google sign-in was closed before completing.");
          break;
        case "auth/cancelled-popup-request":
          setError("Another sign-in attempt is already in progress.");
          break;
        default:
          setError(
            err.message || "Unable to sign in with Google. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      {/* Left Side - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-blue-900/40 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between w-full"
          >
             <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
              <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">Back to Home</span>
            </Link>
          </motion.div>

          <div className="space-y-6 max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold leading-tight"
            >
              Master your interview skills with AI-powered feedback
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-slate-300"
            >
              Join thousands of candidates who have landed their dream jobs using our advanced interview simulation technology.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4 pt-4"
            >
              {[
                "Real-time Feedback",
                "Industry Specific",
                "Performance Analytics"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-primary-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-sm text-slate-400"
          >
            © 2024 AI Interview Platform. All rights reserved.
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            >
              <div className="mt-0.5">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              {error}
            </motion.div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <div className="absolute left-4 inset-y-0 flex items-center">
                    <ArrowRight className="h-5 w-5 text-white/80" />
                  </div>
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.76 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.85 0-5.26-1.92-6.12-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.88 14.11A7.01 7.01 0 0 1 5.5 12c0-.73.13-1.44.38-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.76.42 3.43 1.18 4.95l3.7-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.46 1.64 14.97.5 12 .5 7.7.5 3.99 3.02 2.18 7.05l3.7 2.84c.86-2.59 3.27-4.51 6.12-4.51z"
              />
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-all"
              >
                Create one for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;