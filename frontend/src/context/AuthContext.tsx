import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { auth, googleProvider, isFirebaseConfigured } from '../utils/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

export type AccountProvider = "mongo-email" | "firebase-google";
export type AuthReason =
  | "profile"
  | "watchlist"
  | "purchase"
  | "portfolio"
  | "alerts"
  | "report"
  | "notes"
  | "saved_preferences"
  | "ai_personalization";

export interface AppUser {
  id: string;
  provider: AccountProvider;
  name: string;
  email: string;
  photoURL?: string;
  isAuthenticated: boolean;
  createdAt?: string;
}

interface SameEmailPromptData {
  email: string;
  firebaseToken: string;
  firebaseUid: string;
  firebaseUser: any;
}

interface AuthContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSignInModalOpen: boolean;
  signInReason: AuthReason | null;
  toastMessage: string | null;
  sameEmailPrompt: SameEmailPromptData | null;
  openSignInModal: (reason?: AuthReason) => void;
  closeSignInModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  keepAccountsSeparate: () => Promise<void>;
  cancelSameEmailLink: () => void;
  requireAuth: (action: () => void, reason?: AuthReason) => void;
  clearToast: () => void;
  signOutUser: () => Promise<void>;
  setToastMessage: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = 'http://localhost:8000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInReason, setSignInReason] = useState<AuthReason | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sameEmailPrompt, setSameEmailPrompt] = useState<SameEmailPromptData | null>(null);

  const pendingActionRef = useRef<(() => void) | null>(null);

  // Check custom Mongo authentication session on page load
  const checkMongoSession = async (): Promise<boolean> => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
      if (res.data && res.data.user) {
        setUser({
          ...res.data.user,
          isAuthenticated: true
        });
        return true;
      }
    } catch (err) {
      // No active Mongo session
    }
    return false;
  };

  // Sync Firebase / Google credentials on mount
  useEffect(() => {
    let firebaseUnsubscribe = () => {};

    const initializeAuth = async () => {
      // 1. First check if we have a valid MongoDB session (Email session is canonical)
      const hasMongoSession = await checkMongoSession();
      if (hasMongoSession) {
        setIsLoading(false);
        return;
      }

      if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
      }

      // 2. Subscribe to Firebase auth changes if no session exists
      firebaseUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const email = firebaseUser.email;
            if (email) {
              // Check if email already linked or registered in Mongo
              const checkRes = await axios.get(`${API_BASE}/api/auth/check-email`, { params: { email } });
              
              if (checkRes.data.exists && checkRes.data.linked) {
                // Already linked, try to log in via MongoDB automatically
                const token = await firebaseUser.getIdToken();
                const linkRes = await axios.post(`${API_BASE}/api/auth/link-google`, {}, {
                  headers: { 'Authorization': `Bearer ${token}` },
                  withCredentials: true
                });
                
                if (linkRes.data && linkRes.data.user) {
                  setUser({
                    ...linkRes.data.user,
                    isAuthenticated: true
                  });
                  triggerPendingAction();
                  setIsLoading(false);
                  return;
                }
              }
            }

            // Normal Google Authentication
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Google User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || undefined,
              provider: "firebase-google",
              isAuthenticated: true
            });
            triggerPendingAction();
          } catch (err) {
            console.error("Failed to sync Google user state:", err);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
    };

    initializeAuth();

    return () => firebaseUnsubscribe();
  }, []);

  const triggerPendingAction = () => {
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
      setToastMessage("Welcome to NiftyAI. Your account is securely synced.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const openSignInModal = (reason: AuthReason = "watchlist") => {
    setSignInReason(reason);
    setIsSignInModalOpen(true);
  };

  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
    setSignInReason(null);
    pendingActionRef.current = null;
    setSameEmailPrompt(null);
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      alert("Firebase Google Auth is not configured. Please define the required environment variables.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const email = firebaseUser.email;
      const token = await firebaseUser.getIdToken();

      if (email) {
        // Check same email existence in MongoDB
        const checkRes = await axios.get(`${API_BASE}/api/auth/check-email`, { params: { email } });
        
        if (checkRes.data.exists) {
          if (checkRes.data.linked) {
            // Already linked - auto verify and log in
            const linkRes = await axios.post(`${API_BASE}/api/auth/link-google`, {}, {
              headers: { 'Authorization': `Bearer ${token}` },
              withCredentials: true
            });
            
            setUser({
              ...linkRes.data.user,
              isAuthenticated: true
            });
            setIsSignInModalOpen(false);
            triggerPendingAction();
          } else {
            // Unlinked existing account - show linkage popup dialog options
            setSameEmailPrompt({
              email,
              firebaseToken: token,
              firebaseUid: firebaseUser.uid,
              firebaseUser
            });
          }
          setIsLoading(false);
          return;
        }
      }

      // Fresh Google Authentication
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        provider: "firebase-google",
        isAuthenticated: true
      });
      
      setIsSignInModalOpen(false);
      triggerPendingAction();

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      alert(`Failed to sign in with Google: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const linkGoogleAccount = async () => {
    if (!sameEmailPrompt) return;
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/link-google`, {}, {
        headers: { 'Authorization': `Bearer ${sameEmailPrompt.firebaseToken}` },
        withCredentials: true
      });

      setUser({
        ...res.data.user,
        isAuthenticated: true
      });

      setSameEmailPrompt(null);
      setIsSignInModalOpen(false);
      triggerPendingAction();
    } catch (err: any) {
      alert(`Failed to link accounts: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const keepAccountsSeparate = async () => {
    if (!sameEmailPrompt) return;
    // Log in as standard Firebase user, keeping firestore active
    setUser({
      id: sameEmailPrompt.firebaseUid,
      name: sameEmailPrompt.firebaseUser.displayName || 'Google User',
      email: sameEmailPrompt.email,
      photoURL: sameEmailPrompt.firebaseUser.photoURL || undefined,
      provider: "firebase-google",
      isAuthenticated: true
    });
    setSameEmailPrompt(null);
    setIsSignInModalOpen(false);
    triggerPendingAction();
  };

  const cancelSameEmailLink = () => {
    setSameEmailPrompt(null);
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password }, {
        withCredentials: true
      });
      
      setUser({
        ...res.data.user,
        isAuthenticated: true
      });

      setIsSignInModalOpen(false);
      triggerPendingAction();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password }, {
        withCredentials: true
      });

      setUser({
        ...res.data.user,
        isAuthenticated: true
      });

      setIsSignInModalOpen(false);
      triggerPendingAction();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to create account. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  const requireAuth = (action: () => void, reason: AuthReason = "watchlist") => {
    if (!user?.isAuthenticated) {
      pendingActionRef.current = action;
      openSignInModal(reason);
      return;
    }
    action();
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  const signOutUser = async () => {
    setIsLoading(true);
    try {
      // 1. Sign out of MongoDB session cookie
      if (user?.provider === 'mongo-email') {
        await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
      }

      // 2. Sign out of Firebase Google Auth
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      setIsLoading(false);
      setToastMessage("You have been signed out securely.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const isAuthenticated = user !== null && user.isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isSignInModalOpen,
        signInReason,
        toastMessage,
        sameEmailPrompt,
        openSignInModal,
        closeSignInModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        linkGoogleAccount,
        keepAccountsSeparate,
        cancelSameEmailLink,
        requireAuth,
        clearToast,
        signOutUser,
        setToastMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default useAuth;
