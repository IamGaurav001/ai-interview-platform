import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/intervueai-logo.png";
import { 
  Mic, 
  FileText, 
  Sparkles, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Play, 
  TrendingUp, 
  Users, 
  Shield,
  Zap,
  Target,
  Award
} from "lucide-react";

// --- Animation Variants ---

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// --- Components ---

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div 
    variants={fadeInUp}
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
    <div className={`relative h-12 w-12 rounded-xl bg-${color}-100 flex items-center justify-center mb-6 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{title}</h3>
    <p className="text-slate-600 leading-relaxed relative z-10">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description, icon: Icon }) => (
  <motion.div 
    variants={fadeInUp}
    className="relative flex flex-col items-center text-center p-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-orange-100 flex items-center justify-center mb-6 border border-orange-50 relative z-10">
      <Icon className="h-8 w-8 text-orange-600" />
      <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-4 border-slate-50">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role, company, rating = 5 }) => (
  <motion.div 
    variants={fadeInUp}
    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-slate-700 text-lg mb-6 italic leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
        {author.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{author}</h4>
        <p className="text-slate-500 text-xs">{role} at {company}</p>
      </div>
    </div>
  </motion.div>
);

// --- Main Page ---

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const mockInterviews = [
    {
      question: "Can you describe a challenging project you worked on and how you overcame obstacles?",
      answer: "In my previous role, we faced a critical database scaling issue..."
    },
    {
      question: "How do you handle constructive criticism?",
      answer: "I view it as an opportunity to grow and improve my skills..."
    },
    {
      question: "Tell me about a time you showed leadership.",
      answer: "I took the initiative to organize a team hackathon..."
    }
  ];

  const [currentInterviewIndex, setCurrentInterviewIndex] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInterviewIndex((prevIndex) => (prevIndex + 1) % mockInterviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-2 sm:px-6 lg:px-8 overflow-hidden">
          {/* Animated Background Elements */}
          <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl" />
          <motion.div style={{ y: y2 }} className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl" />
          <div className="absolute "></div>

          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-blue-100 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-sm font-medium text-blue-900">New: Voice Analysis 2.0</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Master Your <br/>
                <span className="text-orange-600">
                  Dream Interview
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Practice with our hyper-realistic AI interviewer. Get instant, actionable feedback on your answers, body language, and speaking pace.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Practicing Free <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5" /> Watch Demo
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> 4.9/5 Average Rating
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual/Demo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl shadow-blue-200/50 border border-slate-200 p-2 overflow-hidden">
                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  {/* Mock UI Header */}
                  <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-4 h-6 w-32 bg-slate-100 rounded-md" />
                  </div>
                  
                  {/* Mock UI Content */}
                  <div className="p-6 space-y-6">
                    {/* AI Message */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 max-w-md">
                        <p className="text-sm text-slate-700 font-medium">{mockInterviews[currentInterviewIndex].question}</p>
                      </div>
                    </div>

                    {/* User Answer (Animated) */}
                    <div className="flex gap-4 flex-row-reverse">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-xs text-slate-600">YOU</span>
                      </div>
                      <div className="bg-orange-600 p-4 rounded-2xl rounded-tr-none shadow-md max-w-md">
                        <p className="text-sm text-white">
                          {mockInterviews[currentInterviewIndex].answer}
                          <motion.span 
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-1.5 h-4 bg-white ml-1 align-middle"
                          />
                        </p>
                      </div>
                    </div>

                    {/* AI Analysis Card */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                      className="bg-green-50 border border-green-100 rounded-xl p-4 mt-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase">Live Analysis</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-green-800">
                          <span>STAR Method</span>
                          <span>9/10</span>
                        </div>
                        <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "90%" }}
                            transition={{ delay: 2, duration: 1 }}
                            className="h-full bg-green-500 rounded-full" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mic className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Speech Clarity</p>
                    <p className="text-lg font-bold text-slate-900">98%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Everything you need to ace the interview
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-slate-600">
                Our AI-powered platform provides comprehensive tools to prepare you for any interview scenario.
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={Mic}
                title="Voice Analysis"
                description="Get real-time feedback on your speaking pace, tone, and clarity to sound more confident."
                color="purple"
              />
              <FeatureCard 
                icon={Brain}
                title="Smart Questioning"
                description="Questions adapt to your responses, digging deeper just like a real hiring manager would."
                color="indigo"
              />
              <FeatureCard 
                icon={FileText}
                title="Resume Integration"
                description="Upload your resume to get tailored questions about your specific experience and projects."
                color="blue"
              />
              <FeatureCard 
                icon={Target}
                title="Role Specific"
                description="Practice for specific roles like Software Engineer, PM, or Designer with curated question banks."
                color="green"
              />
              <FeatureCard 
                icon={Zap}
                title="Instant Feedback"
                description="Receive detailed scorecards immediately after each answer, highlighting strengths and weaknesses."
                color="yellow"
              />
              <FeatureCard 
                icon={TrendingUp}
                title="Progress Tracking"
                description="Monitor your improvement over time with detailed analytics and performance trends."
                color="red"
              />
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Your path to success
              </motion.h2>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-12 relative"
            >
              {/* Connector Line */}
              <div className="hidden md:block absolute top-14 left-0 w-full h-0.5 bg-blue-200 -z-10" />
              
              <StepCard 
                number="1"
                title="Upload Resume"
                description="Our AI scans your resume to understand your background and expertise."
                icon={FileText}
              />
              <StepCard 
                number="2"
                title="Practice Interview"
                description="Answer dynamic questions in a simulated video call environment."
                icon={Mic}
              />
              <StepCard 
                number="3"
                title="Get Hired"
                description="Review feedback, improve your weak spots, and land the job."
                icon={Award}
              />
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Loved by job seekers
              </h2>
              <p className="text-lg text-slate-600">
                Join thousands of candidates who aced their interviews with PrepHire.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              <TestimonialCard 
                quote="The behavioral questions were spot on. I felt so much more prepared for the 'tell me about a time' questions."
                author="Sarah Chen"
                role="Product Manager"
                company="TechCorp"
              />
              <TestimonialCard 
                quote="I used to get nervous and ramble. The pacing feedback helped me learn to pause and structure my answers."
                author="Michael Ross"
                role="Software Engineer"
                company="StartUp Inc"
              />
              <TestimonialCard 
                quote="Incredible tool. The resume-specific questions caught me off guard in a good way - exactly like the real interview."
                author="Jessica Wu"
                role="UX Designer"
                company="Design Studio"
              />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
          >
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to upgrade your career?
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join today and get your first 3 mock interviews completely free. No credit card required.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-5 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Get Started Now <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-6 text-sm text-slate-400">
                Trusted by candidates from top tech companies
              </p>
            </div>
          </motion.div>
        </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              </Link>
              <p className="text-slate-500 max-w-xs">
                The smartest way to prepare for your next interview. AI-powered feedback, tailored to you.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/features" className="hover:text-orange-600">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-orange-600">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-orange-600">Live Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/about" className="hover:text-orange-600">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-orange-600">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-orange-600">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} PrepHire. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-orange-600">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-orange-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Landing;