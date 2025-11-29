import React from 'react';
import { Bot, Volume2, Pause } from 'lucide-react';

const QuestionCard = ({ 
  question, 
  isPlaying, 
  onPlayToggle 
}) => {
  return (
    <div 
      className="bg-gradient-to-br from-blue-50 to-white rounded-xl sm:rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 lg:p-5 relative overflow-hidden" 
      data-tour="question-display"
    >
      <div className="flex items-start gap-2 sm:gap-3">
          
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 relative">
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center overflow-hidden">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
              <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
          
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Question</span>
            {isPlaying && (
              <div className="flex items-center gap-1 text-blue-600">
                <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-[10px] font-medium">Playing...</span>
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-slate-800 font-medium leading-relaxed">
            {question}
          </p>
        </div>
      </div>
      <button
        onClick={onPlayToggle}
        className="mt-3 w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium text-xs"
        data-tour="tts-control"
      >
        {isPlaying ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            Stop Audio
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" />
            Listen to Question
          </>
        )}
      </button>
    </div>
  );
};

export default QuestionCard;
