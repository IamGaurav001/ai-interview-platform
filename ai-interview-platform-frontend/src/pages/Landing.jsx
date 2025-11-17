import React, { useEffect } from "react";
// Router helpers used by the page
import { Link, useNavigate } from "react-router-dom";
// Import the logo file (use local asset)
import logo from "../assets/intervueai-logo.png";

// --- Import Animation Library ---
import { motion } from "framer-motion";

// Use the app's Auth context hook instead of a local mock
import { useAuth } from "../context/AuthContext";


/* --- Inline SVG Icons --- */
const ArrowUpTrayIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1={12} y1={3} x2={12} y2={15} />
  </svg>
);

const MicIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1={12} y1={19} x2={12} y2={22} />
  </svg>
);

const FileTextIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1={16} y1={13} x2={8} y2={13} />
    <line x1={16} y1={17} x2={8} y2={17} />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SparklesIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const BrainIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7v0A2.5 2.5 0 0 1 7 9.5v0A2.5 2.5 0 0 1 4.5 12v0A2.5 2.5 0 0 1 2 14.5v0A2.5 2.5 0 0 1 4.5 17v0A2.5 2.5 0 0 1 7 19.5v0A2.5 2.5 0 0 1 9.5 22v0" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v0A2.5 2.5 0 0 0 14.5 7v0A2.5 2.5 0 0 0 17 9.5v0A2.5 2.5 0 0 0 19.5 12v0A2.5 2.5 0 0 0 22 14.5v0A2.5 2.5 0 0 0 19.5 17v0A2.5 2.5 0 0 0 17 19.5v0A2.5 2.5 0 0 0 14.5 22v0" />
    <path d="M12 4.5a2.5 2.5 0 0 0 0 15" />
  </svg>
);

const GraduationCapIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.66 4 3 10 0v-5" />
  </svg>
);

const StarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* --- Animation Variants --- */
// Defines the animation states for Framer Motion
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Staggers the animation of children
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { y: 30, opacity: 0 }, // Start 30px down and invisible
  visible: {
    y: 0,
    opacity: 1, // Animate to original position and visible
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 }, // Start slightly smaller and invisible
  visible: {
    scale: 1,
    opacity: 1, // Animate to full size and visible
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1], // Custom ease-out curve
    },
  },
};

