import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireVerification && !user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default ProtectedRoute;
