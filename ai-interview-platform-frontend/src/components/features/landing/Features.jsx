import React from "react";
import { motion } from "framer-motion";
import { Mic, TrendingUp, Brain, FileText } from "lucide-react";

const Features = () => {
  return (
    <section className="py-16 md:py-32 w-full bg-gradient-to-b from-white via-blue-50/15 to-white relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-24 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span>Why PrepHire?</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-950">excel</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            A comprehensive suite of AI-powered tools designed to transform your interview skills from average to exceptional.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Large Item - Voice Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center h-full">
              <div className="flex-1">
                <div className="h-12 w-12 md:h-14 md:w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <Mic className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">Real-time Voice Analysis</h3>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                  Our advanced AI analyzes your speech patterns, tone, and pacing in real-time. Receive instant, actionable feedback to sound more confident.
                </p>
              </div>
              
              {/* Visual: Audio Waveform */}
              <div className="flex-1 w-full bg-slate-50/80 rounded-2xl border border-slate-100 p-6 flex items-center justify-center h-48 relative overflow-hidden">
                <div className="flex items-center gap-1.5 h-20">
                  {[12, 28, 48, 32, 60, 24, 76, 40, 84, 52, 36, 16].map((baseHeight, i) => (
                    <motion.div
                      key={i}
                      className="w-2.5 rounded-full bg-gradient-to-t from-blue-600 via-indigo-500 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                      animate={{ height: [`${baseHeight}%`, `${Math.min(baseHeight * 1.5, 95)}%`, `${baseHeight}%`] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                    />
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-400 shadow-sm border border-slate-100 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Analyzing...
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tall Item - Progress Tracking */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="md:row-span-2 bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-900/20 relative overflow-hidden group flex flex-col justify-between transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative z-10">
              <div className="h-12 w-12 md:h-14 md:w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Progress Tracking</h3>
              <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
                Visualize your improvement over time with detailed analytics. Track your confidence, clarity, and technical accuracy scores.
              </p>
            </div>

            {/* Visual: Glowing SVG Line Graph */}
            <div className="my-6 bg-white/5 border border-white/10 rounded-2xl p-4 h-36 relative overflow-hidden flex items-end">
              <svg className="w-full h-full text-blue-500/20" fill="none" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="200" y2="25" stroke="currentColor" strokeWidth="0.8" />
                <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="0.8" />
                <line x1="0" y1="75" x2="200" y2="75" stroke="currentColor" strokeWidth="0.8" />
                
                {/* Smooth Curve Drawing */}
                <motion.path
                  d="M10 85 Q 45 80 80 50 T 150 40 T 190 20"
                  stroke="url(#graph-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="graph-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Pulsing indicator node */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2, duration: 0.3 }}
                className="absolute right-[8px] bottom-[76px] w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_12px_#a855f7] animate-pulse"
              />
            </div>
            
            <div className="space-y-6 relative z-10">
               {[
                 { label: "Confidence", val: 92, color: "bg-blue-500" },
                 { label: "Clarity", val: 88, color: "bg-indigo-500" },
                 { label: "Technical Accuracy", val: 95, color: "bg-purple-500" }
               ].map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.2 + (i * 0.15), ease: "easeOut" }}
                        className={`h-full ${item.color} rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]`} 
                      />
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Standard Item - Adaptive AI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="h-12 w-12 md:h-14 md:w-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                  <Brain className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Adaptive AI</h3>
                <p className="text-slate-500 leading-relaxed mb-8 text-sm md:text-base">
                  Questions adapt to your responses in real-time, digging deeper into your answers just like a seasoned hiring manager.
                </p>
              </div>
              
              {/* Visual: Neural Network Connective Nodes */}
              <div className="w-full h-32 bg-slate-50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full text-orange-400/25" fill="none" viewBox="0 0 200 80">
                  {/* Connecting Paths */}
                  <line x1="30" y1="40" x2="80" y2="20" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="30" y1="40" x2="80" y2="60" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="80" y1="20" x2="130" y2="20" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="80" y1="60" x2="130" y2="60" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="130" y1="20" x2="170" y2="40" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="130" y1="60" x2="170" y2="40" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* Orbiting pulsing nodes */}
                  <motion.circle cx="80" cy="20" r="4.5" fill="#f97316" animate={{ r: [3.5, 6, 3.5], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                  <motion.circle cx="80" cy="60" r="4.5" fill="#f97316" animate={{ r: [3.5, 6, 3.5], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }} />
                  <motion.circle cx="130" cy="20" r="4.5" fill="#f97316" animate={{ r: [3.5, 6, 3.5], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeInOut" }} />
                  <motion.circle cx="130" cy="60" r="4.5" fill="#f97316" animate={{ r: [3.5, 6, 3.5], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                  
                  <motion.circle cx="30" cy="40" r="6" fill="#ea580c" animate={{ scale: [0.95, 1.15, 0.95] }} transition={{ duration: 3, repeat: Infinity }} />
                  <motion.circle cx="170" cy="40" r="6" fill="#ea580c" animate={{ scale: [0.95, 1.15, 0.95] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} />
                </svg>
                
                {/* Glowing Core */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06),transparent_60%)]" />
              </div>
            </div>
          </motion.div>

          {/* Standard Item - Resume Integration */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="h-12 w-12 md:h-14 md:w-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <FileText className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Resume Integration</h3>
                <p className="text-slate-500 leading-relaxed mb-8 text-sm md:text-base">
                  Upload your resume to generate a personalized interview plan. We tailor questions to your specific experience.
                </p>
              </div>
              
              {/* Visual: Scanning Document laser sweeps */}
              <div className="w-full h-32 bg-slate-50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden flex flex-col justify-center gap-2.5">
                {/* Document text mock rows */}
                <div className="w-3/4 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-emerald-200"
                    animate={{ width: ["0%", "100%", "100%", "0%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.3, 0.8, 1], ease: "easeInOut" }}
                  />
                </div>
                <div className="w-5/6 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-emerald-200"
                    animate={{ width: ["0%", "0%", "100%", "100%", "0%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.2, 0.6, 0.8, 1], ease: "easeInOut" }}
                  />
                </div>
                <div className="w-2/3 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-emerald-200"
                    animate={{ width: ["0%", "0%", "100%", "100%", "0%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.4, 0.7, 0.8, 1], ease: "easeInOut" }}
                  />
                </div>
                
                {/* Scanning green line */}
                <motion.div 
                  className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10"
                  animate={{ top: ["12%", "88%", "12%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Features;
