import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Wraps authenticated routes — redirects to /login if no auth token exists.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
