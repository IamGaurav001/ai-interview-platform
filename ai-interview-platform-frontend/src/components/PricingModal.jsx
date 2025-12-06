import { useState, useEffect } from "react";
import { X, Check, Zap, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth } from "../config/firebase";
import { logEvent } from "../config/amplitude";

const PricingModal = ({ isOpen, onClose, onSuccess, userEmail, userName }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hide-navbar-on-modal');
    } else {
      document.body.classList.remove('hide-navbar-on-modal');
    }
    return () => {
      document.body.classList.remove('hide-navbar-on-modal');
    };
  }, [isOpen]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("3_interviews"); // Default to popular

  const plans = {
    "1_interview": { 
      id: "1_interview",
      price: 19, 
      currency: "₹", 
      label: "1 Interview Credit",
      save: null
    },
    "3_interviews": { 
      id: "3_interviews",
      price: 49, 
      currency: "₹", 
      label: "3 Interview Credits",
      save: "Save 14%"
    },
  };

  const currentPlan = plans[selectedPlan];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
        return;
      };
      script.onerror = () => {
        resolve(false);
        return;
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      logEvent('Initiate Razorpay Checkout', { plan: selectedPlan });

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load payment SDK. Please check your internet connection.");
      }

      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const token = await user.getIdToken();
      const orderRes = await axios.post(
        "/api/monetization/create-order",
        { planId: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PrepHire",
        description: selectedPlan === "3_interviews" ? "3 Interview Credits" : "1 Interview Credit",
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post(
              "/api/monetization/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            logEvent('Payment Success', { plan: selectedPlan, method: 'Razorpay' });
            onSuccess();
            onClose();
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            setError(verifyErr.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: "#1d2f62" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        setError(response.error.description || "Payment failed");
      });
      rzp1.open();
    } catch (err) {
      console.error("Razorpay initiation failed:", err);
      setError(err.message || "Failed to start payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Decorative Header */}
          <div className="bg-[#1d2f62] p-8 pb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md border border-white/10 shadow-inner">
                <Sparkles className="h-6 w-6 text-blue-200" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Unlock Potential</h3>
              <p className="text-blue-100/80 font-medium">Get detailed AI-powered interview feedback</p>
            </div>
          </div>

          <div className="px-6 pb-8 -mt-6 relative z-20">
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-2 space-y-3">
              {Object.values(plans).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                    selectedPlan === plan.id
                      ? "border-[#1d2f62] bg-blue-50/30"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  {plan.id === "3_interviews" && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-white" /> POPULAR
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPlan === plan.id 
                          ? "border-[#1d2f62] bg-[#1d2f62]" 
                          : "border-slate-300 group-hover:border-slate-400"
                      }`}>
                        {selectedPlan === plan.id && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{plan.label}</div>
                        {plan.save && (
                          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit mt-1">
                            {plan.save}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{plan.currency}{plan.price}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 py-4 bg-[#1d2f62] text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Pay Securely</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                    {currentPlan.currency}{currentPlan.price}
                  </span>
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured by Razorpay
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricingModal;

