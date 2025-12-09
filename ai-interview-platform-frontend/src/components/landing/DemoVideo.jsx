import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const DemoVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="demo-video" className="py-24 bg-slate-50 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="mb-12"
        >
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                See PrepHire in Action
             </h2>
             <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
                Watch how our AI-powered platform transforms your interview preparation experience from stressful to successful.
             </p>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-5xl mx-auto"
        >
             {/* Glow Effect */}
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            
             <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-video group ring-1 ring-white/10">
                
                {/* Browser Window Header */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-slate-950/50 backdrop-blur-md border-b border-white/5 flex items-center px-4 z-20">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-transparent shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-transparent shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-transparent shadow-sm"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1 bg-white/5 rounded-md border border-white/5 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-[10px] sm:text-xs font-mono text-slate-400 font-medium tracking-wide">prephire.co/demo</span>
                        </div>
                    </div>
                    <div className="w-16"></div> {/* Spacer for alignment */}
                </div>

                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 cursor-pointer group z-10" onClick={() => setIsPlaying(true)}>
                        
                        {/* Video Thumbnail Background */}
                        <div className="absolute inset-0 overflow-hidden">
                           <img 
                                src="https://img.youtube.com/vi/SArYgKtgC10/maxresdefault.jpg" 
                                alt="Demo Video Thumbnail" 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500 transform group-hover:scale-105"
                           />
                           {/* Gradient Overlay for better text visibility */}
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/30"></div>
                           
                           {/* Tech Grid Overlay (subtle) */}
                           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                        </div>

                        {/* Play Button Container */}
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300">
                                    <div className="absolute inset-0 rounded-full border border-blue-400/30 border-t-blue-400/80 animate-[spin_8s_linear_infinite]"></div>
                                    <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white ml-2 drop-shadow-lg" />
                                </div>
                            </motion.div>
                            
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm sm:text-base font-semibold text-white tracking-widest uppercase drop-shadow-md">
                                    Watch Product Demo
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    2:15 min
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full bg-black pt-10"> {/* Added padding-top for header */}
                      <iframe 
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/SArYgKtgC10?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&controls=0&disablekb=1" 
                        title="PrepHire Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
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
