import React from "react";
import { Link } from "react-router-dom";

// --- Heroicons (inline SVG for easy copy-paste) ---
const DocumentTextIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25mC7.714 2.25 7.146 2.25 6.625 2.25H6a3.375 3.375 0 00-3.375 3.375v11.25a3.375 3.375 0 003.375 3.375h7.5a3.375 3.375 0 003.375-3.375v-2.625M16.5 18.75h.008v.008h-.008v-.008zM16.5 12h.008v.008h-.008V12zm0 3.375h.008v.008h-.008v-.008z"
    />
  </svg>
);

const ChatBubbleLeftRightIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.805c-.34.074-.664.176-.976.286S7.387 21 6.75 21c-.638 0-1.257-.065-1.846-.176a4.86 4.86 0 01-.976-.286L.98 19.333c-1.133-.243-1.98-1.27-1.98-2.437v-4.286c0-.97.616-1.813 1.5-2.097S4.625 8.64 6.75 8.64h10.5c2.125 0 3.875-.06 4.5-.129zM9.75 4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v.161c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.875z"
    />
  </svg>
);

const ChartBarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);

const LogoIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5z"
    />
  </svg>
);
// --- End Heroicons ---

const Landing = () => {
  return (
    // The font-sans class will now apply 'Inter'
    <div className="bg-white text-gray-900 font-sans">
      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 w-full z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <LogoIcon className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                AI Interview Coach
              </span>
            </Link>

            {/* Navigation Links (CTAs) */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 font-semibold hover:text-primary-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 shadow-sm transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="max-w-7xl mx-auto py-24 md:py-32 px-6 sm:px-8 grid md:grid-cols-2 gap-16 items-center">
          {/* Hero Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tighter">
              Ace Your Next Interview with{" "}
              <span className="text-primary-600">AI Interview Coach</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
              Upload your resume, practice real interview questions powered by
              AI, and receive personalized feedback with a tailored study
              roadmap.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-primary-700 shadow-lg transition"
              >
                Get Started for Free
              </Link>
              {/* --- IMPROVED SECONDARY BUTTON --- */}
              <Link
                to="/login"
                className="bg-white text-gray-800 font-semibold px-8 py-3.5 rounded-lg border border-gray-300 hover:bg-gray-50 shadow-sm transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero Visual (Mockup) */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-2xl p-4 border border-gray-100">
              <div className="bg-gray-100 rounded-lg p-6">
                {/* Mock UI */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-3 w-3 bg-red-400 rounded-full"></span>
                  <span className="h-3 w-3 bg-yellow-400 rounded-full"></span>
                  <span className="h-3 w-3 bg-green-400 rounded-full"></span>
                </div>
                <div className="bg-white rounded-md shadow p-6">
                  <h4 className="font-semibold text-primary-600 mb-2">
                    Your Question:
                  </h4>
                  <p className="text-gray-700 font-medium">
                    "Tell me about a time you handled a difficult stakeholder."
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 my-5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md font-medium">
                      Clarity: 8/10
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md font-medium">
                      Relevance: 9/10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Feature Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Practice Smarter, Not Harder
            </h2>
            <p className="text-lg text-gray-600">
              Our platform gives you everything you need to walk into your
              interview with confidence.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-indigo-100 text-primary-600 rounded-full">
                <DocumentTextIcon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Intelligent Resume Analysis
              </h3>
              <p className="text-gray-600">
                Upload your resume and let our AI identify key skills and
                generate domain-specific interview questions just for you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-indigo-100 text-primary-600 rounded-full">
                <ChatBubbleLeftRightIcon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                AI-Powered Mock Interviews
              </h3>
              <p className="text-gray-600">
                Experience realistic interview simulations with instant feedback
                on correctness, clarity, and confidence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-indigo-100 text-primary-600 rounded-full">
                <ChartBarIcon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Personalized Prep Plan
              </h3>
              <p className="text-gray-600">
                Get a custom study plan based on your performance. Focus on your
                weak areas and track your improvement over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto py-20 md:py-28 px-6 sm:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-5 tracking-tight">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Join thousands of learners preparing for their dream jobs with AI
            Interview Coach. Your first mock interview is on us.
          </p>
          <Link
            to="/register"
            className="bg-primary-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 shadow-lg transition"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-500 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-10 px-6 sm:px-8 text-center">
          <div className="flex justify-center gap-6 mb-4 font-medium">
            <Link to="/privacy" className="hover:text-primary-600 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-600 transition">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-primary-600 transition">
              Contact
            </Link>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} AI Interview Coach · Built by Gaurav
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;