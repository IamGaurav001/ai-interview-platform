import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";

const DemoVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  return (
    <section ref={containerRef} id="demo-video" className="py-24 bg-slate-50 overflow-hidden relative perspective-1000">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center" style={{ perspective: "1200px" }}>
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="mb-16"
        >
             <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                See PrepHire in Action
             </h2>
             <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
                Watch how our AI-powered platform transforms your interview preparation experience from stressful to successful.
             </p>
        </motion.div>

        <motion.div
            style={{ 
              rotateX,
              scale,
              opacity,
              y,
              transformStyle: "preserve-3d"
            }}
            className="relative w-full mx-auto shadow-2xl rounded-3xl"
        >
             {/* Glow Effect */}
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-700"></div>
            
             <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-video group ring-1 ring-white/10">
                
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group z-10" onClick={() => setIsPlaying(true)}>
                        
                        {/* Video Thumbnail Background with Brand Tint */}
                        <div className="absolute inset-0 overflow-hidden">
                           <img 
                                src="https://img.youtube.com/vi/SArYgKtgC10/maxresdefault.jpg" 
                                alt="Demo Video Thumbnail" 
                                width="1280"
                                height="720"
                                loading="lazy"
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                           />
                           {/* Brand Gradient Overlay - Richer Blue/Indigo */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-[#1e1b4b]/50 to-transparent mix-blend-multiply"></div>
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                        </div>

                        {/* Play Button Container */}
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex items-center justify-center"
                            >
                                {/* Ripple Effects */}
                                <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors duration-500"></div>
                                
                                {/* Glass Button */}
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300">
                                    <div className="absolute inset-1 rounded-full border border-white/10"></div>
                                    <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white translate-x-1 drop-shadow-lg" />
                                </div>
                            </motion.div>
                            
                            <div className="flex flex-col items-center gap-3">
                                <motion.span 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl font-bold text-white tracking-tight drop-shadow-md"
                                >
                                    Watch how it works
                                </motion.span>
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-blue-200">
                                    2 min demo
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden">
                      <iframe
                        src="https://player.cloudinary.com/embed/?cloud_name=dxhtey63x&public_id=1765281863589649_ztwgb3&profile=cld-default&autoplay=true"
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title="PrepHire Demo Video"
                      ></iframe>
                    </div>
                )}
             </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideo;