const headerVariant = {
  hidden: { y: -30, opacity: 0 }, // Start 30px up and invisible
  visible: {
    y: 0,
    opacity: 1, // Animate to original position and visible
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};
/* --- End Animation Variants --- */


/* --- The Main Landing Page Component --- */
const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If the user is logged in, redirect them to the dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    // Use Inter font and a light background
    <div className="font-sans bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
      {/* Header / Navbar */}
      <motion.header 
        className="fixed top-0 left-0 w-full z-50"
        variants={headerVariant}
        initial="hidden"
        animate="visible"
      >
        {/* Blurred background element */}
        <div className="absolute top-0 left-0 w-full h-full bg-white/60 backdrop-blur-xl border-b border-slate-200/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="IntervueAI Logo"
                className="h-10 w-auto" // Using the imported logo
              />
            </Link>

            {/* Navigation Links (CTAs) */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="relative max-w-7xl mx-auto py-24 md:py-36 px-4 sm:px-6 lg:px-8">
          {/* Background Gradient Glows */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-200/50 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-0 -right-20 w-72 h-72 bg-indigo-200/50 rounded-full filter blur-3xl opacity-50 animate-pulse-delay"></div>
          
          {/* Animated text container */}
          <motion.div 
            className="relative z-10 text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold tracking-tighter"
              variants={fadeInUp}
            >
              Land Your Dream Job with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                IntervueAI
              </span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Upload your resume, practice with a hyper-realistic AI, and get
              instant, actionable feedback to ace your next interview.
            </motion.p>
            <motion.div 
              className="mt-10 flex justify-center gap-4"
              variants={fadeInUp}
            >
              <Link
                to="/register"
                className="font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
              >
                Start Practicing Now
              </Link>
            </motion.div>

            {/* Hero Visual (Floating App Mockup) */}
            <motion.div 
              className="mt-20"
              variants={scaleIn}
            >
              <div className="relative max-w-4xl mx-auto w-full">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40"></div>
                {/* The main mockup card */}
                <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-slate-200/50">
                  <div className="bg-slate-100 rounded-lg p-6 border border-slate-200/80">
                    {/* Mock UI window buttons */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="h-3 w-3 bg-slate-300 rounded-full"></span>
                      <span className="h-3 w-3 bg-slate-300 rounded-full"></span>
                      <span className="h-3 w-3 bg-slate-300 rounded-full"></span>
                    </div>
                    {/* Mock UI content */}
                    <div className="bg-white rounded-md shadow p-6">
                      <h4 className="font-semibold text-indigo-600 mb-3 text-left">
                        AI Feedback: "Behavioral Question"
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 text-green-500 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                          </span>
                          <p className="text-slate-700 text-left">
                            <strong className="font-medium text-slate-800">
                              Excellent STAR structure.
                            </strong>{" "}
                            Clear Situation and Task.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 text-yellow-500 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010 13.5h.25a.75.75 0 00.744-.658l.459-2.066a.25.25 0 01.244-.304H12a.75.75 0 000-1.5H9z" clipRule="evenodd" /></svg>
                          </span>
                          <p className="text-slate-700 text-left">
                            <strong className="font-medium text-slate-800">
                              Improvement area:
                            </strong>{" "}
                            Quantify the 'Result' more. What was the exact metric
                            impact?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Feature Section (Bento Grid) */}
      <motion.section 
        className="py-20 bg-white/70 backdrop-blur-md border-t border-slate-200/50"
        initial="hidden"
        whileInView="visible" // Animate when this section scrolls into view
        viewport={{ once: true, amount: 0.1 }} // Animate once, when 10% is visible
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" variants={fadeInUp}>
            <h2 className="text-4xl font-bold tracking-tighter mb-4">
              A Smarter Way to Prepare
            </h2>
            <p className="text-lg text-slate-600">
              Go beyond basic question banks. Our AI understands your unique
              profile.
            </p>
          </motion.div>

          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer} // Stagger the children inside
          >
            {/* Feature 1 (Large) */}
            <motion.div 
              className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-xl shadow-slate-900/5 border border-white"
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full">
                <MicIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Hyper-Realistic AI Interviews
              </h3>
              <p className="text-slate-600">
                Engage in natural, spoken conversations with an AI that adapts
                to your answers, just like a real hiring manager. Practice
                behavioral, technical, and domain-specific questions.
              </p>
            </motion.div>

            {/* Feature 2 (Small) */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50"
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-slate-100 text-indigo-600 rounded-full">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Resume-Based Questions
              </h3>
              <p className="text-slate-600">
                Upload your resume to get questions tailored specifically to
                your experience and skills.
              </p>
            </motion.div>

            {/* Feature 3 (Small) */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50"
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-slate-100 text-indigo-600 rounded-full">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Instant, Actionable Feedback
              </h3>
              <p className="text-slate-600">
                Get immediate scores and detailed breakdowns on clarity,
                structure (STAR method), and confidence.
              </p>
            </motion.div>
            
            {/* Feature 4 (Large) */}
            <motion.div 
              className="md:col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-2xl shadow-slate-900/20 border border-white/10"
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 mb-5 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full">
                <BrainIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Personalized Study Plans
              </h3>
              <p className="text-slate-300">
                Our AI analyzes your weak spots and generates a custom prep
                plan, focusing on the topics and skills you need to improve most.
                Stop guessing, start improving.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-24 bg-slate-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" variants={fadeInUp}>
            <h2 className="text-4xl font-bold tracking-tighter mb-4">
              Get Started in 3 Easy Steps
            </h2>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center relative">
            {/* Dotted line connector */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full mt-[-10px]">
              <svg className="w-full" height="12" preserveAspectRatio="none" viewBox="0 0 100 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 6H100" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />
              </svg>
            </div>

            {/* Step 1 */}
            <motion.div className="relative z-10 bg-slate-50 p-4" variants={fadeInUp}>
              <div className="flex-shrink-0 mb-5 w-16 h-16 flex items-center justify-center bg-white shadow-lg shadow-slate-900/5 text-indigo-600 rounded-full mx-auto border-4 border-slate-100">
                <ArrowUpTrayIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                1. Upload Resume
              </h3>
              <p className="text-slate-600">
                Our AI analyzes your experience to tailor questions specifically
                for your role.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="relative z-10 bg-slate-50 p-4" variants={fadeInUp}>
              <div className="flex-shrink-0 mb-5 w-16 h-16 flex items-center justify-center bg-white shadow-lg shadow-slate-900/5 text-indigo-600 rounded-full mx-auto border-4 border-slate-100">
                <MicIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                2. Start Interview
              </h3>
              <p className="text-slate-600">
                Engage in a realistic mock interview. Speak your answers just
                like the real thing.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="relative z-10 bg-slate-50 p-4" variants={fadeInUp}>
              <div className="flex-shrink-0 mb-5 w-16 h-16 flex items-center justify-center bg-white shadow-lg shadow-slate-900/5 text-indigo-600 rounded-full mx-auto border-4 border-slate-100">
                <GraduationCapIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                3. Get Report
              </h3>
              <p className="text-slate-600">
                Receive an instant, detailed report and a custom plan to
                improve.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" variants={fadeInUp}>
            <h2 className="text-4xl font-bold tracking-tighter mb-4">
              Don't Just Take Our Word For It
            </h2>
            <p className="text-lg text-slate-600">
              See how IntervueAI has helped others land their dream roles.
            </p>
          </motion.div>

          <motion.div 
            className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50 flex flex-col"
              variants={fadeInUp}
            >
              <div className="flex text-yellow-400 mb-4">
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
              </div>
              <p className="text-slate-700 text-lg italic flex-grow">
                "The resume analysis was spot-on. It asked about a project from
                3 years ago I'd forgotten about. Nailed it in the real
                interview."
              </p>
              <div className="flex items-center mt-6">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-700">SR</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-slate-900">Sarah R.</p>
                  <p className="text-sm text-slate-500">
                    Landed role at Google
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50 flex flex-col"
              variants={fadeInUp}
            >
              <div className="flex text-yellow-400 mb-4">
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
              </div>
              <p className="text-slate-700 text-lg italic flex-grow">
                "I used to ramble. The AI's feedback on 'Clarity' and
                'Structure' was a game-changer. I learned to be concise and
                confident."
              </p>
              <div className="flex items-center mt-6">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-700">MJ</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-slate-900">Michael J.</p>
                  <p className="text-sm text-slate-500">
                    Hired as Product Manager
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50 flex flex-col"
              variants={fadeInUp}
            >
              <div className="flex text-yellow-400 mb-4">
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
                <StarIcon className="w-5 h-5" />
              </div>
              <p className="text-slate-700 text-lg italic flex-grow">
                "The study plan was exactly what I needed. Instead of
                practicing random questions, I focused on my weak areas and saw
                my scores jump."
              </p>
              <div className="flex items-center mt-6">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-700">AK</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-slate-900">Alex K.</p>
                  <p className="text-sm text-slate-500">
                    Software Engineer at Startup
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto py-24 md:py-32 px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 md:p-20 text-center overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scaleIn}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM24 30v4h2v-4h4v-2h-4v-4h-2v4h-4v2h4zM12 22v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM24 14v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 6V2h-2v4h-4v2h4v4h2V8h4V6h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tighter">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-lg text-indigo-100 max-w-xl mx-auto mb-10">
                Stop guessing. Start preparing with targeted, intelligent
                practice. Your first interview is free.
              </p>
              <Link
                to="/register"
                className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 shadow-2xl hover:-translate-y-1 transition-all"
              >
                Create Your Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-slate-500 bg-white border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <img src={logo} alt="IntervueAI Logo" className="h-8 w-auto" />
              <p className="text-sm">
                © {new Date().getFullYear()} IntervueAI. All rights reserved.
              </p>
            </div>
            <div className="flex justify-center gap-6 font-medium text-sm">
              <Link to="/privacy" className="hover:text-indigo-600 transition">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-indigo-600 transition">
                Terms
              </Link>
              <Link to="/contact" className="hover:text-indigo-600 transition">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default Landing;