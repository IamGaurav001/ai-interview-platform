import React, { useState } from "react";
import PageLayout from "../components/PageLayout";
import { Mail, MessageSquare, MapPin, Send, ArrowRight, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      desc: "Our friendly team is here to help.",
      contact: "support@prephire.ai",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      desc: "Speak to our team live.",
      contact: "Start a chat",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      icon: MapPin,
      title: "Office",
      desc: "Come say hello at our office HQ.",
      contact: "123 Innovation Dr, SF",
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      icon: Phone,
      title: "Phone",
      desc: "Mon-Fri from 8am to 5pm.",
      contact: "+1 (555) 000-0000",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-slate-50 z-0" />
        
        <div className="relative z-10 py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3"
            >
              Contact Us
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-6"
            >
              We'd love to hear from you
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600"
            >
              Have a question about our pricing, features, or need a custom plan? We're here to help you succeed.
            </motion.p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${method.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <method.icon className={`h-6 w-6 ${method.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{method.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{method.desc}</p>
                <p className={`font-semibold ${method.color}`}>{method.contact}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Left Side: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Get in touch
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Our team is dedicated to providing the best possible support. Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" /> Support Hours
                </h4>
                <p className="text-blue-700 mb-4">
                  Monday - Friday: 8am - 6pm EST<br/>
                  Weekend: 10am - 4pm EST
                </p>
                <p className="text-sm text-blue-600/80">
                  Typical response time: &lt; 2 hours
                </p>
              </div>
            </motion.div>

            {/* Right Side: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 mb-8">
                    Thanks for reaching out. We'll get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-2 mx-auto"
                  >
                    Send another message <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
