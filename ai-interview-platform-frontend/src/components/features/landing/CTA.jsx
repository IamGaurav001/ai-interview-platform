import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { logEvent } from "../../../config/amplitude";
import Satyendra from "../../../assets/Satyendra.jpeg";
import Shubham from "../../../assets/Shubham.jpeg";
import Manish from "../../../assets/Manish.png";
import Sourav from "../../../assets/Sourav.png";

const SparkleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C12 5.3 18.7 12 24 12C18.7 12 12 18.7 12 24C12 18.7 5.3 12 0 12C5.3 12 12 5.3 12 0Z" />
  </svg>
);

const AvatarStack = () => {
  const avatars = [Satyendra, Shubham, Manish, Sourav];
  return (
    <div className="flex -space-x-1.5 overflow-hidden">
      {avatars.map((src, i) => (
        <img
          key={i}
          className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-white object-cover shadow-sm"
          src={src}
          alt={`Candidate ${i + 1}`}
        />
      ))}
    </div>
  );
};

const CTA = () => {
  return (
    <section className="py-12 sm:py-24 px-4 relative z-10 overflow-hidden bg-transparent">
      <div className="max-w-5xl mx-auto relative">
        
        {/* Soft Background Outer Glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-[2.5rem] blur-3xl opacity-60 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-8 sm:p-20 text-center overflow-hidden shadow-2xl shadow-slate-100/40"
        >
          {/* Concentric Circle Vector Backgrounds */}
          <svg className="absolute -left-16 -bottom-16 w-64 h-64 text-blue-500/[0.03] pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="0" cy="256" r="120" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
             <circle cx="0" cy="256" r="180" stroke="currentColor" strokeWidth="1.2" />
             <circle cx="0" cy="256" r="240" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
             <circle cx="0" cy="256" r="300" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <svg className="absolute -right-16 -top-16 w-64 h-64 text-indigo-500/[0.03] pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="256" cy="0" r="120" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
             <circle cx="256" cy="0" r="180" stroke="currentColor" strokeWidth="1.2" />
             <circle cx="256" cy="0" r="240" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
             <circle cx="256" cy="0" r="300" stroke="currentColor" strokeWidth="1.2" />
          </svg>

          {/* Grid Dot Patterns */}
          <svg className="absolute top-10 left-10 w-24 h-16 text-blue-500/[0.04] pointer-events-none hidden sm:block" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-1" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-1)" />
          </svg>
          <svg className="absolute bottom-10 right-10 w-24 h-16 text-indigo-500/[0.04] pointer-events-none hidden sm:block" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-2" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-2)" />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Top Journey Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/50 border border-indigo-100/80 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_2px_12px_rgba(59,130,246,0.03)] pointer-events-none select-none">
              <SparkleIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Start your journey</span>
            </div>
            
            {/* Heading */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 sm:mb-8 tracking-tight leading-[1.1]">
              Ready to land your <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 pb-1">
                dream job?
                {/* Hand-drawn Indicator Rays */}
                <svg className="absolute -right-9 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 12h5" />
                  <path d="M5 6l3.5 3.5" />
                  <path d="M5 18l3.5-3.5" />
                </svg>
              </span>
            </h2>
            
            {/* Subheadline */}
            <p className="text-slate-500 text-base sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Join thousands of candidates who are upgrading their careers with PrepHire. <br className="hidden sm:inline" />
              Practice with AI, get feedback, and get hired.
            </p>
            
            {/* Button */}
            <div className="flex justify-center w-full sm:w-auto">
              <Link
                to="/register"
                onClick={() => logEvent('Click CTA', { location: 'Bottom', text: 'Get Started Now' })}
                className="group relative flex items-center justify-between gap-6 pl-2 pr-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:shadow-[0_8px_30px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-500/20 w-full sm:w-auto"
              >
                {/* Arrow Circle */}
                <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>
                
                <span className="text-base sm:text-lg flex items-center gap-2">
                  Get Started Now 
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Social Proof Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-10 select-none">
              <AvatarStack />
              <span className="text-xs sm:text-sm font-medium text-slate-500">
                Join <span className="text-[#1d2f62] font-bold">100+</span> successful candidates
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
