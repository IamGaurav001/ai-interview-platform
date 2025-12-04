import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/userAPI';
import PricingModal from './PricingModal';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const CreditGuard = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasCredits, setHasCredits] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCredits = async () => {
      try {
        const res = await getUserProfile();
        const usage = res.data.user?.usage;
        
        if (usage) {
          const totalCredits = (usage.freeInterviewsLeft || 0) + (usage.purchasedCredits || 0);
          if (totalCredits > 0) {
            setHasCredits(true);
          } else {
            setHasCredits(false);
            setShowPricingModal(true);
          }
        } else {

          setHasCredits(false);
          setShowPricingModal(true);
        }
      } catch (error) {
        console.error("Error checking credits in CreditGuard:", error);
        setHasCredits(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkCredits();
    } else {
      setLoading(false); 
    }
  }, [user]);

  const handleModalClose = () => {
    setShowPricingModal(false);
    navigate('/dashboard'); 
  };

  const handlePaymentSuccess = () => {
    setShowPricingModal(false);
    setHasCredits(true);
    // Optionally refresh user profile in context if needed
    window.location.reload(); // Simple way to refresh everything
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d2f62]" />
      </div>
    );
  }

  if (!hasCredits) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12 max-w-md w-full text-center relative z-10"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 animate-pulse"></div>
                <Lock className="h-10 w-10 text-[#1d2f62]" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Out of Credits
            </h2>
            
            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
              You've used all your available interview credits. Unlock more to continue your preparation journey.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => setShowPricingModal(true)}
                className="w-full py-3.5 px-6 bg-[#1d2f62] text-white rounded-xl font-bold hover:bg-[#1d2f62]/90 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Get More Credits</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
        
        <PricingModal 
          isOpen={showPricingModal} 
          onClose={handleModalClose}
          onSuccess={handlePaymentSuccess}
          userEmail={user?.email}
          userName={user?.displayName || "User"}
        />
      </>
    );
  }

  return children;
};

export default CreditGuard;
