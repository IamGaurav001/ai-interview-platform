import React from "react";
import { motion } from "framer-motion";
import { Mic, TrendingUp, Brain, FileText, CheckCircle2 } from "lucide-react";

const Features = () => {
  return (
    <section className="py-16 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mb-12 md:mb-24 text-center max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6"
        >
          <span>Why PrepHire?</span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 tracking-tight leading-tight"
        >
          Everything you need to <span className="text-transparent bg-clip-text bg-[#1d2f62]">excel</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-500 font-light leading-relaxed"
        >
          A comprehensive suite of AI-powered tools designed to transform your interview skills from average to exceptional.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Large Item - Voice Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="md:col-span-2 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            <div className="flex-1">
              <div className="h-12 w-12 md:h-14 md:w-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Mic className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">Real-time Voice Analysis</h3>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                Our advanced AI analyzes your speech patterns, tone, and pacing in real-time. Receive instant, actionable feedback to sound more confident.
              </p>
            </div>
            
            {/* Visual: Audio Waveform */}
            <div className="flex-1 w-full bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-center justify-center h-48 relative overflow-hidden">
               <div className="flex items-center gap-1.5 h-full">
                 {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-blue-500 rounded-full"
                      animate={{ height: ["20%", `${Math.random() * 60 + 30}%`, "20%"] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                    />
                 ))}
               </div>
               <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-400 shadow-sm border border-slate-100">
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
          className="md:row-span-2 bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-900/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="h-12 w-12 md:h-14 md:w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Progress Tracking</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
              Visualize your improvement over time with detailed analytics. Track your confidence, clarity, and technical accuracy scores.
            </p>
            
            <div className="mt-auto space-y-6">
               {[
                 { label: "Confidence", val: 92, color: "bg-blue-500" },
                 { label: "Clarity", val: 88, color: "bg-indigo-500" },
                 { label: "Technical", val: 95, color: "bg-purple-500" }
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
                        transition={{ duration: 1.5, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                        className={`h-full ${item.color} rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]`} 
                      />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </motion.div>

        {/* Standard Item - Adaptive AI */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="h-12 w-12 md:h-14 md:w-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
              <Brain className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Adaptive AI</h3>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm md:text-base">
              Questions adapt to your responses in real-time, digging deeper into your answers just like a seasoned hiring manager.
            </p>
            
            {/* Visual: Network Nodes */}
            <div className="flex justify-center gap-4 opacity-60">
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-3 w-3 bg-orange-400 rounded-full" />
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} className="h-3 w-3 bg-orange-400 rounded-full" />
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, delay: 1, repeat: Infinity }} className="h-3 w-3 bg-orange-400 rounded-full" />
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
          className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
        >
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="h-12 w-12 md:h-14 md:w-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
              <FileText className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Resume Integration</h3>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm md:text-base">
              Upload your resume to generate a personalized interview plan. We tailor questions to your specific experience.
            </p>
            
            {/* Visual: Scanning Effect */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
               <motion.div 
                 className="absolute top-0 bottom-0 w-1/3 bg-emerald-500 blur-sm"
                 animate={{ x: ["-100%", "400%"] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
