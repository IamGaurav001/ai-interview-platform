import React, { useState } from "react";
import { MessageSquare, Send, RefreshCw, Star, TrendingUp, CheckCircle } from "lucide-react";

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
      
      // Try to parse JSON feedback if it's structured
      try {
        const parsedFeedback = JSON.parse(data.feedback);
        setEvaluation(parsedFeedback);
        setFeedback(data.feedback);
      } catch {
        // If not JSON, display as plain text
        setFeedback(data.feedback);
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
          <span className="text-gray-300 font-medium">{label}</span>
          <span className="text-white font-semibold">{score}/10</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Answer Evaluation</h1>
          <p className="text-xl text-gray-300">
            Get detailed AI feedback on your interview answers with scoring and suggestions
          </p>
        </div>

        <div className="space-y-8">
          {/* Input Form */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Submit for Evaluation</h2>
            
            <div className="space-y-6">
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interview Question
                </label>
                <textarea
                  className="w-full p-4 rounded-lg bg-gray-900/50 text-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Enter the interview question you were asked..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              {/* Answer Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Answer
                </label>
                <textarea
                  className="w-full p-4 rounded-lg bg-gray-900/50 text-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  rows="8"
                  placeholder="Enter your answer here... Be as detailed as possible for better evaluation."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="mt-2 text-sm text-gray-400">
                  {answer.length} characters
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={submitForEvaluation}
                  disabled={loading || !question.trim() || !answer.trim()}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Evaluate Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Evaluation Results */}
          {feedback && (
            <div className="space-y-6">
              {/* Structured Evaluation */}
              {evaluation && (
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Star className="h-6 w-6 mr-2 text-yellow-400" />
                    Detailed Evaluation
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900/50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Correctness</h4>
                      </div>
                      {renderScoreBar(evaluation.correctness || 0, "Technical Accuracy")}
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Clarity</h4>
                      </div>
                      {renderScoreBar(evaluation.clarity || 0, "Communication")}
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="h-5 w-5 text-purple-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Confidence</h4>
                      </div>
                      {renderScoreBar(evaluation.confidence || 0, "Assurance")}
                    </div>
                  </div>

                  {/* Overall Feedback */}
                  {evaluation.overall_feedback && (
                    <div className="bg-gray-900/50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Overall Feedback</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {evaluation.overall_feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Feedback */}
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">AI Feedback</h3>
                <div className="bg-gray-900/50 rounded-lg p-6">
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {feedback}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Evaluate Another Answer
                </button>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Tips for Better Answers</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Be specific and provide concrete examples from your experience
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Explain your thought process and reasoning behind your approach
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Mention trade-offs and alternative solutions when relevant
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Use clear, concise language and avoid unnecessary jargon
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Structure your answer with a clear beginning, middle, and end
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Ask clarifying questions if the question is ambiguous
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerEvaluation;



