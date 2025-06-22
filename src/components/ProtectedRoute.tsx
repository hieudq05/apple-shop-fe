import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
  guestOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  adminOnly = false,
  guestOnly = false,
}) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Guest-only routes (login, register) - redirect if already authenticated
  if (guestOnly && isAuthenticated) {
    // Redirect admin users to admin dashboard, regular users to home
    const redirectTo = isAdmin ? '/admin/dashboard' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  // Protected routes - require authentication
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin-only routes
  if (adminOnly && (!isAuthenticated || !isAdmin)) {
    // If not authenticated, redirect to admin login
    if (!isAuthenticated) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // If authenticated but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
