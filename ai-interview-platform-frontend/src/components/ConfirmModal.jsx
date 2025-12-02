import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, info, success
  stats = null, // Optional stats to display
}) => {
  const icons = {
    warning: <AlertTriangle className="h-12 w-12 text-blue-500" />,
    info: <Info className="h-12 w-12 text-blue-500" />,
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
  };

  const colors = {
    warning: "bg-blue-600 hover:bg-blue-700",
    info: "bg-blue-600 hover:bg-blue-700",
    success: "bg-green-600 hover:bg-green-700",
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">{icons[type]}</div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-slate-700 leading-relaxed mb-4">{message}</p>

                {/* Optional Stats */}
                {stats && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 mb-4">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">{key}:</span>
                        <span className="text-sm font-bold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ${colors[type]}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
