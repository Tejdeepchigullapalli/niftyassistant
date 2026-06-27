import { useAuth } from '../context/AuthContext';

export const useRequireAuth = () => {
  const { requireAuth, isAuthenticated, user, openSignInModal } = useAuth();
  return { requireAuth, isAuthenticated, user, openSignInModal };
};
