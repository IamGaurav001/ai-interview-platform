import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SequentialInterview from "./pages/SequentialInterview";
import InterviewFlow from "./pages/InterviewFlow";
import History from "./pages/History";
import ResumeUpload from "./pages/ResumeUpload";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing.jsx";
import WatchDemo from "./pages/WatchDemo";
import ForgotPassword from "./pages/ForgotPassword";
import ScrollToTop from "./components/ScrollToTop";
import { ToastProvider } from './context/ToastContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register", "/interview-flow", "/sequential-interview", "/forgot-password"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={`min-h-screen w-full overflow-x-hidden bg-slate-50 ${showNavbar ? "pt-24" : ""}`}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/demo" element={<WatchDemo />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sequential-interview"
              element={
                <ProtectedRoute>
                  <SequentialInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-flow"
              element={
                <ProtectedRoute>
                  <InterviewFlow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-resume"
              element={
                <ProtectedRoute>
                  <ResumeUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
