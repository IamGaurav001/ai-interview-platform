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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 cursor-pointer group z-10" onClick={() => setIsPlaying(true)}>
                        
                        {/* Video Thumbnail Background */}
                        <div className="absolute inset-0 overflow-hidden">
                           {/* Use a high-quality poster from Cloudinary if available, or keep the default YouTube one as fallback until user changes it */}
                           {/* Ideally, replace this src with: `https://res.cloudinary.com/dxhtey63x/video/upload/v1/1765281863589649_ztwgb3.jpg` (guessing the public_id path, but safer to stick to what we know works or generic) */}
                           <img 
                                src="https://img.youtube.com/vi/SArYgKtgC10/maxresdefault.jpg" 
                                alt="Demo Video Thumbnail" 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-700 transform group-hover:scale-105"
                           />
                           {/* Gradient Overlay for better text visibility */}
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/30"></div>
                        </div>

                        {/* Play Button Container */}
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/30 shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)] group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-500">
                                    <div className="absolute inset-0 rounded-full border border-blue-400/30 border-t-blue-400/80 animate-[spin_10s_linear_infinite]"></div>
                                    <Play className="w-12 h-12 sm:w-14 sm:h-14 text-white fill-white ml-2 drop-shadow-xl" />
                                </div>
                            </motion.div>
                            
                            <div className="flex flex-col items-center gap-3">
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
