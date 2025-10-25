import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("General");

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: selectedDomain }),
      });
      const data = await res.json();
      setQuestion(data.question);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎯 AI Interview Coach</h1>

      {!question ? (
        <div className="text-center">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Interview Domain:</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600"
            >
              <option value="General">General</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="DSA">Data Structures & Algorithms</option>
              <option value="Python">Python</option>
              <option value="Node.js">Node.js</option>
              <option value="System Design">System Design</option>
            </select>
          </div>
          <button
            onClick={fetchQuestion}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            {loading ? "Loading..." : "Start Interview"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-lg mb-4 font-semibold">Q: {question}</p>
          <textarea
            className="w-full p-3 rounded-md text-black"
            rows="5"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          ></textarea>

          <button
            onClick={submitAnswer}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium"
          >
            {loading ? "Evaluating..." : "Submit Answer"}
          </button>
          {feedback && (
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">AI Feedback 💬</h2>
              <pre className="whitespace-pre-wrap">{feedback}</pre>
              <button
                onClick={() => {
                  setQuestion("");
                  setAnswer("");
                  setFeedback("");
                }}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                New Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
