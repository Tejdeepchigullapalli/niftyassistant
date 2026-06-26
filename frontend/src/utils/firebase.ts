import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'PLACEHOLDER',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'PLACEHOLDER',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'PLACEHOLDER',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'PLACEHOLDER',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'PLACEHOLDER',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'PLACEHOLDER'
};

// Check if Firebase configuration keys are fully loaded
export const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('PLACEHOLDER')
);

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Request profile and email scopes, forcing Google to show account selector
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
