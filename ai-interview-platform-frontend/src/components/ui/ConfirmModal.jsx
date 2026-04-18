import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, X, AlertOctagon } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, info, success, danger
  isDestructive = false,
  stats = null,
}) => {
  // Determine styles based on type and isDestructive
  const getStyles = () => {
    if (isDestructive || type === "danger") {
      return {
        icon: <AlertOctagon className="h-10 w-10 text-red-600" />,
        bg: "bg-red-50",
        border: "border-red-100",
        button: "bg-red-600 hover:bg-red-700 shadow-red-500/30",
        iconBg: "bg-red-100",
      };
    }
    switch (type) {
      case "warning":
        return {
          icon: <AlertTriangle className="h-10 w-10 text-amber-600" />,
          bg: "bg-amber-50",
          border: "border-amber-100",
          button: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/30",
          iconBg: "bg-amber-100",
        };
      case "success":
        return {
          icon: <CheckCircle className="h-10 w-10 text-green-600" />,
          bg: "bg-green-50",
          border: "border-green-100",
          button: "bg-green-600 hover:bg-green-700 shadow-green-500/30",
          iconBg: "bg-green-100",
        };
      case "info":
      default:
        return {
          icon: <Info className="h-10 w-10 text-blue-600" />,
          bg: "bg-blue-50",
          border: "border-blue-100",
          button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
          iconBg: "bg-blue-100",
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8 flex flex-col items-center text-center">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-full ${styles.iconBg} flex items-center justify-center mb-6 shadow-inner`}>
                  <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                    {styles.icon}
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  {message}
                </p>

                {/* Optional Stats */}
                {stats && (
                  <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-3 mb-6 border border-slate-100">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">{key}</span>
                        <span className="text-sm font-bold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="flex-1 px-5 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 px-5 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${styles.button}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
