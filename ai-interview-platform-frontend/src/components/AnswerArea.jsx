import React from 'react';
import { User, Mic, Square, CheckCircle2, Send, Loader2, Sparkles } from 'lucide-react';

const AnswerArea = ({
  isRecording,
  recordedAudio,
  currentAnswer,
  transcribedText,
  loading,
  isPlayingQuestion,
  isPlayingFeedback,
  onStartRecording,
  onStopRecording,
  onClearRecording,
  onSubmitVoice,
  onAnswerChange,
  onSubmitText
}) => {
  return (
    <div 
      className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300" 
      data-tour="answer-area"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 sm:px-7 py-3 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">Your Answer</span>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-xs font-semibold">Recording...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {isRecording ? (
          <div className="bg-gradient-to-br from-red-50 to-orange-50/50 rounded-3xl p-6 border-2 border-red-200/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/40">
                  <Mic className="h-7 w-7 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-red-300 animate-ping"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Listening...</h3>
                <p className="text-sm text-slate-600">Speak clearly and naturally</p>
              </div>
            </div>
            
            <button
              onClick={onStopRecording}
              className="w-full sm:w-auto px-7 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all shadow-md hover:shadow-lg font-bold text-sm flex items-center justify-center gap-2.5 group transform hover:scale-105 active:scale-95"
            >
              <Square className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
              Stop Recording
            </button>
          </div>
        ) : recordedAudio ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-3xl p-6 border-2 border-green-200/60 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-2 border-green-300/50 flex-shrink-0 shadow-lg shadow-green-500/40">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Answer Recorded ✓</h3>
                  <p className="text-sm text-slate-600">Ready to submit or re-record</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={onClearRecording}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 hover:text-slate-900 transition-all font-semibold text-sm shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                  Re-record
                </button>
                <button 
                  onClick={onSubmitVoice}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-7 py-2.5 bg-[#1d2f62] text-white rounded-xl hover:bg-[#1d2f62]/90 transition-all shadow-lg hover:shadow-xl hover:shadow-[#1d2f62]/40 font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:shadow-none transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {transcribedText && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/60 shadow-sm max-h-60 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-green-600" />
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Transcribed Text</p>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{transcribedText}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Action - Voice Recording */}
            <div className="bg-gradient-to-br from-[#1d2f62]/5 to-[#1d2f62]/10 rounded-3xl p-6 border-2 border-[#1d2f62]/20 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row items-center justify-between gap-5 cursor-pointer">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1d2f62] to-[#2a407a] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-lg shadow-[#1d2f62]/40">
                  <Mic className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Voice Answer</h3>
                  <p className="text-sm text-slate-600">Speak naturally to answer</p>
                </div>
              </div>
              
              <button
                onClick={onStartRecording}
                disabled={loading || isPlayingQuestion || isPlayingFeedback}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3 bg-[#1d2f62] text-white rounded-xl hover:bg-[#1d2f62]/90 transition-all shadow-lg hover:shadow-xl hover:shadow-[#1d2f62]/40 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95 disabled:transform-none"
                data-tour="mic-button"
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerArea;
