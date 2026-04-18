import React from "react";
import { motion } from "framer-motion";

const companies = ["Amadeus", "Amazon", "BrowserStack", "Blinkit", "Uber", "Paytm", "Spotify", "PW", "Walmart"];

const SocialProof = () => {
  return (
    <section className="py-8 md:py-12 border-b border-slate-200/60 bg-white relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-slate-400 mb-6 md:mb-10 uppercase tracking-[0.2em]">Trusted by top engineering teams</p>
        
        <div className="relative w-full overflow-hidden mask-gradient">
          <div className="flex w-max">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                className="flex gap-8 md:gap-24 px-6 whitespace-nowrap"
                animate={{ x: ["0%", "-100%"] }}
                transition={{ 
                  duration: 40, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatType: "loop" 
                }}
              >
                {companies.map((company) => (
                  <span 
                    key={`${company}-${i}`} 
                    className="text-xl md:text-3xl font-bold text-slate-300 hover:text-slate-800 transition-colors duration-300 cursor-default select-none"
                  >
                    {company}
                  </span>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
