import React from "react";
import { Link } from "react-router-dom";


const Landing = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
          Ace Your Next Interview with{" "}
          <span className="text-indigo-600">AI Interview Coach</span>
        </h1>
        <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
          Upload your resume, practice real interview questions powered by AI,
          and get personalized feedback and a 1-month study roadmap.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded font-medium hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/register"
            className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded font-medium hover:bg-indigo-50 transition"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          What You’ll Get
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <div className="bg-indigo-50 p-6 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-indigo-700">
              🧾 Resume Analysis
            </h3>
            <p className="text-gray-600 mt-2">
              Upload your resume and let the AI identify your key skills and
              generate domain-specific interview questions.
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-indigo-700">
              🤖 AI-Powered Mock Interviews
            </h3>
            <p className="text-gray-600 mt-2">
              Experience realistic interview simulations with instant
              feedback on correctness, clarity, and confidence.
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg text-center shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-indigo-700">
              🎯 Personalized Prep Plan
            </h3>
            <p className="text-gray-600 mt-2">
              Get a 4-week study plan based on your performance — focus on your
              weak areas and track improvement.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-indigo-600 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Practice Smarter, Not Harder?
        </h2>
        <p className="text-indigo-100 max-w-xl mx-auto mb-6">
          Join thousands of learners preparing for their dream jobs with AI
          Interview Coach.
        </p>
        <Link
          to="/register"
          className="bg-white text-indigo-600 px-6 py-3 rounded font-medium hover:bg-gray-100 transition"
        >
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm bg-gray-50">
        © {new Date().getFullYear()} AI Interview Coach · Built with ❤️ by Gaurav
      </footer>
    </div>
  );
};

export default Landing;
