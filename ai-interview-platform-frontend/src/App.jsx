import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SequentialInterview from "./pages/SequentialInterview";
import InterviewFlow from "./pages/InterviewFlow";
import History from "./pages/History";
import ResumeUpload from "./pages/ResumeUpload";
import Landing from "./pages/Landing.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen w-full overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
