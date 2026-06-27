import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth, AuthReason } from '../../context/AuthContext';
import AuthBenefitsList from './AuthBenefitsList';

export default function SignInRequiredModal() {
  const { 
    isSignInModalOpen, 
    signInReason, 
    closeSignInModal, 
    signInWithGoogle, 
    signInWithEmail, 
    continueDemoMode 
  } = useAuth();

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape, Trap Focus
  useEffect(() => {
    if (!isSignInModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSignInModal();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus close button initially
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSignInModalOpen]);

  // Focus email input when toggled
  useEffect(() => {
    if (showEmailInput) {
      emailInputRef.current?.focus();
    }
  }, [showEmailInput]);

  if (!isSignInModalOpen) return null;

  // Dynamic titles and subtitles based on reason
  let title = "Sign in required";
  let subtitle = "Sign in to securely sync your watchlist, portfolio, alerts, preferences, and AI investment insights across devices.";

  if (signInReason === "profile") {
    title = "Sign in to NiftyAI";
    subtitle = "Sign in to securely sync your watchlist, portfolio, alerts, preferences, and AI investment insights across devices.";
  } else if (signInReason === "portfolio") {
    subtitle = "Sign in to access your saved portfolio, holdings, returns, and personalized AI insights.";
  } else if (signInReason === "watchlist") {
    subtitle = "Sign in to save this company to your watchlist and track it across devices.";
  } else if (signInReason === "purchase") {
    subtitle = "Sign in to record your holdings, buy price, and portfolio performance.";
  } else if (signInReason === "alerts") {
    subtitle = "Sign in to create price alerts and receive stock-specific updates.";
  } else if (signInReason === "report") {
    subtitle = "Sign in to generate and save personalized investment reports.";
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    try {
      setIsSubmittingEmail(true);
      await signInWithEmail(email);
      setEmail('');
      setShowEmailInput(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSignInModal}
          className="absolute inset-0 bg-slate-950/78 backdrop-blur-[14px]"
        />

        {/* Modal Container */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-[520px] bg-[#121A2D] border border-violet-500/35 rounded-[24px] shadow-[0_0_50px_rgba(139,92,246,0.25)] px-6 py-6 md:px-8 md:py-8 flex flex-col gap-4 text-center overflow-hidden text-slate-100"
        >
          {/* Top light beam glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent shadow-[0_0_20px_#8B5CF6]" />

          {/* Close button */}
          <motion.button 
            ref={closeButtonRef}
            onClick={closeSignInModal}
            aria-label="Close dialog"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>

          {/* Icon Container with sparkles */}
          <div className="flex justify-center mt-2 select-none relative">
            <div className="relative">
              {/* Sparkle 1 */}
              <motion.div 
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1.5 -left-1.5 text-violet-400 text-xs"
              >
                ✦
              </motion.div>
              {/* Sparkle 2 */}
              <motion.div 
                animate={{ scale: [1.2, 0.8, 1.2], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1.5 -right-1.5 text-violet-300 text-[10px]"
              >
                ✦
              </motion.div>
              <div className="relative grid place-items-center w-14 h-14 rounded-2xl bg-[#162039] border border-violet-500/35 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                <LockKeyhole className="w-6 h-6 text-violet-400" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1.5 select-none">
            <h2 id="modal-title" className="text-base font-black text-slate-100 tracking-tight uppercase">{title}</h2>
            <p className="text-[10.5px] text-[#94A3B8] font-medium leading-relaxed max-w-[420px] mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Benefits Single Card list */}
          <AuthBenefitsList />

          {/* Buttons and Actions */}
          <div className="space-y-3 mt-1.5">
            {showEmailInput ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
                <input 
                  ref={emailInputRef}
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#162039] border border-violet-500/35 focus:border-violet-500 text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-[11px] outline-none transition-colors font-medium text-center"
                  required
                />
                <div className="flex gap-2">
                  <motion.button 
                    type="submit"
                    disabled={isSubmittingEmail}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-extrabold py-2.5 px-4 rounded-xl cursor-pointer transition shadow-[0_0_15px_rgba(139,92,246,0.25)] select-none disabled:opacity-50"
                  >
                    {isSubmittingEmail ? "Signing in..." : "Continue"}
                  </motion.button>
                  <motion.button 
                    type="button"
                    onClick={() => setShowEmailInput(false)}
                    whileHover={{ scale: 1.02, backgroundColor: "#1e293b" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-900 border border-violet-500/20 text-slate-350 text-[11px] font-extrabold py-2.5 px-4 rounded-xl cursor-pointer transition select-none"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-2.5">
                <motion.button 
                  onClick={() => setShowEmailInput(true)}
                  whileHover={{ scale: 1.015, boxShadow: "0 0 15px rgba(139,92,246,0.3)" }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full h-[40px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11.5px] font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition select-none border-0"
                >
                  <Mail className="w-4 h-4" />
                  <span>Sign in with Email</span>
                </motion.button>

                <motion.button 
                  onClick={signInWithGoogle}
                  whileHover={{ scale: 1.015, backgroundColor: "#1c2642" }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full h-[40px] bg-[#162039] border border-[#293550] text-slate-100 text-[11.5px] font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition select-none"
                >
                  {/* Google Logo SVG */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Footer message with green shield icon */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5 border-t border-slate-900/60 pt-3 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[8px] text-[#94A3B8] font-bold leading-none uppercase tracking-wide">
              Your watchlist, portfolio, and alerts will sync securely after sign-in.
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
