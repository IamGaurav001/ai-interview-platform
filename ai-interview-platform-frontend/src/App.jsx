import { useEffect } from "react";
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
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import VerifyEmail from "./pages/VerifyEmail";
import Refund from "./pages/Refund";
import Shipping from "./pages/Shipping";
import { logEvent } from "./config/amplitude";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register", "/interview-flow", "/sequential-interview", "/forgot-password", "/verify-email"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    logEvent('Page View', { path: location.pathname });
  }, [location]);

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
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/shipping" element={<Shipping />} />

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
            <Route
              path="/verify-email"
              element={
                <ProtectedRoute requireVerification={false}>
                  <VerifyEmail />
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
