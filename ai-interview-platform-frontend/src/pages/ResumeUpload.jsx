import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    const res = await axiosInstance.post("/resume/upload", formData);
    setQuestions(res.data.questions.split("\n").filter((q) => q.trim()));
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Upload Your Resume</h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>

      {loading && <p className="mt-4">Analyzing Resume...</p>}
      {questions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Generated Questions:</h3>
          <ul className="list-disc pl-5 mt-2">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
