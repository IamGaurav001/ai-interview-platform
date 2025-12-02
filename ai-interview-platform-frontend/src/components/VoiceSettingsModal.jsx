import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Check } from "lucide-react";

const VoiceSettingsModal = ({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onVoiceSelect,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 shadow-inner">
                    <Mic className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Voice Settings</h2>
                  <p className="text-slate-500 mt-2 text-sm">
                    Choose a voice for your AI interviewer
                  </p>
                </div>

                {/* Voice List */}
                <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {voices.map((option) => {
                    const isSelected = selectedVoice?.name === option.name;
                    return (
                      <button
                        key={option.name}
                        onClick={() => onVoiceSelect(option)}
                        className={`w-full group relative flex items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors ${
                          isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                        }`}>
                          <span className="text-sm font-bold">
                            {option.name.includes("Female") ? "F" : "M"}
                          </span>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className={`font-bold ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                            {option.name}
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {option.lang}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute right-4 bg-blue-600 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {voices.length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-500 text-sm">No voices detected.</p>
                      <p className="text-slate-400 text-xs mt-1">Check your browser settings.</p>
                    </div>
                  )}
                </div>
                {/* Action */}
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#1d2f62] text-white rounded-xl font-bold shadow-lg shadow-[#1d2f62]/30 hover:bg-[#1d2f62]/5 hover:shadow-[#1d2f62]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VoiceSettingsModal;
