import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserCircle, Briefcase, Link as LinkIcon, Sparkles } from "lucide-react";

const InterviewSetupModal = ({ isOpen, onClose, onConfirm }) => {
  const [jobRole, setJobRole] = useState("");
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState("");

  if (!isOpen) return null;

  const handleStart = () => {
    onConfirm({ jobRole, jobDescription: "", jobDescriptionUrl, level: "Auto" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-slate-100 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 transform rotate-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Customize Your Interview
            </h2>
            <p className="text-slate-500 text-lg max-w-sm mx-auto leading-relaxed">
              Help Prism AI understand your goals so it can ask you the right questions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Target Job Role <span className="font-normal text-slate-400 text-xs ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Product Manager, Software Engineer"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                We'll tailor the questions and evaluation criteria to this position.
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Job Posting URL <span className="font-normal text-slate-400 text-xs ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="url"
                  value={jobDescriptionUrl}
                  onChange={(e) => setJobDescriptionUrl(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                  className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                We'll analyze the job description to simulate a real interview.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-10 pt-2">
            <button
              onClick={onClose}
              className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            
            <button
              onClick={handleStart}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Interview
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewSetupModal;
