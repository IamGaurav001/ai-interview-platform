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
            
             <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-video group">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 relative cursor-pointer" onClick={() => setIsPlaying(true)}>
                        {/* Abstract Thumbnail Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
                           <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay"></div>
                           <div className="absolute inset-0 bg-grid-slate-700/[0.1] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                        </div>
                        
                        {/* Play Button */}
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group hover:bg-white/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-0 group-hover:opacity-100 duration-1000"></div>
                            <Play className="w-10 h-10 text-white fill-current ml-2" />
                        </motion.div>
                        
                        <div className="relative z-10 mt-6 text-sm font-medium text-slate-400 uppercase tracking-widest">
                          Watch Demo
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full bg-black">
                      <iframe 
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/SArYgKtgC10?autoplay=1" 
                        title="PrepHire Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                       {/* Close/Stop Button (Optional, usually we just let them pause the video) */}
                    </div>
                )}
             </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideo;
