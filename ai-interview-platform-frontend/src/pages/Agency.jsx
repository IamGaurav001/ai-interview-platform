import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { 
  ArrowRight, 
  ChevronDown, 
  Cpu, 
  Layers, 
  Globe, 
  Shield, 
  Menu, 
  X, 
  Code, 
  Cloud, 
  Database, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Mail, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import SEO from "../components/layout/SEO";

// Custom Stagger Container & Transition Presets
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const fadeLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const fadeRight = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const Agency = () => {
  // States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [openFaq, setOpenFaq] = useState(null);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Services list
  const services = [
    {
      icon: <Code className="h-6 w-6 text-[#233E8B]" />,
      title: "Custom Platform Engineering",
      description: "We build scalable web application architectures designed for high traffic, low latency, and infinite scaling capabilities."
    },
    {
      icon: <Cloud className="h-6 w-6 text-[#3B82F6]" />,
      title: "Cloud Migration & Architecture",
      description: "Transition your legacy infrastructure to modern serverless and microservice ecosystems with zero operational downtime."
    },
    {
      icon: <Shield className="h-6 w-6 text-[#FF4D6D]" />,
      title: "Enterprise Cybersecurity",
      description: "Establish robust, zero-trust network systems, comprehensive compliance configurations, and strict security posture controls."
    },
    {
      icon: <Cpu className="h-6 w-6 text-[#233E8B]" />,
      title: "AI Integration & Workflows",
      description: "Embed state-of-the-art machine learning models and automated intelligent agents deep within your product stack."
    },
    {
      icon: <Database className="h-6 w-6 text-[#3B82F6]" />,
      title: "High-Performance Analytics",
      description: "Construct real-time streaming data ingestion pipelines, analytical data lakehouses, and sleek intelligence dashboards."
    },
    {
      icon: <Layers className="h-6 w-6 text-[#FF4D6D]" />,
      title: "Next-Gen UI/UX Consulting",
      description: "Align your product features with modern visual standards, sleek micro-interactions, and premium design patterns."
    }
  ];

  // Solutions data
  const solutions = [
    {
      tag: "Fintech",
      title: "Ultra-Secure Transaction Processing",
      stat: "$2.4B+",
      statLabel: "Volume Cleared"
    },
    {
      tag: "Healthcare",
      title: "HIPAA Compliant Patient Core API",
      stat: "99.99%",
      statLabel: "Uptime Guaranteed"
    },
    {
      tag: "SaaS Platforms",
      title: "Multi-tenant Subscription Pipelines",
      stat: "10x",
      statLabel: "Faster Scaling"
    }
  ];

  // Tabs for interactive showcase
  const tabs = {
    analytics: {
      label: "Real-time Metrics",
      title: "Advanced Streaming Intelligence",
      description: "Gain dynamic visibility into operations. Our streaming data interface pulls raw event matrices, aggregates them instantly, and renders visual analytics tables with zero lag.",
      mockup: (
        <div className="bg-[#111827] text-white p-6 rounded-2xl border border-slate-800 shadow-2xl h-full font-mono text-xs flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF4D6D]" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
            </div>
            <span className="text-slate-500 text-[10px]">data-stream-ingest.log</span>
          </div>
          <div className="space-y-2 py-4 flex-1">
            <p className="text-emerald-400">[info] 21:14:02 - Incoming API request payload: {`{ tenant: "acme" }`}</p>
            <p className="text-[#3B82F6]">[debug] DB connection pools refreshed (12 open pools active)</p>
            <p className="text-slate-400">[info] Latency calculation: gemini-pro-1.5 latency check: 180ms</p>
            <p className="text-[#FF4D6D]">[warn] Peak volume detected: scaling auto-instances (nodes: 4 {"->"} 8)</p>
            <p className="text-emerald-400">[info] 21:14:03 - Response compiled, caching event header...</p>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500">Latency</p>
              <p className="text-sm font-bold text-white">42ms</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Auto-Scale</p>
              <p className="text-sm font-bold text-emerald-400">Active</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Cache Hits</p>
              <p className="text-sm font-bold text-[#3B82F6]">94.2%</p>
            </div>
          </div>
        </div>
      )
    },
    infrastructure: {
      label: "Global Delivery",
      title: "Distributed Edge Execution",
      description: "Scale applications closer to users. We manage globally distributed server fleets that provision dynamic resources on demand, ensuring minimal latency and ironclad redundancy.",
      mockup: (
        <div className="bg-[#111827] text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold font-manrope text-slate-400 tracking-wide">Infrastructure Network Map</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">All Nodes Healthy</span>
          </div>
          <div className="py-6 flex items-center justify-center flex-1">
            <svg className="w-full max-w-[280px] h-32" viewBox="0 0 200 100" fill="none">
              <circle cx="20" cy="50" r="6" fill="#3B82F6" className="animate-pulse" />
              <circle cx="100" cy="20" r="6" fill="#233E8B" />
              <circle cx="100" cy="80" r="6" fill="#FF4D6D" />
              <circle cx="180" cy="50" r="6" fill="#3B82F6" className="animate-pulse" />
              
              <line x1="26" y1="48" x2="94" y2="22" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="26" y1="52" x2="94" y2="78" stroke="#475569" strokeWidth="1" />
              <line x1="106" y1="22" x2="174" y2="48" stroke="#475569" strokeWidth="1" />
              <line x1="106" y1="78" x2="174" y2="52" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="100" y1="26" x2="100" y2="74" stroke="#475569" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">US-West (Oregon)</span>
              <span className="text-emerald-400 font-bold">12ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">EU-Central (Frankfurt)</span>
              <span className="text-emerald-400 font-bold">48ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AP-Southeast (Singapore)</span>
              <span className="text-emerald-400 font-bold">62ms</span>
            </div>
          </div>
        </div>
      )
    },
    integrations: {
      label: "Ecosystem Access",
      title: "Extensible Integration Hub",
      description: "Establish fast connections. Connect your core product ecosystem to databases, third-party microservices, analytical software, and custom automated tools effortlessly.",
      mockup: (
        <div className="bg-[#111827] text-white p-6 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold font-manrope text-slate-400">Integration Pipelines</span>
            <span className="text-slate-500 text-xs font-mono">active: 32/32</span>
          </div>
          <div className="space-y-4 py-4 flex-1">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-[#233E8B]/30 flex items-center justify-center font-bold text-xs text-white">DB</div>
                <span className="text-sm font-semibold">PostgreSQL Engine</span>
              </div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Connected</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-[#FF4D6D]/30 flex items-center justify-center font-bold text-xs text-white">AI</div>
                <span className="text-sm font-semibold">Gemini Ingestion Core</span>
              </div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Connected</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-[#3B82F6]/30 flex items-center justify-center font-bold text-xs text-white">IO</div>
                <span className="text-sm font-semibold">Stripe Billing Pipeline</span>
              </div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Connected</span>
            </div>
          </div>
        </div>
      )
    }
  };

  // FAQs list
  const faqs = [
    {
      q: "How does the engagement workflow look like?",
      a: "We start with a thorough alignment session, mapping out features and specifications. Following this, we deploy senior engineers to build prototype architectures, conducting weekly syncs and offering real-time Slack/Vercel previews."
    },
    {
      q: "Do you build custom API integrations or stick to templates?",
      a: "Every application is built entirely from scratch. We compile tailored schema files, optimize specific API endpoints, and setup high-performance cloud frameworks optimized exclusively for your platform's operational scale."
    },
    {
      q: "How does billing and pricing scale?",
      a: "We work on a transparent project-based roadmap or specialized resource retainers. All project scopes are agreed upfront, and billing intervals are tied to concrete project milestone deliveries."
    },
    {
      q: "What security measures do you implement?",
      a: "We build zero-trust client architectures by default. This includes strict JWT token handling, robust security headers, secure database parameters, automated pen-testing runs, and full GDPR/HIPAA compliance architectures where needed."
    }
  ];

  return (
    <div className="bg-white min-h-screen font-manrope text-[#111827] selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden scroll-smooth font-manrope">
      <SEO 
        title="ApexTech | Premium Digital Products & Enterprise Engineering" 
        description="ApexTech designs and builds state-of-the-art enterprise SaaS, custom cloud systems, and intelligent machine learning platforms."
      />

      {/* Sticky Custom Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#E5E7EB] bg-white/70 backdrop-blur-md transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#233E8B] to-[#3B82F6] flex items-center justify-center text-white font-black text-lg shadow-sm">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111827] font-manrope">ApexTech</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">Services</a>
            <a href="#solutions" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">Solutions</a>
            <a href="#showcase" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">Showcase</a>
            <a href="#case-studies" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">Case Studies</a>
            <a href="#faq" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="#contact" className="text-sm font-semibold text-[#111827] hover:text-[#233E8B] transition-colors">Sign In</a>
            <a 
              href="#contact" 
              className="px-5 py-2.5 bg-[#233E8B] hover:bg-[#233E8B]/95 text-white rounded-full text-sm font-semibold tracking-wide transition-all shadow-sm hover:scale-[1.03] active:scale-[0.98]"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#111827] hover:bg-slate-50 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-[#E5E7EB] px-6 py-6 space-y-4 overflow-hidden"
            >
              <a 
                href="#services" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Services
              </a>
              <a 
                href="#solutions" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Solutions
              </a>
              <a 
                href="#showcase" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Showcase
              </a>
              <a 
                href="#case-studies" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Case Studies
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                FAQ
              </a>
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-3">
                <a 
                  href="#contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold text-[#111827]"
                >
                  Sign In
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 bg-[#233E8B] text-white rounded-full text-sm font-semibold"
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 md:pt-44 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.06),rgba(255,255,255,0))]" />
        
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-[#E5E7EB] text-[#233E8B] text-xs font-semibold tracking-wide mb-6 shadow-sm uppercase"
            >
              <Sparkles className="h-3 w-3 text-[#FF4D6D] fill-[#FF4D6D]/20 animate-pulse" />
              <span>Next Generation Digital Engineering</span>
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#111827] leading-[1.05] tracking-[-0.03em] mb-6 font-manrope"
            >
              We craft high-performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#233E8B] via-[#3B82F6] to-[#FF4D6D]">enterprise platforms</span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="text-lg md:text-xl text-[#6B7280] leading-relaxed mb-8 max-w-2xl font-manrope"
            >
              ApexTech partner with visionary organizations to conceptualize, design, and program custom application suites, zero-trust cloud setups, and intelligent algorithms.
            </motion.p>

            <motion.div 
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
            >
              <a 
                href="#contact" 
                className="px-8 py-4 bg-[#233E8B] hover:bg-[#233E8B]/95 text-white font-semibold text-base rounded-full shadow-lg shadow-blue-500/10 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Initiate Project</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#case-studies" 
                className="px-8 py-4 bg-white border border-[#E5E7EB] hover:border-[#6B7280] text-[#111827] font-semibold text-base rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Read Case Studies</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Premium UI Mockup Showcase */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 md:mt-24 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 bottom-0 h-24" />
            <div className="bg-[#111827]/30 p-2.5 rounded-[28px] border border-slate-200/50 backdrop-blur-sm shadow-2xl shadow-blue-500/5">
              <div className="bg-slate-50 border border-slate-100 rounded-[20px] overflow-hidden shadow-inner">
                {/* Header elements */}
                <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="px-12 py-1 rounded bg-slate-100 text-[10px] text-slate-400 font-mono">apextech-core-runtime.io</div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 bg-slate-100 rounded" />
                  </div>
                </div>

                {/* Body details */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50">
                  <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Processes</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-3xl font-extrabold text-[#111827]">94,204</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <span>+12.4% this week</span>
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">API Data Ingest</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold">120ms</span>
                      </div>
                      <p className="text-3xl font-extrabold text-[#111827]">1.2B</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-[#3B82F6] font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                      <span>Network Load: Stable</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency Multiplier</span>
                        <span className="h-2 w-2 rounded-full bg-[#FF4D6D]" />
                      </div>
                      <p className="text-3xl font-extrabold text-[#111827]">14.8x</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-rose-600 font-semibold bg-rose-50/50 px-2.5 py-1 rounded-lg">
                      <span>Optimized Core Engine</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted Logos Bar */}
      <section className="py-12 border-y border-[#E5E7EB] bg-slate-50/50 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <p className="text-center text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-8">
            Empowering Teams At World-Class Innovators
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-65">
            <span className="text-lg font-extrabold tracking-tight text-[#111827] font-manrope">ACME CORP</span>
            <span className="text-lg font-extrabold tracking-tight text-[#111827] font-manrope">GLOBEX</span>
            <span className="text-lg font-extrabold tracking-tight text-[#111827] font-manrope">INITECH</span>
            <span className="text-lg font-extrabold tracking-tight text-[#111827] font-manrope">UMBRELLA</span>
            <span className="text-lg font-extrabold tracking-tight text-[#111827] font-manrope">STARK IND</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-[120px] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#233E8B]/10 text-[#233E8B] text-xs font-bold uppercase tracking-wider mb-4">
              Our Capabilities
            </div>
            <h2 className="text-3xl md:text-[44px] font-semibold text-[#111827] tracking-tight leading-tight mb-6 font-manrope">
              Enterprise engineering built for performance, security, and velocity.
            </h2>
            <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl font-manrope">
              We compile, build, and optimize application runtimes configured uniquely to resolve complex requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-[#F8FAFC] p-8 rounded-[24px] border border-[#E5E7EB] transition-all hover:shadow-xl hover:shadow-[#233E8B]/5 hover:border-blue-200 group"
              >
                <div className="h-12 w-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm mb-6 transition-all group-hover:scale-110 group-hover:border-blue-400">
                  {service.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#111827] mb-3 tracking-tight font-manrope">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-manrope">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="py-[120px] bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D6D]/10 text-[#FF4D6D] text-xs font-bold uppercase tracking-wider mb-4 font-manrope">
              Target Solutions
            </div>
            <h2 className="text-3xl md:text-[44px] font-semibold text-[#111827] tracking-tight leading-tight mb-6 font-manrope">
              Tailored software paradigms designed to scale specific markets.
            </h2>
            <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl font-manrope">
              We leverage modern platform paradigms to build highly tailored client modules optimized for scale and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((sol, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-[28px] border border-[#E5E7EB] p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-[#FF4D6D] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                    {sol.tag}
                  </span>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#111827] tracking-tight leading-snug mb-8 font-manrope">
                    {sol.title}
                  </h3>
                </div>
                <div className="border-t border-slate-100 pt-6">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Impact Metric</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-[#233E8B] tracking-tight">{sol.stat}</span>
                    <span className="text-xs font-semibold text-[#6B7280]">{sol.statLabel}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase / Interactive Tabs */}
      <section id="showcase" className="py-[120px] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold uppercase tracking-wider mb-4 font-manrope">
              Engine Mechanics
            </div>
            <h2 className="text-3xl md:text-[44px] font-semibold text-[#111827] tracking-tight leading-tight mb-6 font-manrope">
              Explore the framework capabilities
            </h2>
            <p className="text-base sm:text-lg text-[#6B7280] font-manrope">
              Click through the interfaces below to preview how our engineering modules ingest, dispatch, and secure global application streams.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Interactive Tab Selectors */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {Object.entries(tabs).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left p-6 rounded-[20px] border transition-all flex flex-col justify-start gap-1 ${
                    activeTab === key
                      ? "bg-white border-[#233E8B] shadow-md shadow-[#233E8B]/5 scale-[1.02]"
                      : "bg-slate-50/50 border-[#E5E7EB] hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    activeTab === key ? "text-[#FF4D6D]" : "text-slate-400"
                  }`}>
                    {value.label}
                  </span>
                  <span className="text-lg font-bold text-[#111827] tracking-tight font-manrope">
                    {value.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Showcase panel */}
            <div className="lg:col-span-8 bg-[#F8FAFC] p-8 rounded-[28px] border border-[#E5E7EB] min-h-[420px] flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-[#111827] tracking-tight leading-tight font-manrope">
                  {tabs[activeTab].title}
                </h3>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-manrope">
                  {tabs[activeTab].description}
                </p>
                <div className="pt-2">
                  <a 
                    href="#contact" 
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#233E8B] hover:text-[#3B82F6] transition-colors"
                  >
                    <span>Read Architecture Specs</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="w-full md:w-80 flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {tabs[activeTab].mockup}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-[120px] bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#233E8B]/10 text-[#233E8B] text-xs font-bold uppercase tracking-wider mb-4 font-manrope">
                Client Success
              </div>
              <h2 className="text-3xl md:text-[44px] font-semibold text-[#111827] tracking-tight leading-tight font-manrope">
                Recent Engineering Achievements
              </h2>
            </div>
            <a 
              href="#contact" 
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-[#233E8B] hover:text-[#3B82F6] font-bold text-base group"
            >
              <span>View All Client Case Studies</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Case 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <div className="bg-white rounded-[28px] overflow-hidden border border-[#E5E7EB] p-4 mb-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden relative flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/50 via-transparent to-transparent opacity-60" />
                  {/* Clean Mockup graphic */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-lg w-full max-w-sm font-mono text-[10px] text-slate-700">
                    <p className="text-slate-400 mb-2">// Ingestion latency matrix</p>
                    <p className="text-[#233E8B] font-bold">Latency: 14ms (avg)</p>
                    <p className="text-emerald-500 font-bold">Ingested Events: 1,402,492 / sec</p>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-[#233E8B] to-[#3B82F6] rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#FF4D6D] uppercase tracking-widest block mb-2 font-manrope">Payments Optimization</span>
              <h3 className="text-2xl font-bold text-[#111827] tracking-tight mb-3 group-hover:text-[#233E8B] transition-colors font-manrope">
                Modernizing Global Rails for FinTech Alliance
              </h3>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-manrope">
                We rebuilt transaction ingest servers from the ground up, reducing clearance overhead by 40% and deploying robust multi-zone database sync nodes.
              </p>
            </motion.div>

            {/* Case 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-[28px] overflow-hidden border border-[#E5E7EB] p-4 mb-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden relative flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/50 via-transparent to-transparent opacity-60" />
                  {/* Clean Mockup graphic */}
                  <div className="bg-[#111827] p-6 rounded-xl border border-slate-800 shadow-lg w-full max-w-sm text-xs text-slate-300">
                    <p className="text-slate-500 mb-2 font-mono">// Edge sync execution check</p>
                    <div className="space-y-1.5 font-mono">
                      <p className="text-emerald-400">node: AP-East (Healthy)</p>
                      <p className="text-emerald-400">node: US-East (Healthy)</p>
                      <p className="text-emerald-400">node: EU-West (Healthy)</p>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#FF4D6D] uppercase tracking-widest block mb-2 font-manrope">Cloud Infrastructure</span>
              <h3 className="text-2xl font-bold text-[#111827] tracking-tight mb-3 group-hover:text-[#233E8B] transition-colors font-manrope">
                Global Edge Fleet Migration for Initech Group
              </h3>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-manrope">
                Migrating full infrastructure nodes to Edge Workers. The transition yielded complete zero-downtime execution and reduced average loading times globally to under 80ms.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-[120px] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#233E8B]/10 text-[#233E8B] text-xs font-bold uppercase tracking-wider mb-4 font-manrope">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-[44px] font-semibold text-[#111827] tracking-tight leading-tight mb-6 font-manrope">
              What industry leaders say about us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F8FAFC] p-8 rounded-[24px] border border-[#E5E7EB]">
              <p className="text-[#111827] text-base leading-relaxed mb-6 font-manrope">
                "ApexTech engineered a state-of-the-art payment routing engine for us. Their team writes exceptionally clean code, responds instantly, and built a system that cleans 2M daily events without breaking a sweat."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#233E8B] flex items-center justify-center font-bold text-white text-sm">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">John Doe</h4>
                  <p className="text-xs text-[#6B7280]">VP Engineering at FinTech Corp</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-[24px] border border-[#E5E7EB]">
              <p className="text-[#111827] text-base leading-relaxed mb-6 font-manrope">
                "Their engineering consult transformed our cloud deployment cycles. We went from manual, fragile releases to a fully automated pipeline with 99.99% edge runtime uptime."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#3B82F6] flex items-center justify-center font-bold text-white text-sm">
                  SM
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Sarah Meyer</h4>
                  <p className="text-xs text-[#6B7280]">CTO at Globex Analytics</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-[24px] border border-[#E5E7EB]">
              <p className="text-[#111827] text-base leading-relaxed mb-6 font-manrope">
                "An incredible level of detail and responsiveness. The custom database cluster and automated pipelines they implemented saved us thousands of dollars in server overhead."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FF4D6D] flex items-center justify-center font-bold text-white text-sm">
                  RK
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Ryan Karr</h4>
                  <p className="text-xs text-[#6B7280]">Engineering Lead at Initech SaaS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-[120px] bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D6D]/10 text-[#FF4D6D] text-xs font-bold uppercase tracking-wider mb-4 font-manrope">
              Common Questions
            </div>
            <h2 className="text-3xl md:text-[44px] font-semibold text-[#111827] tracking-tight leading-tight mb-6 font-manrope">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-[#111827] hover:text-[#233E8B] transition-colors"
                  >
                    <span className="font-manrope text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm sm:text-base text-[#6B7280] leading-relaxed border-t border-slate-100 pt-4 font-manrope">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ CTA Section */}
      <section id="contact" className="py-[120px] bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="relative bg-[#111827] rounded-[32px] p-8 md:p-16 overflow-hidden border border-slate-800 shadow-2xl text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(59,130,246,0.12),rgba(17,24,39,0))]" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-widest">
                Start Your Journey
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight font-manrope">
                Ready to build something phenomenal?
              </h2>
              <p className="text-base sm:text-lg text-slate-400 font-manrope">
                Let's consult on your core cloud infrastructure, custom database, and product design specifications.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:consulting@apextech.co"
                  className="px-8 py-4 bg-[#3B82F6] hover:bg-[#3B82F6]/95 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <Mail className="h-5 w-5" />
                  <span>Contact Consulting Team</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-50 border-t border-[#E5E7EB] py-16">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#233E8B] to-[#3B82F6] flex items-center justify-center text-white font-black text-sm">
                A
              </div>
              <span className="font-bold text-lg tracking-tight text-[#111827] font-manrope">ApexTech</span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed font-manrope">
              State-of-the-art enterprise engineering and digital product implementation consulting.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 font-manrope">Services</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280] font-manrope">
              <li><a href="#services" className="hover:text-[#111827] transition-colors">Platform Development</a></li>
              <li><a href="#services" className="hover:text-[#111827] transition-colors">Cloud Architecture</a></li>
              <li><a href="#services" className="hover:text-[#111827] transition-colors">Cybersecurity Core</a></li>
              <li><a href="#services" className="hover:text-[#111827] transition-colors">Machine Learning APIs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 font-manrope">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280] font-manrope">
              <li><a href="#case-studies" className="hover:text-[#111827] transition-colors">Our Showcase</a></li>
              <li><a href="#case-studies" className="hover:text-[#111827] transition-colors">Case Studies</a></li>
              <li><a href="#faq" className="hover:text-[#111827] transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 font-manrope">Subscribe</h4>
            <p className="text-xs text-[#6B7280] mb-4 font-manrope">Get high-end engineering updates monthly.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="you@domain.com"
                className="flex-1 px-4 py-2 text-xs rounded-full border border-slate-200 bg-white focus:outline-none focus:border-[#233E8B] font-manrope text-[#111827]"
              />
              <button className="px-4 py-2 bg-[#233E8B] hover:bg-[#233E8B]/95 text-white text-xs font-semibold rounded-full shadow transition-all hover:scale-105 active:scale-[0.97]">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 mt-12 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-[#6B7280] font-manrope">&copy; {new Date().getFullYear()} ApexTech Consulting. All rights reserved.</p>
          <div className="flex gap-6 text-[11px] text-[#6B7280] font-manrope">
            <a href="#" className="hover:text-[#111827] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#111827] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Agency;
