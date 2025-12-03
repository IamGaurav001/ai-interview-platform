import React, { useState } from "react";
import { MessageSquare, Send, RefreshCw, Star, TrendingUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/PageLayout";

const AnswerEvaluation = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const submitForEvaluation = async () => {
    if (!question.trim() || !answer.trim()) {
      setFeedback("Please provide both a question and an answer for evaluation.");
      return;
    }

    setLoading(true);
    setFeedback("");
    setEvaluation(null);
    
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      
      // Handle feedback whether it's an object or string
      if (typeof data.feedback === "object" && data.feedback !== null) {
        setEvaluation(data.feedback);
        setFeedback(JSON.stringify(data.feedback, null, 2));
      } else {
        try {
          const parsedFeedback = JSON.parse(data.feedback);
          setEvaluation(parsedFeedback);
          setFeedback(data.feedback);
        } catch {
          setFeedback(data.feedback);
        }
      }
    } catch (err) {
      console.error(err);
      setFeedback("Error evaluating answer. Please try again.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setFeedback("");
    setEvaluation(null);
  };

  const renderScoreBar = (score, label) => {
    const percentage = (score / 10) * 100;
    const color = percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500";
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-600 font-medium text-lg">{label}</span>
          <span className="text-slate-900 font-bold text-xl">{score}/10</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <motion.div 
            className={`h-2.5 rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Answer Evaluation</h1>
          <p className="text-xl text-slate-600">
            Get detailed AI feedback on your interview answers with scoring and suggestions
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Input Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Send className="h-6 w-6 text-blue-600" />
              Submit for Evaluation
            </h2>
            
            <div className="space-y-6">
              {/* Question Input */}
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  Interview Question
                </label>
                <textarea
                  className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow shadow-sm focus:shadow-md"
                  rows="3"
                  placeholder="Enter the interview question you were asked..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              {/* Answer Input */}
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  Your Answer
                </label>
                <textarea
                  className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow shadow-sm focus:shadow-md"
                  rows="8"
                  placeholder="Enter your answer here... Be as detailed as possible for better evaluation."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="mt-2 text-sm text-slate-500 text-right">
                  {answer.length} characters
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={submitForEvaluation}
                  disabled={loading || !question.trim() || !answer.trim()}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="h-6 w-6 mr-3" />
                      Evaluate Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Evaluation Results */}
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                {/* Structured Evaluation */}
                {evaluation && (
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500" />
                      Detailed Evaluation
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center mb-4">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="text-lg font-semibold text-green-900">Correctness</h4>
                        </div>
                        {renderScoreBar(evaluation.correctness || 0, "Technical Accuracy")}
                      </div>
                      
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center mb-4">
                          <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="text-lg font-semibold text-blue-900">Clarity</h4>
                        </div>
                        {renderScoreBar(evaluation.clarity || 0, "Communication")}
                      </div>
                      
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="text-lg font-semibold text-red-900">Confidence</h4>
                        </div>
                        {renderScoreBar(evaluation.confidence || 0, "Assurance")}
                      </div>
                    </div>

                    {/* Overall Feedback */}
                    {evaluation.overall_feedback && (
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="text-xl font-semibold text-blue-900 mb-4">Overall Feedback</h4>
                        <p className="text-blue-800 leading-relaxed text-lg">
                          {evaluation.overall_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Feedback (fallback) */}
                {!evaluation && (
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">AI Feedback</h3>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <pre className="text-slate-700 whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {feedback}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center pb-8">
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center px-6 py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Evaluate Another Answer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-900 rounded-2xl p-8 shadow-lg text-white"
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-400" />
              Tips for Better Answers
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Be specific and provide concrete examples from your experience using the STAR method (Situation, Task, Action, Result).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Explain your thought process and reasoning behind your approach, not just the final solution.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Mention trade-offs and alternative solutions when relevant to show depth of understanding.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Use clear, concise language and avoid unnecessary jargon unless it's industry-standard.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Structure your answer with a clear beginning, middle, and end to keep the interviewer engaged.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Ask clarifying questions if the question is ambiguous before diving into your answer.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AnswerEvaluation;
