import React from 'react';
const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-3xl opacity-70 mix-blend-multiply animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] -z-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
