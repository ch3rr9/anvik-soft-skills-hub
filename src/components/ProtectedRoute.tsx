
import React from "react";
import { Navigate } from "react-router-dom";
import { UserRole } from "../types/auth-types";
import { useSimpleAuth } from "../contexts/SimpleAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = ["employee", "manager", "director", "hr"] 
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useSimpleAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasPermission(roles)) {
    return <Navigate to="/forbidden" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
