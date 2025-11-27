import React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

const SpeakingAvatar = ({ isSpeaking, size = "large", Icon = Bot, color = "indigo" }) => {
  const containerSize = size === "large" ? "h-24 w-24" : "h-16 w-16";
  const iconSize = size === "large" ? "h-12 w-12" : "h-8 w-8";
  
  // Dynamic color classes based on prop
  const bgClass = color === "blue" ? "bg-blue-400" : "bg-indigo-400";
  const gradientClass = color === "blue" ? "from-blue-500 to-blue-600" : "from-indigo-500 to-indigo-600";
  const shadowClass = color === "blue" ? "rgba(59, 130, 246, 0.5)" : "rgba(99, 102, 241, 0.5)";

  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple Effect when speaking */}
      {isSpeaking && (
        <>
          <motion.div
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className={`absolute ${containerSize} ${bgClass} rounded-full opacity-20`}
          />
          <motion.div
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
            className={`absolute ${containerSize} ${bgClass} rounded-full opacity-20`}
          />
        </>
      )}

      {/* Main Avatar Container */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
          boxShadow: isSpeaking
            ? `0 0 20px 5px ${shadowClass}`
            : "0 0 0px 0px rgba(0, 0, 0, 0)",
        }}
        transition={{
          duration: 0.5,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={`${containerSize} bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 z-10 relative overflow-hidden`}
      >
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
        
        {/* Icon with "Talking" animation */}
        <motion.div
          animate={{
            y: isSpeaking ? [0, -2, 0] : 0,
            rotate: isSpeaking ? [0, -2, 2, 0] : 0,
          }}
          transition={{
            duration: 0.3,
            repeat: isSpeaking ? Infinity : 0,
            ease: "linear",
          }}
        >
          <Icon className={`${iconSize} text-white`} />
        </motion.div>
      </motion.div>

      {/* Status Indicator */}
      <div className="absolute -bottom-1 -right-1 z-20">
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className={`h-4 w-4 rounded-full border-2 border-white ${
            isSpeaking ? "bg-green-500" : "bg-slate-400"
          }`}
        />
      </div>
    </div>
  );
};

export default SpeakingAvatar;
