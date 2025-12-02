import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Github } from "lucide-react";
import logo from "../../assets/intervueai-logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-10 md:py-20 border-t border-slate-900 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-10 md:mb-20">
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-block mb-4 md:mb-8">
              <span className="text-2xl font-bold text-white tracking-tight">PrepHire</span>
            </Link>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-sm mb-6 md:mb-8">
              The smartest way to prepare for your next interview. AI-powered feedback, real-time analysis, and personalized coaching to help you land your dream job.
            </p>
            <div className="flex gap-4 md:gap-6">
              <SocialLink href="#" icon={<Twitter className="h-4 w-4 md:h-5 md:w-5" />} />
              <SocialLink href="#" icon={<Linkedin className="h-4 w-4 md:h-5 md:w-5" />} />
              <SocialLink href="#" icon={<Instagram className="h-4 w-4 md:h-5 md:w-5" />} />
              <SocialLink href="#" icon={<Github className="h-4 w-4 md:h-5 md:w-5" />} />
            </div>
          </div>
          
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-bold text-white mb-3 md:mb-6 text-sm md:text-base">Product</h4>
            <ul className="space-y-2 md:space-y-4 text-xs md:text-sm">
              <li><FooterLink to="/features">Features</FooterLink></li>
              <li><FooterLink to="/pricing">Pricing</FooterLink></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-3 md:mb-6 text-sm md:text-base">Company</h4>
            <ul className="space-y-2 md:space-y-4 text-xs md:text-sm">
              <li><FooterLink to="/about">About Us</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-3 md:mb-6 text-sm md:text-base">Legal</h4>
            <ul className="space-y-2 md:space-y-4 text-xs md:text-sm">
              <li><FooterLink to="/privacy">Privacy</FooterLink></li>
              <li><FooterLink to="/terms">Terms</FooterLink></li>
              <li><FooterLink to="/security">Security</FooterLink></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-500">
          <p>© {new Date().getFullYear()} PrepHire Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-950 transition-all duration-300"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-slate-400 hover:text-white transition-colors duration-200"
  >
    {children}
  </Link>
);

export default Footer;
