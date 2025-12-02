import React from 'react';
import { Bot, Volume2, Pause, Sparkles } from 'lucide-react';

const QuestionCard = ({ 
  question, 
  isPlaying, 
  onPlayToggle,
  className = ""
}) => {
  return (
    <div 
      className={`bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl shadow-lg border border-blue-100/50 p-6 sm:p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col ${className}`}
      data-tour="question-display"
    >
      {/* Accent Bar with Gradient */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"></div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
      
      <div className="flex flex-col gap-5 relative z-10 flex-1 min-h-0">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Question</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[60px]">
          <p className="text-lg sm:text-xl text-slate-800 font-semibold leading-relaxed pl-1">
            {question}
          </p>
        </div>

        {/* Audio Control Button */}
        <div className="flex items-center gap-3 pt-2 flex-shrink-0">
          <button
            onClick={onPlayToggle}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${
              isPlaying 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30' 
                : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300'
            }`}
            data-tour="tts-control"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Listen to Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
