import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CreditGuard from "./components/CreditGuard";
import ScrollToTop from "./components/ScrollToTop";
import { ToastProvider } from './context/ToastContext';
import { logEvent } from "./config/amplitude";
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from "lucide-react";
import SkipLink from "./components/SkipLink";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SequentialInterview = lazy(() => import("./pages/SequentialInterview"));
const InterviewFlow = lazy(() => import("./pages/InterviewFlow"));
const History = lazy(() => import("./pages/History"));
const ResumeUpload = lazy(() => import("./pages/ResumeUpload"));
const Settings = lazy(() => import("./pages/Settings"));
const Landing = lazy(() => import("./pages/Landing"));
const WatchDemo = lazy(() => import("./pages/WatchDemo"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Refund = lazy(() => import("./pages/Refund"));
const Shipping = lazy(() => import("./pages/Shipping"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register", "/interview-flow", "/sequential-interview", "/forgot-password", "/verify-email"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  const PAGE_NAMES = {
    '/': 'Landing Page',
    '/login': 'Login',
    '/register': 'Register',
    '/dashboard': 'Dashboard',
    '/sequential-interview': 'Sequential Interview',
    '/interview-flow': 'Interview Flow',
    '/history': 'History',
    '/upload-resume': 'Resume Upload',
    '/settings': 'Settings',
    '/forgot-password': 'Forgot Password',
    '/demo': 'Watch Demo',
    '/about': 'About Us',
    '/contact': 'Contact Us',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service',
    '/features': 'Features',
    '/pricing': 'Pricing',
    '/refund': 'Refund Policy',
    '/shipping': 'Shipping Policy',
    '/verify-email': 'Verify Email'
  };

  return (
    <>
      <SkipLink />
      {showNavbar && <Navbar />}
      <main id="main-content" className={`min-h-screen w-full overflow-x-hidden bg-slate-50 ${showNavbar ? "pt-24" : ""}`}>
        {children}
      </main>
    </>
  );
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
  </div>
);

import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
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
                        <CreditGuard>
                          <InterviewFlow />
                        </CreditGuard>
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
                        <CreditGuard>
                          <ResumeUpload />
                        </CreditGuard>
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
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
