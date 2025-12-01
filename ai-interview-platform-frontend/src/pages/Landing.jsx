import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { logEvent } from "../config/amplitude";
import logo from "../assets/intervueai-logo.png";
import icon from "../assets/prephire-icon-circle.png";
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
  Users,
  Star
} from "lucide-react";

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
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] -z-10" />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-20 pb-32 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium uppercase tracking-wider mb-8 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>The Future of Interview Prep</span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 leading-[1.1]">
              Master your interview. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Secure your dream job.
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p variants={fadeIn} className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
              Experience the most realistic AI interview simulation. Get real-time feedback on your answers, tone, and body language to perform at your absolute best.
            </motion.p>
            
            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                to="/register"
                onClick={() => logEvent('Click CTA', { location: 'Hero', text: 'Start Practicing Free' })}
                className="px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                Start Practicing Free <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div variants={fadeIn} className="relative mx-auto max-w-6xl">
              <div className="relative rounded-2xl bg-white p-2 ring-1 ring-slate-200 shadow-2xl lg:rounded-3xl">
                <HeroDashboardPreview />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="py-10 border-b border-slate-200 bg-white/50 backdrop-blur-sm relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Trusted by candidates from</p>
          
          {/* Auto-scrolling Marquee (All Screens) */}
          <div className="relative w-full overflow-hidden">
            <div className="flex animate-scroll-mobile w-max">
              {/* Set 1 */}
              <div className="flex gap-8 md:gap-16 px-4 whitespace-nowrap">
                {["Google", "Amazon", "Microsoft", "Netflix", "Uber", "Meta"].map((company) => (
                  <span key={`${company}-1`} className="text-xl md:text-2xl font-bold text-slate-800 opacity-60">{company}</span>
                ))}
              </div>
              {/* Set 2 */}
              <div className="flex gap-8 md:gap-16 px-4 whitespace-nowrap">
                {["Google", "Amazon", "Microsoft", "Netflix", "Uber", "Meta"].map((company) => (
                  <span key={`${company}-2`} className="text-xl md:text-2xl font-bold text-slate-800 opacity-60">{company}</span>
                ))}
              </div>
              {/* Set 3 (Extra for wide screens) */}
              <div className="flex gap-8 md:gap-16 px-4 whitespace-nowrap">
                {["Google", "Amazon", "Microsoft", "Netflix", "Uber", "Meta"].map((company) => (
                  <span key={`${company}-3`} className="text-xl md:text-2xl font-bold text-slate-800 opacity-60">{company}</span>
                ))}
              </div>
              {/* Set 4 (Extra for wide screens) */}
              <div className="flex gap-8 md:gap-16 px-4 whitespace-nowrap">
                {["Google", "Amazon", "Microsoft", "Netflix", "Uber", "Meta"].map((company) => (
                  <span key={`${company}-4`} className="text-xl md:text-2xl font-bold text-slate-800 opacity-60">{company}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES (Bento Grid) --- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">Everything you need to excel</h2>
          <p className="text-xl text-slate-500 font-light">
            A comprehensive suite of AI-powered tools designed to transform your interview skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Item - Voice Analysis */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-10 text-slate-900 relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 border border-blue-100">
                <Mic className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Real-time Voice Analysis</h3>
              <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
                Our advanced AI analyzes your speech patterns, tone, and pacing in real-time. Receive instant, actionable feedback to sound more confident and professional.
              </p>
            </div>
            {/* Visual Element */}
            <div className="absolute bottom-0 right-0 w-1/2 h-32 bg-gradient-to-t from-white to-transparent z-20" />
            <div className="absolute bottom-8 right-8 flex gap-1 opacity-50">
               {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 bg-blue-400 rounded-full h-12 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
               ))}
            </div>
          </motion.div>

          {/* Tall Item - Progress Tracking */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:row-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
          >
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-16 -mb-16" />
            <div className="h-14 w-14 bg-emerald-100/50 rounded-2xl flex items-center justify-center mb-8 text-emerald-600">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Progress Tracking</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Visualize your improvement over time with detailed analytics. Track your confidence, clarity, and technical accuracy scores.
            </p>
            <div className="space-y-4 relative z-10">
               {[
                 { label: "Confidence", val: 85, color: "bg-emerald-500" },
                 { label: "Clarity", val: 92, color: "bg-emerald-500" },
                 { label: "Technical", val: 78, color: "bg-emerald-500" }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.val}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full ${item.color} rounded-full`} 
                      />
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Standard Item - Smart Questioning */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all group"
          >
            <div className="h-14 w-14 bg-orange-100/50 rounded-2xl flex items-center justify-center mb-8 text-orange-600 group-hover:scale-110 transition-transform">
              <Brain className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Adaptive AI</h3>
            <p className="text-slate-500 leading-relaxed">
              Questions adapt to your responses in real-time, digging deeper into your answers just like a seasoned hiring manager would.
            </p>
          </motion.div>

          {/* Standard Item - Resume Integration */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all group"
          >
            <div className="h-14 w-14 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Resume Integration</h3>
            <p className="text-slate-500 leading-relaxed">
              Upload your resume to generate a personalized interview plan. We tailor questions to your specific experience and skills.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-12 sm:py-24 px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-[3rem] p-8 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
             <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-50/50 rounded-full blur-[100px]" />
             <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] bg-indigo-50/50 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to land your dream job?
            </h2>
            <p className="text-slate-500 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of candidates who are upgrading their careers with PrepHire. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                onClick={() => logEvent('Click CTA', { location: 'Bottom', text: 'Get Started Now' })}
                className="px-10 py-5 bg-slate-900 text-white text-lg font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
              >
                Get Started Now <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 sm:py-20 border-t border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-16">
            <div className="col-span-2">
              <img src={logo} alt="Logo" className="h-8 w-auto mb-6" />
              <p className="text-slate-500 text-base leading-relaxed max-w-xs">
                The smartest way to prepare for your next interview. AI-powered feedback, real-time analysis, and personalized coaching.
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
                <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link></li>
                <li><Link to="/refund" className="hover:text-indigo-600 transition-colors">Cancellation & Refund</Link></li>
                <li><Link to="/shipping" className="hover:text-indigo-600 transition-colors">Shipping</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} PrepHire. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600 transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-600 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- HERO DASHBOARD PREVIEW COMPONENT ---
const HeroDashboardPreview = () => {
  const [index, setIndex] = React.useState(0);
  
  const mockData = [
    {
      question: "Can you describe a challenging project you worked on?",
      answer: "In my previous role, we faced a critical database scaling issue during Black Friday..."
    },
    {
      question: "How do you handle constructive criticism?",
      answer: "I view it as an opportunity to grow. Recently, I improved my documentation habits..."
    },
    {
      question: "Tell me about a time you showed leadership.",
      answer: "I took the initiative to organize a team hackathon that resulted in two new features..."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mockData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col w-full h-[350px] md:h-[450px] relative group">
      
      {/* Window Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <div className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>
          <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
            <span className="opacity-50">/</span> interview-session-01
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-red-50 border border-red-100 rounded-md">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">REC</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 overflow-y-auto custom-scrollbar">
        
        {/* LEFT: AI Avatar */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />
            
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-full bg-white-teal-400 to-emerald-500 p-1 shadow-lg z-10 relative">
                <div className="h-full w-full rounded-full bg-white overflow-hidden">
                  <img src={icon} alt="AI Interviewer" className="h-full w-full object-cover" />
                </div>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <div className="text-center relative z-10">
              <div className="text-base font-semibold text-slate-900 mb-1">AI Interviewer</div>
              <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block border border-blue-100">
                Listening...
              </div>
            </div>

            {/* Waveform */}
            <div className="flex items-center gap-1 h-8 mt-6 justify-center opacity-50">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full"
                  animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Chat/Transcript */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {/* Question Card */}
          <motion.div 
            className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xs text-slate-500 font-bold border border-slate-200">AI</div>
              <div>
                <motion.p 
                  key={`q-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm md:text-base font-medium text-slate-700 leading-relaxed"
                >
                  {mockData[index].question}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Answer Card */}
          <motion.div 
            className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex-1 relative overflow-hidden flex flex-col justify-center shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex gap-4">
               <div className="h-8 w-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-md">ME</div>
               <div className="relative z-10">
                <motion.p 
                  key={`a-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-base md:text-lg font-medium text-slate-800 leading-relaxed"
                >
                  "{mockData[index].answer}"
                </motion.p>
               </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Landing;