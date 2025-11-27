import { useState } from "react";
import { X, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth } from "../config/firebase";

const PricingModal = ({ isOpen, onClose, onSuccess, userEmail, userName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("1_interview");

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
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError("Failed to load payment SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create Order on Backend
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
      
      const token = await user.getIdToken();
      const orderRes = await axios.post(
        "/api/monetization/create-order",
        { planId: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PrepHire",
        description: selectedPlan === "3_interviews" ? "3 Interview Credits" : "1 Interview Credit",
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment on Backend
            await axios.post(
              "/api/monetization/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            onSuccess();
            onClose();
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            setError(verifyErr.response?.data?.message || "Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        setError(response.error.description || "Payment failed");
      });
      rzp1.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError(err.response?.data?.message || err.message || "Failed to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Unlock More Interviews</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex gap-4">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900">Limit Reached</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  You've used your free interviews for this month.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: 1 Interview */}
              <div 
                onClick={() => setSelectedPlan("1_interview")}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan === "1_interview" 
                    ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30" 
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900">1 Interview Credit</span>
                  <span className="text-lg font-bold text-indigo-600">₹19</span>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Full AI Evaluation & Feedback
                  </li>
                </ul>
              </div>

              {/* Option 2: 3 Interviews */}
              <div 
                onClick={() => setSelectedPlan("3_interviews")}
                className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan === "3_interviews" 
                    ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30" 
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  Best Value
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900">3 Interview Credits</span>
                  <span className="text-lg font-bold text-indigo-600">₹49</span>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Save ₹8 (14% off)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Full AI Evaluation & Feedback
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  {selectedPlan === "1_interview" ? "Buy Now - ₹19" : "Buy Now - ₹49"}
                </>
              )}
            </button>
            
            <p className="text-xs text-center text-slate-400">
              Secured by Razorpay. 100% Safe & Secure.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricingModal;

