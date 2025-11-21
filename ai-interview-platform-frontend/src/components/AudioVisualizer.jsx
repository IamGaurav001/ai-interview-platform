import React from "react";
import { motion } from "framer-motion";

const AudioVisualizer = ({ isPlaying, isRecording, mode = "listening" }) => {  const bars = Array.from({ length: 12 }, (_, i) => i);

  if (!isPlaying && !isRecording) return null;
  
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full ${
            mode === "speaking" ? "bg-orange-500" : "bg-emerald-500"
          }`}
          animate={{
            height: isPlaying || isRecording ? [8, 24, 8] : 4,
            opacity: isPlaying || isRecording ? 1 : 0.3,
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
