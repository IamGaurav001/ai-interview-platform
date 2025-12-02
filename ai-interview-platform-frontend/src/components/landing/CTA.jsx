import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { logEvent } from "../../config/amplitude";

const CTA = () => {
  return (
    <section className="py-12 sm:py-24 px-4 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        {/* Animated Gradient Border Container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-25 animate-gradient-xy" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-slate-900 rounded-[2.5rem] p-8 sm:p-20 text-center overflow-hidden shadow-2xl"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              <span>Start your journey</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
              Ready to land your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">dream job?</span>
            </h2>
            
            <p className="text-slate-400 text-lg sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of candidates who are upgrading their careers with PrepHire. Practice with AI, get feedback, and get hired.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                onClick={() => logEvent('Click CTA', { location: 'Bottom', text: 'Get Started Now' })}
                className="group relative px-8 py-4 bg-white text-slate-900 text-lg font-bold rounded-full hover:bg-blue-50 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
