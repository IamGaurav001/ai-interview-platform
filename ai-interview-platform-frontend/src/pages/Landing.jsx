import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import Hero from "../components/landing/Hero";
import SocialProof from "../components/landing/SocialProof";
import DemoVideo from "../components/landing/DemoVideo";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

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
      <SocialProof />
      <DemoVideo />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;