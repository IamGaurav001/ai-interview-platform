import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Sparkles } from "lucide-react";

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
                <Sparkles className="w-4 h-4 text-blue-500" />
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
                <div className="relative w-full aspect-video rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-slate-950 shadow-inner">
                    
                    {!isPlaying ? (
                        <div 
                           className="absolute inset-0 flex items-center justify-center cursor-pointer group/overlay overflow-hidden" 
                           onClick={() => setIsPlaying(true)}
                        >
                            
                            {/* Animated Background Mesh for the Thumbnail */}
                            <div className="absolute inset-0 bg-[#070b14] overflow-hidden">
                                <div className="absolute inset-0 opacity-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d2f62]/80 via-[#070b14] to-[#070b14]"></div>
                                {/* Subtle noise grid */}
                                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                {/* Glow orbs */}
                                <div className="absolute origin-center top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 group-hover/overlay:scale-125 transition-transform duration-[1500ms] ease-out"></div>
                                <div className="absolute origin-center bottom-0 left-0 w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/3 group-hover/overlay:scale-125 transition-transform duration-[1500ms] ease-out"></div>
                            </div>

                            {/* Beautiful Glass Effect Info Card overlaying the background */}
                            <div className="relative z-20 flex flex-col items-center gap-6 sm:gap-8 p-10 transform group-hover/overlay:scale-[1.03] transition-transform duration-700 ease-out">
                                
                                {/* Play Button */}
                                <div className="relative flex items-center justify-center">
                                    {/* Multi-layered Ping Effects */}
                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30 duration-1000"></div>
                                    <div className="absolute -inset-6 bg-blue-400/20 rounded-full blur-2xl group-hover/overlay:bg-blue-400/40 transition-colors duration-500"></div>
                                    
                                    {/* The Crystal Glass Button */}
                                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-[0_8px_32px_rgba(29,47,98,0.5)] group-hover/overlay:bg-white/20 group-hover/overlay:border-white/40 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-50">
                                        <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white fill-white translate-x-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover/overlay:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                                
                                {/* Text Content */}
                                <div className="flex flex-col items-center gap-3">
                                    <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg text-center">
                                        Watch 2 Min Demo
                                    </h3>
                                    <p className="text-blue-100/80 text-base sm:text-lg font-medium max-w-sm text-center">
                                        See how our AI prepares you for the perfect interview
                                    </p>
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
