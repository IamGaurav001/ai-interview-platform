import React from "react";
import PageLayout from "../components/PageLayout";
import { Users, Target, Shield, Award, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import Footer from "../components/landing/Footer";

const About = () => {
//Hi
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      desc: "We're on a relentless mission to democratize career success, making elite interview coaching accessible to everyone, everywhere."
    },
    {
      icon: Users,
      title: "User-Centric",
      desc: "Every feature we build starts with the candidate. We obsess over the details that make interview preparation less stressful and more effective."
    },
    {
      icon: Shield,
      title: "Privacy First",
      desc: "Your career journey is personal. We employ enterprise-grade encryption and strict data policies to ensure your information remains yours."
    },
    {
      icon: Award,
      title: "Excellence",
      desc: "We don't settle for 'good enough'. Our AI models are fine-tuned to provide feedback that rivals the world's top human career coaches."
    }
  ];

  return (
    <PageLayout>
      <SEO title="About Us" description="Learn about PrepHire's mission to democratize career success with AI-powered interview coaching." />
      <div className="bg-slate-50 min-h-screen overflow-hidden">
        {/* Hero Section */}
        <div className="relative bg-slate-900 py-24 sm:py-32 isolate overflow-hidden rounded-2xl mx-auto max-w-7xl">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 blur-3xl opacity-20 w-[60rem] h-[40rem] bg-blue-500 rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 right-0 blur-3xl opacity-20 w-[50rem] h-[30rem] bg-blue-500 rounded-full mix-blend-screen" />
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Revolutionizing Recruitment</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                Empowering the world's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  future workforce
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
                We combine advanced AI with human psychology to build the ultimate interview preparation platform. 
                Practice smarter, not harder.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative -mt-12 mx-auto max-w-7xl px-6 lg:px-8 z-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                You are the next to get hired in your <span className="text-blue-600">dream company</span>
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Our Values</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built on trust, driven by innovation
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <value.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {value.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Ready to start your journey?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Join thousands of candidates who are landing their dream jobs with PrepHire.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="/register"
                  className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:-translate-y-1 flex items-center gap-2"
                >
                  Get started today <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageLayout>
  );
};

export default About;
