import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/intervueai-logo.png";
import { 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Mic,
  Brain,
  FileText,
  Target,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Users
} from "lucide-react";
import dashboardPreview from "../assets/dashboard-preview.png";

// --- Animation Variants ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] -z-10" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-wide mb-8">
            <Sparkles className="h-3 w-3" />
            <span>AI-Powered Interview Prep</span>
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Master your interview. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Land the job.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            Practice with our hyper-realistic AI interviewer. Get instant feedback on your answers, body language, and speaking pace.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-slate-900 text-white text-lg font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Practicing Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 text-lg font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Watch Demo
            </Link>
          </motion.div>



          {/* Hero Visual / Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:rounded-3xl lg:p-4">
              <HeroDashboardPreview />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-slate-100 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-widest">Trusted by top candidates</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100 duration-500">
             <span className="text-xl font-bold text-slate-800">Google</span>
             <span className="text-xl font-bold text-slate-800">Amazon</span>
             <span className="text-xl font-bold text-slate-800">Microsoft</span>
             <span className="text-xl font-bold text-slate-800">Netflix</span>
             <span className="text-xl font-bold text-slate-800">Uber</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Everything you need to succeed</h2>
          <p className="text-lg text-slate-500">
            A complete suite of tools designed to help you ace your next interview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Item */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Real-time Voice Analysis</h3>
              <p className="text-indigo-100 max-w-md">
                Our advanced AI analyzes your speech patterns, tone, and pacing in real-time to provide actionable feedback that helps you sound more confident.
              </p>
            </div>
          </motion.div>

          {/* Tall Item */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:row-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -mr-8 -mb-8" />
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Progress Tracking</h3>
            <p className="text-slate-500 mb-6">
              Visualize your improvement over time with detailed analytics and performance charts.
            </p>
            <div className="space-y-3">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div className="h-2 w-16 bg-slate-200 rounded" />
                    <div className="ml-auto h-2 w-8 bg-slate-200 rounded" />
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Standard Item */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Questioning</h3>
            <p className="text-slate-500">
              Questions adapt to your responses, digging deeper just like a real hiring manager.
            </p>
          </motion.div>

          {/* Standard Item */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Integration</h3>
            <p className="text-slate-500">
              Upload your resume to get tailored questions about your specific experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-24 px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-500/30 rounded-full blur-3xl" />
             <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] bg-blue-500/30 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to upgrade your career?
            </h2>
            <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto font-light">
              Join thousands of candidates who are landing their dream jobs with PrepHire.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-slate-900 text-lg font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-6 text-sm text-slate-400">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 sm:py-16 border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <img src={logo} alt="Logo" className="h-8 w-auto mb-4 sm:mb-6" />
              <p className="text-slate-500 text-sm leading-relaxed">
                The smartest way to prepare for your next interview.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-indigo-600 transition-colors">Live Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
          </div>
          <div className="pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} PrepHire. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600">Twitter</a>
              <a href="#" className="hover:text-slate-600">LinkedIn</a>
              <a href="#" className="hover:text-slate-600">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HeroDashboardPreview = () => {
  const [index, setIndex] = React.useState(0);
  
  const mockData = [
    {
      question: "Can you describe a challenging project you worked on?",
      answer: "In my previous role, we faced a critical database scaling issue during Black Friday that affected 2M+ users. I led the migration to a distributed architecture..."
    },
    {
      question: "How do you handle constructive criticism?",
      answer: "I view it as an opportunity to grow. Recently, I improved my code documentation habits after feedback, which increased team productivity by 40%..."
    },
    {
      question: "Tell me about a time you showed leadership.",
      answer: "I took the initiative to organize a team hackathon that resulted in two new product features, improved team morale, and reduced technical debt by 30%..."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mockData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl bg-slate-50 shadow-2xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col w-full aspect-[16/9] md:aspect-[2.3/1] relative group">
      
      {/* Window Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56] shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F] shadow-sm" />
          </div>
          <div className="text-xs md:text-sm font-semibold text-slate-500 tracking-wide flex items-center gap-2">
            <span className="opacity-50">/</span> PrepHire AI Interview
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">REC</span>
        </div>
      </div>

      {/* Dashboard Content - Scrollable Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
          
          {/* LEFT COLUMN (3 cols) - AI & Stats */}
          <div className="md:col-span-3 flex flex-col gap-4">
            {/* AI Avatar Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="relative mb-4">
                <motion.div 
                  className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg z-10 relative"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                {/* Ripple Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-indigo-100 blur-md"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="relative z-10">
                <div className="text-sm font-bold text-slate-800 mb-1">AI Interviewer</div>
                <div className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                  Listening...
                </div>
              </div>

              {/* Waveform */}
              <div className="flex items-center gap-1 h-8 mt-4 justify-center opacity-70">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-indigo-400 rounded-full"
                    animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Questions</div>
                <div className="text-xl font-bold text-slate-800">8<span className="text-slate-400 text-sm">/12</span></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                💬
              </div>
            </div>
          </div>

          {/* CENTER COLUMN (5 cols) - Chat */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Question */}
            <motion.div 
              className="bg-white p-5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] text-slate-600 font-bold border border-slate-200">AI</div>
                <div>
                  <div className="text-[10px] text-slate-400 mb-1">Interviewer</div>
                  <motion.p 
                    key={`q-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-slate-700 leading-relaxed"
                  >
                    {mockData[index].question}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Answer */}
            <motion.div 
              className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 rounded-2xl rounded-br-sm shadow-lg border border-indigo-500/20 relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex gap-3 h-full relative z-10">
                <div className="h-6 w-6 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">ME</div>
                <div className="flex flex-col h-full w-full">
                  <div className="text-[10px] text-indigo-200 mb-1">Candidate</div>
                  <motion.p 
                    key={`a-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-white leading-relaxed"
                  >
                    {mockData[index].answer}
                  </motion.p>
                  
                  {/* Typing Dots */}
                  <div className="flex gap-1 mt-3 opacity-60">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-white"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (4 cols) - Metrics */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full flex flex-col hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Live Analysis</span>
                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse" />
              </div>

              {/* Score Circle */}
              <div className="flex-1 flex flex-col items-center justify-center mb-6">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <motion.circle 
                      cx="64" cy="64" r="58" stroke="url(#score-gradient-light)" strokeWidth="6" fill="transparent" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 365" }}
                      animate={{ strokeDasharray: "335 365" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="score-gradient-light" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-800 tracking-tight">92</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Score</span>
                  </div>
                </div>
              </div>

              {/* Mini Metrics */}
              <div className="space-y-3">
                {[
                  { label: "Clarity", val: 95, color: "bg-blue-500" },
                  { label: "Confidence", val: 88, color: "bg-indigo-500" },
                  { label: "Technical", val: 92, color: "bg-violet-500" }
                ].map((m, i) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 w-16">{m.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${m.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${m.val}%` }}
                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Landing;