import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated || !user) {
    // Since we don't have a login page (SSO assumed), we redirect to Unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if the user has ANY of the allowed roles
  const hasAccess = user.roles.some(role => allowedRoles.includes(role));

  if (!hasAccess) {
    // Redirect to unauthorized page if role doesn't match
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;