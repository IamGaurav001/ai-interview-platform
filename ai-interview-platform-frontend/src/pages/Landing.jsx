import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/layout/SEO";
import Hero from "../components/features/landing/Hero";
import SocialProof from "../components/features/landing/SocialProof";
import DemoVideo from "../components/features/landing/DemoVideo";
import Features from "../components/features/landing/Features";
import Testimonials from "../components/features/landing/Testimonials";
import CTA from "../components/features/landing/CTA";
import Footer from "../components/features/landing/Footer";
import { motion } from "framer-motion";

const ScrollReveal = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden scroll-smooth">
      <SEO 
        title="PrepHire - Practice & Ace Your Interviews" 
        description="PrepHire is an AI-powered interview preparation platform that helps you practice and ace your interviews with real-time feedback."
      />
      
      <Hero />
      
      <ScrollReveal>
        <SocialProof />
      </ScrollReveal>
      
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      
      <ScrollReveal>
        <DemoVideo />
      </ScrollReveal>
      
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      
      <ScrollReveal>
        <CTA />
      </ScrollReveal>
      
      <Footer />
    </div>
  );
};

export default Landing;