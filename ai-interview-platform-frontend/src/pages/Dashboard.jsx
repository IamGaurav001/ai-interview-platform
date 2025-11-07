import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => (
  <div className="grid gap-6 md:grid-cols-3">
    <div className="col-span-2 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Welcome to AI Interview Coach</h2>
      <p>Get started with mock interviews, resume analysis, and AI prep.</p>
      <div className="mt-6 flex gap-3 flex-wrap">
        <Link to="/upload-resume" className="bg-indigo-600 text-white px-4 py-2 rounded">Upload Resume</Link>
        <Link to="/interview" className="border px-4 py-2 rounded">Give Interview</Link>
        <Link to="/history" className="border px-4 py-2 rounded">My Interviews</Link>
      </div>
    </div>

    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-2">Quick Insights</h3>
      <p className="text-gray-600 text-sm">View weak areas and prep guide anytime.</p>
      <Link to="/prep-guide" className="text-indigo-600 text-sm mt-2 inline-block">View Prep Guide →</Link>
    </div>
  </div>
);

export default Dashboard;
