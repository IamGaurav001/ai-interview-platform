import { useState } from "react";
import { X, CheckCircle2, AlertCircle, CreditCard, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth } from "../config/firebase";
import { logEvent } from "../config/amplitude";

const PricingModal = ({ isOpen, onClose, onSuccess, userEmail, userName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("1_interview");

  const plans = {
    "1_interview": { price: 19, currency: "₹", label: "1 Interview Credit" },
    "3_interviews": { price: 49, currency: "₹", label: "3 Interview Credits" },
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
        theme: { color: "#4F46E5" },
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1d2f62] to-[#2a407a] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-bold tracking-tight">Unlock Potential</h3>
                <p className="text-blue-100 text-sm mt-2 font-medium">Get detailed AI-powered interview feedback</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Plans */}
            <div className="space-y-5 mb-8">
              {/* Option 1: 1 Interview */}
              <div
                onClick={() => setSelectedPlan("1_interview")}
                className={`group relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                  selectedPlan === "1_interview"
                    ? "border-[#1d2f62] bg-blue-50/50 shadow-md shadow-blue-100"
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlan === "1_interview" ? "border-[#1d2f62]" : "border-slate-300"
                    }`}>
                      {selectedPlan === "1_interview" && <div className="h-3 w-3 rounded-full bg-[#1d2f62]" />}
                    </div>
                    <span className="font-bold text-slate-700 text-lg">1 Interview Credit</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    ₹19
                  </span>
                </div>
              </div>

              {/* Option 2: 3 Interviews */}
              <div
                onClick={() => setSelectedPlan("3_interviews")}
                className={`group relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                  selectedPlan === "3_interviews"
                    ? "border-[#1d2f62] bg-blue-50/50 shadow-lg shadow-blue-100 scale-[1.02]"
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-white" /> Most Popular
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlan === "3_interviews" ? "border-[#1d2f62]" : "border-slate-300"
                    }`}>
                      {selectedPlan === "3_interviews" && <div className="h-3 w-3 rounded-full bg-[#1d2f62]" />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-lg">3 Interview Credits</span>
                      <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                        Save 14%
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    ₹49
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 px-6 bg-[#1d2f62] hover:bg-[#1d2f62]/90 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-[#1d2f62]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay {currentPlan.currency}{currentPlan.price}
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricingModal;

