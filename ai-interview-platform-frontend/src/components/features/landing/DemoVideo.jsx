import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";


const SparkleStar = ({ className, color }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C12 5.3 18.7 12 24 12C18.7 12 12 18.7 12 24C12 18.7 5.3 12 0 12C5.3 12 12 5.3 12 0Z" fill={color} />
  </svg>
);



const DemoVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <section ref={containerRef} id="demo-video" className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center perspective-[2000px]">
      
      {/* Abstract Background Enhancements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] md:blur-[140px] opacity-70 animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] md:blur-[140px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Header Section */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="mb-14 sm:mb-20 flex flex-col items-center"
        >
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-700 font-bold text-sm mb-6 shadow-sm shadow-blue-500/5">
                <span className="tracking-wide">SEE THE MAGIC</span>
             </div>
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1d2f62] mb-6 tracking-tight max-w-4xl leading-[1.1]">
                Your AI Interviewer in Action
             </h2>
             <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                Experience how our platform simulates real-world interviews, provides instant feedback, and helps you land your dream job effortlessly.
             </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
            style={{ 
              rotateX,
              scale,
              opacity,
              y,
              transformStyle: "preserve-3d"
            }}
            className="relative w-full max-w-5xl mx-auto"
        >
             {/* Vibrant Outer Glow */}
             <div className="absolute -inset-4 bg-gradient-to-tr from-[#1d2f62]/40 via-blue-500/30 to-purple-500/30 rounded-[2.5rem] blur-2xl opacity-0 transition duration-700 -z-10 [motion.div:hover_&]:opacity-40"></div>
            
             <div className="relative rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-3 bg-white/60 backdrop-blur-2xl border border-white shadow-2xl shadow-[#1d2f62]/10 overflow-hidden group mix-blend-normal transition-all duration-500 hover:shadow-3xl hover:shadow-[#1d2f62]/20 hover:-translate-y-2">
                {/* Macbook-like UI Frame inner container */}
                <div className={`relative w-full aspect-video rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 ${
                  isPlaying 
                    ? "bg-slate-950 shadow-2xl" 
                    : "bg-white/30 backdrop-blur-2xl shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] border border-white/50"
                }`}>
                    
                    {!isPlaying ? (
                        <div 
                           className="absolute inset-0 flex flex-col items-center justify-between cursor-pointer group/overlay overflow-hidden p-5 sm:p-8 md:p-10 select-none" 
                           onClick={() => setIsPlaying(true)}
                        >
                            
                            {/* Redesigned Translucent Background Mesh for the Thumbnail */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-white/40 to-indigo-50/30 overflow-hidden pointer-events-none">
                                {/* Bottom-left blue gradient mesh */}
                                <div className="absolute -bottom-20 -left-20 w-[30rem] h-[20rem] bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_70%)]" />
                                
                                {/* Bottom-right indigo/purple gradient mesh */}
                                <div className="absolute -bottom-20 -right-20 w-[30rem] h-[20rem] bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_70%)]" />

                                {/* Concentric circles centered around the play button */}
                                <svg className="absolute inset-0 w-full h-full text-blue-500/[0.04]" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="50%" cy="32%" r="120" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
                                  <circle cx="50%" cy="32%" r="180" stroke="currentColor" strokeWidth="1.2" />
                                  <circle cx="50%" cy="32%" r="240" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
                                  <circle cx="50%" cy="32%" r="300" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                                
                                {/* Sparkle Stars */}
                                <SparkleStar className="absolute left-[18%] top-[35%] w-4.5 h-4.5 opacity-60 animate-[pulse_3s_infinite_alternate]" color="#3b82f6" />
                                <SparkleStar className="absolute right-[22%] top-[45%] w-4 h-4 opacity-60 animate-[pulse_4s_infinite_alternate] delay-500" color="#8b5cf6" />
                                <SparkleStar className="absolute right-[28%] top-[20%] w-4.5 h-4.5 opacity-55 animate-[pulse_5s_infinite_alternate] delay-1000" color="#10b981" />
                                
                                {/* Floating Dots */}
                                <div className="absolute top-[18%] left-[32%] w-1.5 h-1.5 rounded-full bg-indigo-400/40 animate-ping duration-[3000ms]" />
                                <div className="absolute top-[28%] right-[36%] w-1.5 h-1.5 rounded-full bg-blue-400/30" />
                                
                                {/* Subtle noise grid */}
                                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                            </div>

                            {/* Beautiful Glass Effect Info Card overlaying the background */}
                            <div className="relative z-20 flex flex-col items-center justify-between h-full w-full py-4 sm:py-6 transform group-hover/overlay:scale-[1.01] transition-transform duration-700 ease-out">
                                
                                {/* Handwritten Indicator */}
                                <div className="absolute top-[12%] left-[50%] -translate-x-32 -translate-y-3 hidden md:flex flex-col items-center rotate-[-12deg] pointer-events-none select-none">
                                  <span className="text-blue-500/80 font-medium text-xs tracking-wide" style={{ fontFamily: "'Caveat', 'Architects Daughter', 'Comic Sans MS', cursive" }}>See it in action</span>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400 -mt-1 ml-8" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 2C5 6 8 9 16 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M12 7.5L16 11L12.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>

                                {/* Play Button Area */}
                                <div className="relative flex items-center justify-center mt-2">
                                    {/* Concentric Glow Rings */}
                                    <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-blue-500/5 border border-blue-500/10 animate-[pulse_4s_infinite]" />
                                    <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-500/10 border border-blue-500/15" />
                                    
                                    {/* The Crystal Glass Button */}
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center border border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.18)] group-hover/overlay:scale-105 group-hover/overlay:shadow-[0_12px_40px_rgba(59,130,246,0.25)] transition-all duration-300">
                                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 fill-blue-600 translate-x-0.5" />
                                    </div>
                                </div>
                                
                                {/* Text Content */}
                                <div className="flex flex-col items-center gap-1.5 mt-2">
                                    <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-center leading-tight">
                                        Watch <span className="text-blue-600">2 Min</span> Demo
                                    </h3>
                                    <p className="text-slate-500 text-[11px] sm:text-sm font-medium max-w-md text-center leading-normal">
                                        See how our AI prepares you for the perfect interview
                                    </p>
                                </div>

                                {/* Features Badge Row */}
                                <div className="inline-flex items-center justify-center gap-3 sm:gap-6 md:gap-8 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] mt-4 max-w-full overflow-x-auto">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="p-1 sm:p-1.5 bg-purple-50 text-purple-500 rounded-lg">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight">AI-Powered</div>
                                            <div className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">Smart feedback</div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-[1px] h-5 bg-slate-200/60 hidden sm:block" />
                                    
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight">Personalized</div>
                                            <div className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">Tailored to you</div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-[1px] h-5 bg-slate-200/60 hidden sm:block" />
                                    
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="p-1 sm:p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28 -2.28 5.941" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight">Proven Results</div>
                                            <div className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">Get hired faster</div>
                                        </div>
                                    </div>
                                </div>
                                

                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full bg-slate-950 rounded-[1.25rem] sm:rounded-[1.75rem] overflow-hidden">
                          {/* Animated Skeleton Loader behind iframe */}
                          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                             <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                             <span className="text-slate-400 text-sm font-medium animate-pulse">Loading experience...</span>
                          </div>
                          
                          <iframe
                            src="https://player.cloudinary.com/embed/?cloud_name=dxhtey63x&public_id=1765281863589649_ztwgb3&profile=cld-default&autoplay=true"
                            className="absolute top-0 left-0 w-full h-full border-0 z-10"
                            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                            allowFullScreen
                            title="PrepHire Demo Video"
                          ></iframe>
                        </div>
                    )}
                </div>
             </div>

             {/* Floating decorative elements around the video player */}
             <div className="absolute -left-12 top-1/4 w-24 h-24 bg-gradient-to-br from-[#1d2f62]/20 to-purple-400/20 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
             <div className="absolute -right-12 bottom-1/4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-[#1d2f62]/20 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideo;
