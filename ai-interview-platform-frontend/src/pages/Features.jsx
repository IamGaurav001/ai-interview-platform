import React, { useRef } from "react";
import PageLayout from "../components/PageLayout";
import { Mic, Brain, TrendingUp, FileText, Zap, Shield, CheckCircle2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import Footer from "../components/landing/Footer";

const Features = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageLayout>
      <SEO title="Features" description="Explore PrepHire's AI-powered features: Real-time Voice Analysis, Adaptive AI, Progress Tracking, and Resume Integration." />
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="relative bg-slate-900 py-16 sm:py-24 lg:py-32 overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-8">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-30 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-30 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500 rounded-full"></div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 sm:mb-6"
            >
              Supercharge your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                interview preparation
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-300 max-w-2xl mx-auto px-2"
            >
              Everything you need to practice, improve, and succeed. Powered by state-of-the-art AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-12 flex justify-center"
            >
              <motion.button
                onClick={scrollToFeatures}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="cursor-pointer hover:text-white transition-colors"
                aria-label="Scroll to features"
              >
                <ChevronDown className="h-8 w-8 text-slate-400 opacity-75 hover:opacity-100" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div ref={featuresRef} className="py-16 sm:py-24 lg:py-32 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            >
              {/* Feature 1: Voice Analysis (Large) */}
              <motion.div variants={item} className="md:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600">
                    <Mic className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Real-time Voice Analysis</h3>
                  <p className="text-lg text-slate-500 max-w-md mb-8">
                    Our AI listens to your responses and provides instant feedback on your speaking pace, clarity, and confidence levels.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> Pace Detection
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> Filler Words
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2: Smart Questions */}
              <motion.div variants={item} className="bg-gradient-to-br from-blue-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mb-8 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Adaptive AI</h3>
                  <p className="text-blue-100">
                    Questions that adapt to your responses, digging deeper just like a real hiring manager would.
                  </p>
                </div>
              </motion.div>

              {/* Feature 3: Analytics */}
              <motion.div variants={item} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-sm border border-slate-200 group hover:shadow-xl transition-all duration-300">
                <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center mb-8 text-green-600">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Progress Tracking</h3>
                <p className="text-slate-500">
                  Visualize your improvement over time with detailed charts and performance metrics.
                </p>
              </motion.div>

              {/* Feature 4: Resume Integration */}
              <motion.div variants={item} className="md:col-span-2 bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Resume Integration</h3>
                    <p className="text-slate-300 text-lg">
                      Upload your resume and job description. Our AI generates tailored questions that match your specific profile and target role.
                    </p>
                  </div>
                  <div className="w-full md:w-1/3 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                      <div className="h-2 w-full bg-white/20 rounded"></div>
                      <div className="h-2 w-5/6 bg-white/20 rounded"></div>
                      <div className="h-20 w-full bg-white/10 rounded mt-4 border border-white/10 flex items-center justify-center text-xs text-slate-400">
                        PDF / DOCX
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </PageLayout>
  );
};

export default Features;
