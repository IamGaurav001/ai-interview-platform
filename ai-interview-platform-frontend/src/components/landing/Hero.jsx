import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { logEvent } from "../../config/amplitude";
import icon from "../../assets/prephire-icon-circle.png";

const Hero = () => {
  return (
    <section className="relative z-10 pt-10 md:pt-20 pb-20 md:pb-40 overflow-hidden bg-white">
      <BackgroundBeams />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200 shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] backdrop-blur-md text-slate-600 text-xs font-semibold uppercase tracking-widest mb-8 hover:scale-105 transition-transform cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>The Future of Interview Prep</span>
          </motion.div>
          
          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-8 text-slate-900 leading-[1.05]">
            Master your interview. <br />
            <span className="text-transparent bg-clip-text bg-[#1d2f62]">
              Secure your dream job.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-500 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            Experience the most realistic AI interview simulation. Get <span className="text-slate-900 font-medium">real-time feedback</span> on your answers, tone, and body language.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <Link
              to="/register"
              onClick={() => logEvent('Click CTA', { location: 'Hero', text: 'Start Practicing Free' })}
              className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#3B82F6_50%,#E2E8F0_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#1d2f62] px-8 py-1 text-lg font-medium text-white backdrop-blur-3xl transition-all duration-300 hover:bg-[#1d2f62]/90 hover:scale-105 active:scale-95">
                Start Practicing Free <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>
          </div>

          {/* 3D Tilt Dashboard Preview */}
          <div className="relative mx-auto max-w-6xl perspective-1000">
            <TiltCard>
              <HeroDashboardPreview />
            </TiltCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- 3D TILT CARD COMPONENT ---
const TiltCard = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-[2rem] bg-slate-900/5 p-2 sm:p-4 ring-1 ring-slate-900/10 backdrop-blur-3xl"
    >
      <div className="relative rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200/60">
        {children}
      </div>
    </motion.div>
  );
};

// --- BACKGROUND BEAMS COMPONENT ---
const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full blur-[128px] opacity-40 animate-pulse" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full blur-[128px] opacity-40 animate-pulse delay-1000" />
    </div>
  );
};

// --- HERO DASHBOARD PREVIEW COMPONENT ---
const HeroDashboardPreview = () => {
  const [index, setIndex] = useState(0);
  
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
    <div className="flex flex-col w-full h-[400px] md:h-[500px] relative bg-slate-50/50">
      
      {/* Window Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-500">
            <span className="opacity-50">🔒</span> prephire.co/interview/session-live
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Live Rec</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto custom-scrollbar">
        
        {/* LEFT: AI Avatar */}
        <div className="md:col-span-4 flex flex-col h-full">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent" />
            
            <div className="relative mb-8">
              <div className="h-32 w-32 rounded-full p-1.5 bg-[#1d2f62] from-blue-500 via-indigo-500 to-purple-500 shadow-xl relative z-10">
                <div className="h-full w-full rounded-full bg-white overflow-hidden border-4 border-white">
                  <img src={icon} alt="AI Interviewer" className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
              
              {/* Orbital Rings */}
              <div className="absolute inset-0 -m-4 border border-blue-200/50 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-0 -m-8 border border-indigo-200/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
            
            <div className="text-center relative z-10">
              <div className="text-lg font-bold text-slate-900 mb-2">Prism AI</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Listening...
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Chat/Transcript */}
        <div className="md:col-span-8 flex flex-col gap-4 h-full">
          {/* Question Card */}
          <motion.div 
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-sm text-slate-600 font-bold border border-slate-200">AI</div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Interviewer</div>
                <motion.p 
                  key={`q-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-medium text-slate-800 leading-relaxed"
                >
                  {mockData[index].question}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Answer Card */}
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl flex-1 relative overflow-hidden flex flex-col justify-center shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex gap-4 h-full">
               <div className="h-10 w-10 rounded-xl bg-blue-600 flex-shrink-0 flex items-center justify-center text-sm text-white font-bold shadow-lg shadow-blue-200">ME</div>
               <div className="relative z-10 flex-1">
                <div className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">You</div>
                <motion.p 
                  key={`a-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-medium text-slate-900 leading-relaxed"
                >
                  "{mockData[index].answer}"
                </motion.p>
               </div>
            </div>
            
            {/* Audio Waveform Visualization */}
            <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 pb-4 opacity-20 mask-gradient-b">
               {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-blue-600 rounded-t-full"
                    animate={{ height: ["10%", `${Math.random() * 80 + 20}%`, "10%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                  />
               ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
