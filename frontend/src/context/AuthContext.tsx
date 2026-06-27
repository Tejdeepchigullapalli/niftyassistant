import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../utils/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

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

export interface AuthUser {
  id: string;
  name?: string;
  displayName?: string | null;
  email?: string;
  image?: string;
  photoURL?: string | null;
  isDemo?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSignInModalOpen: boolean;
  signInReason: AuthReason | null;
  toastMessage: string | null;
  openSignInModal: (reason?: AuthReason) => void;
  closeSignInModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  continueDemoMode: () => void;
  requireAuth: (action: () => void, reason?: AuthReason) => void;
  clearToast: () => void;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInReason, setSignInReason] = useState<AuthReason | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingActionRef = useRef<(() => void) | null>(null);

  // Synchronise Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // If Firebase is not configured, start as null (Not Signed In)
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || undefined,
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          image: firebaseUser.photoURL || undefined,
          photoURL: firebaseUser.photoURL || null,
          isDemo: false
        });
        
        // Execute pending action if it exists after state sync
        if (pendingActionRef.current) {
          pendingActionRef.current();
          pendingActionRef.current = null;
          setToastMessage("Welcome to NiftyAI. Your account is now synced.");
          setTimeout(() => setToastMessage(null), 4000);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openSignInModal = (reason: AuthReason = "saved_preferences") => {
    setSignInReason(reason);
    setIsSignInModalOpen(true);
  };

  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
    setSignInReason(null);
    pendingActionRef.current = null;
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      alert("Firebase is not configured in this build. To use Google Sign-In, please define the required NEXT_PUBLIC_FIREBASE_* environment variables in your deployment dashboard and re-trigger a production build. Logging in as Demo User for this session.");
      continueDemoMode();
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser({
          id: result.user.uid,
          name: result.user.displayName || undefined,
          displayName: result.user.displayName || undefined,
          email: result.user.email || undefined,
          image: result.user.photoURL || undefined,
          photoURL: result.user.photoURL || null,
          isDemo: false
        });

        if (pendingActionRef.current) {
          pendingActionRef.current();
          pendingActionRef.current = null;
        }
        setIsSignInModalOpen(false);
        setToastMessage("Welcome to NiftyAI. Your account is now synced.");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      alert(`Failed to sign in with Google: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string) => {
    setIsLoading(true);
    // Simulate email login
    setTimeout(() => {
      setUser({
        id: `email_${Date.now()}`,
        name: email.split('@')[0],
        displayName: email.split('@')[0],
        email: email,
        photoURL: null,
        isDemo: false
      });
      if (pendingActionRef.current) {
        pendingActionRef.current();
        pendingActionRef.current = null;
      }
      setIsSignInModalOpen(false);
      setToastMessage("Welcome to NiftyAI. Your account is now synced.");
      setTimeout(() => setToastMessage(null), 4000);
      setIsLoading(false);
    }, 500);
  };

  const continueDemoMode = () => {
    setUser({
      id: "demo_user",
      name: "Akash Verma",
      displayName: "Akash Verma",
      email: "akash.verma@email.com",
      photoURL: null,
      isDemo: true
    });
    setIsSignInModalOpen(false);
    pendingActionRef.current = null;
  };

  const requireAuth = (action: () => void, reason: AuthReason = "saved_preferences") => {
    const isAuthenticated = user !== null && !user.isDemo;
    if (!isAuthenticated) {
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
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Firebase Sign-Out Error:", error);
      }
    }
    setUser(null);
  };

  const isAuthenticated = user !== null && !user.isDemo;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isSignInModalOpen,
        signInReason,
        toastMessage,
        openSignInModal,
        closeSignInModal,
        signInWithGoogle,
        signInWithEmail,
        continueDemoMode,
        requireAuth,
        clearToast,
        signOutUser
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
