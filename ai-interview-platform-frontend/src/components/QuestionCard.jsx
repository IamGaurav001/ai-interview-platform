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
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
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
