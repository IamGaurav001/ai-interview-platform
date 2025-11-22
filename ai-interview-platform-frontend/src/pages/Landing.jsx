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
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
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
          
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Master your interview. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Land the job.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
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
            className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group"
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
            className="md:row-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
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
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group"
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
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group"
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
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-500/30 rounded-full blur-3xl" />
             <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] bg-blue-500/30 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
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
      <footer className="bg-white py-16 border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <img src={logo} alt="Logo" className="h-8 w-auto mb-6" />
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
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
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
      answer: "In my previous role, we faced a critical database scaling issue during Black Friday..."
    },
    {
      question: "How do you handle constructive criticism?",
      answer: "I view it as an opportunity to grow. Recently, I improved my code documentation habits..."
    },
    {
      question: "Tell me about a time you showed leadership.",
      answer: "I took the initiative to organize a team hackathon that resulted in two new product features..."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mockData.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col w-full aspect-[16/9] md:aspect-[2/1]">
      {/* Window Header */}
      <div className="flex items-center border-b border-slate-100 bg-slate-50/80 backdrop-blur px-4 py-3">
        <div className="flex space-x-1.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="mx-auto text-xs font-medium text-slate-400">PrepHire Dashboard</div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 p-6 md:p-8 flex gap-6 md:gap-8 items-center justify-center bg-white relative overflow-hidden">
        
        {/* Left Side: AI & Chat */}
        <div className="flex-1 max-w-lg flex flex-col gap-6 z-10">
           {/* AI Avatar */}
           <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
              <Brain className="h-6 w-6 text-indigo-600" />
           </div>
           
           {/* Chat Bubbles */}
           <div className="space-y-4">
              {/* Question Bubble */}
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                 <motion.p 
                   key={`q-${index}`}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -5 }}
                   className="text-sm font-medium text-slate-700"
                 >
                   {mockData[index].question}
                 </motion.p>
              </div>

              {/* Answer Bubble (Simulated Typing/Input) */}
              <div className="bg-indigo-50 p-4 rounded-2xl rounded-tr-none border border-indigo-100 shadow-sm relative overflow-hidden">
                 <motion.p 
                   key={`a-${index}`}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.2 }}
                   className="text-sm text-indigo-900 truncate"
                 >
                   {mockData[index].answer}
                 </motion.p>
                 {/* Typing Cursor */}
                 <motion.div 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ repeat: Infinity, duration: 0.8 }}
                   className="absolute right-4 bottom-4 h-4 w-2 bg-indigo-400 rounded-full"
                 />
              </div>
           </div>
        </div>

        {/* Right Side: Score Card */}
        <div className="hidden md:block w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 z-10">
           <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
              <span className="text-xl font-bold text-green-500">92/100</span>
           </div>
           
           <div className="space-y-6">
              <div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-green-500 rounded-full" 
                    />
                 </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-slate-50">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Clarity</span>
                    <span className="font-bold text-slate-700">High</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Pace</span>
                    <span className="font-bold text-slate-700">Optimal</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Confidence</span>
                    <span className="font-bold text-slate-700">Strong</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;