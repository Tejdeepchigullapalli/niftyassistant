import React from 'react';
import { useAuth, AuthReason } from '../../context/AuthContext';

interface ProtectedActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  reason?: AuthReason;
  children: React.ReactNode;
}

export default function ProtectedActionButton({
  onClick,
  reason = 'saved_preferences',
  children,
  ...props
}: ProtectedActionButtonProps) {
  const { requireAuth } = useAuth();

  const handleIntercept = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    requireAuth(onClick, reason);
  };

  return (
    <button onClick={handleIntercept} {...props}>
      {children}
    </button>
  );
}
