import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Briefcase, 
  Link as LinkIcon, 
  X, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Trophy 
} from "lucide-react";

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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden flex flex-col md:flex-row relative animate-fade-in"
      >
        {/* Left Side Info Panel */}
        <div className="w-full md:w-[38%] bg-[#1d2f62]/5 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between hidden md:flex relative z-10">
          <div className="flex-1 flex flex-col justify-center">
            {/* Checklist Graphic */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-white rounded-2xl border border-slate-100 shadow-md flex items-center justify-center relative">
                <div className="w-12 h-16 border-2 border-[#1d2f62]/20 rounded-lg p-2 flex flex-col justify-between">
                  <div className="h-1.5 w-8 bg-[#1d2f62]/20 rounded" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-emerald-500 flex items-center justify-center text-[6px] text-white">✓</div>
                    <div className="h-1 w-6 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-emerald-500 flex items-center justify-center text-[6px] text-white">✓</div>
                    <div className="h-1 w-4 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded border border-slate-300" />
                    <div className="h-1 w-5 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[#1d2f62]" />
                </div>
                <div className="absolute -bottom-1.5 -left-1.5 h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight font-manrope">
              Let's tailor your <span className="text-[#1d2f62]">perfect interview</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-6 font-manrope">
              We personalize your interview experience to match your career goals and the role you are targeting.
            </p>

            {/* Steps list */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[#1d2f62]/10 flex items-center justify-center flex-shrink-0 text-[#1d2f62]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Personalized Questions</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">AI-crafted questions based on target role & experience.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[#1d2f62]/10 flex items-center justify-center flex-shrink-0 text-[#1d2f62]">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Real Job Simulation</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">Experience a realistic interview based on real-world criteria.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[#1d2f62]/10 flex items-center justify-center flex-shrink-0 text-[#1d2f62]">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Smarter Feedback</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">Get actionable insights to improve and build confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative z-10">

          <div>
            {/* Steps Stepper at top */}
            <div className="flex items-center justify-center gap-6 mb-8 mt-2">
              <div className="flex flex-col items-center gap-1">
                <span className="h-6 w-6 rounded-full bg-[#1d2f62] text-white flex items-center justify-center text-xs font-bold shadow-sm">1</span>
                <span className="text-[9px] font-bold text-[#1d2f62]">Customize</span>
              </div>
              <div className="h-0.5 w-12 bg-slate-200 -mt-4" />
              <div className="flex flex-col items-center gap-1">
                <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-[9px] font-bold text-slate-400">Interview</span>
              </div>
              <div className="h-0.5 w-12 bg-slate-200 -mt-4" />
              <div className="flex flex-col items-center gap-1">
                <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-[9px] font-bold text-slate-400">Review</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mb-1.5 font-manrope">
                Customize Your Interview
              </h2>
              <p className="text-xs text-slate-500 font-manrope">
                Help us understand your goals so we can ask you the right questions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="job-role-input" className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2 ml-0.5 font-manrope">
                  Target Job Role <span className="font-normal text-slate-400 lowercase italic font-manrope">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#1d2f62] transition-colors" />
                  </div>
                  <input
                    id="job-role-input"
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Product Manager, Software Engineer"
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-250 hover:border-slate-350 focus:border-[#1d2f62] focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm text-slate-950 placeholder:text-slate-400 font-medium font-manrope"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 ml-0.5 font-manrope">
                  Tailors the questions and evaluation criteria to this position.
                </p>
              </div>

              <div className="relative">
                <label htmlFor="job-url-input" className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2 ml-0.5 font-manrope">
                  Job Posting URL <span className="font-normal text-slate-400 lowercase italic font-manrope">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#1d2f62] transition-colors" />
                  </div>
                  <input
                    id="job-url-input"
                    type="url"
                    value={jobDescriptionUrl}
                    onChange={(e) => setJobDescriptionUrl(e.target.value)}
                    placeholder="https://linkedin.com/jobs/..."
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-250 hover:border-slate-350 focus:border-[#1d2f62] focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm text-slate-950 placeholder:text-slate-400 font-medium font-manrope"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 ml-0.5 font-manrope">
                  We'll analyze the job description to simulate a real-world interview.
                </p>
              </div>
            </div>

            {/* Security Banner */}
            <div className="mt-5 p-4 rounded-xl bg-[#1d2f62]/5 border border-[#1d2f62]/10 flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#1d2f62] flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#1d2f62] font-manrope">Your data is safe with us</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 font-manrope">
                  We use your inputs only to personalize your interview experience. Your data is never shared.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] font-manrope"
            >
              Cancel
            </button>
            
            <button
              onClick={handleStart}
              className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 bg-[#1d2f62] hover:bg-[#1d2f62]/95 active:scale-[0.98] font-manrope"
            >
              Start Interview
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewSetupModal;
