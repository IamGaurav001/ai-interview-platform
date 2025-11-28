import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Play,
  Volume2,
  Maximize,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";
import PageLayout from "../components/PageLayout";

// --- Animation Variants ---

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// --- Main Component ---

const WatchDemo = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <PageLayout>
      <main>
        {/* Hero Section with Video */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden py-20">
          {/* Animated Background */}
          <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl" />
          <motion.div style={{ y: y2 }} className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center mb-12"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-blue-100 mb-6">
                <Play className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Watch How It Works</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                See IntervueAI in{" "}
                <span className="text-blue-600">
                  Action
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience how our AI-powered platform transforms interview preparation with real-time feedback and personalized coaching.
              </motion.p>
            </motion.div>

            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-blue-200/50 border border-slate-200 p-4 overflow-hidden">
                {/* Video Container */}
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video">
                  {/* Placeholder for demo video */}
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900">
                    <div className="text-center px-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border-2 border-white/30 cursor-pointer hover:bg-white/30 transition-all"
                      >
                        <Play className="h-12 w-12 text-white ml-1" />
                      </motion.div>
                      <p className="text-white text-xl md:text-2xl font-bold mb-2">Interactive Demo Video</p>
                      <p className="text-white/70 text-sm md:text-base">Click to see the platform in action</p>
                    </div>
                  </div>

                  {/* Simulated UI Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6"
                  >
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30"
                        >
                          <Play className="h-6 w-6 ml-0.5" />
                        </motion.button>
                        <div className="text-sm font-medium">0:00 / 2:45</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="hover:text-white/80 transition-colors"
                        >
                          <Volume2 className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="hover:text-white/80 transition-colors"
                        >
                          <Maximize className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Stats */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Success Rate</p>
                    <p className="text-2xl font-bold text-slate-900">94%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-8 -left-8 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900">10K+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 hidden xl:block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Rating</p>
                    <p className="text-2xl font-bold text-slate-900">4.9/5</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Practicing Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                Back to Home
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm font-medium text-slate-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                4.9/5 Average Rating
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                10,000+ Users
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <motion.div variants={fadeInUp} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">10K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-600 mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">94%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-red-500 mb-3">
                  <Award className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">50K+</div>
                <div className="text-sm text-slate-600">Interviews</div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-yellow-100 text-yellow-600 mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">4.9/5</div>
                <div className="text-sm text-slate-600">Rating</div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default WatchDemo;
