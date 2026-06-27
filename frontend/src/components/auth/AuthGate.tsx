import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGate({ children, fallback }: AuthGateProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
