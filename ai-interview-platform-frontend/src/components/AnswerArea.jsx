import React from 'react';
import { User, Mic, Square, CheckCircle2, Send, Loader2 } from 'lucide-react';

const AnswerArea = ({
  isRecording,
  recordedAudio,
  currentAnswer,
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
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden" 
      data-tour="answer-area"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Your Answer</span>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-xs font-medium">Recording...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {isRecording ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Mic className="h-8 w-8 text-red-600" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></div>
              </div>
            </div>
            <p className="text-base font-medium text-slate-700 mb-1">Listening to your answer...</p>
            <p className="text-sm text-slate-500 mb-4">Speak clearly into your microphone</p>
            <button
              onClick={onStopRecording}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm flex items-center gap-2"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop Recording
            </button>
          </div>
        ) : recordedAudio ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-2">Answer Recorded Successfully!</p>
            <p className="text-sm text-slate-500 mb-6">Review and submit your answer</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={onClearRecording}
                className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-semibold text-sm"
              >
                Re-record Answer
              </button>
              <button 
                onClick={onSubmitVoice}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Action - Voice Recording */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Voice Answer (Recommended)</h3>
                  <p className="text-xs text-slate-600">Quick and natural way to respond</p>
                </div>
              </div>
              <button
                onClick={onStartRecording}
                disabled={loading || isPlayingQuestion || isPlayingFeedback}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                data-tour="mic-button"
              >
                <Mic className="h-5 w-5" />
                Start Recording Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerArea;
