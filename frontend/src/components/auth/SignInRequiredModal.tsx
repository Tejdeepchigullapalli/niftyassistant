import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LockKeyhole, Mail, ShieldCheck, ChevronRight, User, KeyRound } from 'lucide-react';
import { useAuth, AuthReason } from '../../context/AuthContext';
import AuthBenefitsList from './AuthBenefitsList';

export default function SignInRequiredModal() {
  const { 
    isSignInModalOpen, 
    signInReason, 
    closeSignInModal, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail,
    sameEmailPrompt,
    linkGoogleAccount,
    keepAccountsSeparate,
    cancelSameEmailLink
  } = useAuth();

  const [formMode, setFormMode] = useState<'options' | 'login' | 'register'>('options');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Reset forms when modal state changes
  useEffect(() => {
    if (!isSignInModalOpen) {
      setFormMode('options');
      setName('');
      setEmail('');
      setPassword('');
      setErrorMsg(null);
    }
  }, [isSignInModalOpen]);

  // Focus trap and escape key handler
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
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSignInModalOpen]);

  // Focus inputs automatically
  useEffect(() => {
    if (formMode === 'register') {
      nameInputRef.current?.focus();
    } else if (formMode === 'login') {
      emailInputRef.current?.focus();
    }
  }, [formMode]);

  if (!isSignInModalOpen) return null;

  // Dynamic titles and subtitles based on reason
  let title = "Sign in required";
  let subtitle = "Sign in to securely save your watchlist, portfolio, alerts, reports, and preferences.";

  if (signInReason === "profile") {
    title = "Sign in to NiftyAI";
  } else if (signInReason === "portfolio") {
    subtitle = "Sign in to access your saved portfolio, allocation, performance, and AI insights.";
  } else if (signInReason === "watchlist") {
    subtitle = "Sign in to save this company to your watchlist and track it across devices.";
  } else if (signInReason === "purchase") {
    subtitle = "Sign in to record holdings, buy prices, portfolio returns, and investment history.";
  } else if (signInReason === "alerts") {
    subtitle = "Sign in to create price alerts and receive company-specific updates.";
  } else if (signInReason === "report") {
    subtitle = "Sign in to generate, save, and download personalized investment reports.";
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (formMode === 'login') {
        await signInWithEmail(email, password);
      } else if (formMode === 'register') {
        if (!name || name.trim().length < 2) {
          throw new Error("Name must be at least 2 characters");
        }
        await signUpWithEmail(name, email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Try again.");
    } finally {
      setIsSubmitting(false);
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

          {/* Same-Email Account Protection Dialog View */}
          {sameEmailPrompt ? (
            <div className="flex flex-col gap-4 text-left select-none">
              <div className="flex justify-center select-none">
                <div className="relative grid place-items-center w-14 h-14 rounded-2xl bg-[#162039] border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <KeyRound className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-sm font-black text-amber-400 tracking-tight uppercase">Account Exists</h3>
                <p className="text-[10px] text-slate-400 leading-normal max-w-[400px] mx-auto">
                  An account already exists with the email <strong>{sameEmailPrompt.email}</strong>.
                </p>
              </div>

              <div className="bg-[#162039] border border-violet-500/25 rounded-2xl p-4 space-y-3 mt-1">
                <p className="text-[9.5px] text-slate-350 leading-relaxed font-medium">
                  To keep all your watchlist indicators, portfolio history, and price alerts synced, we recommend linking Google sign-in to your existing account.
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                  <motion.button
                    onClick={linkGoogleAccount}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-650 to-indigo-650 text-white text-[11px] font-black rounded-xl cursor-pointer transition select-none flex items-center justify-center gap-1 border-0"
                  >
                    <span>(Recommended) Link Google to existing account</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <button
                    onClick={keepAccountsSeparate}
                    className="w-full py-2.5 px-4 bg-[#111827] border border-[#293550] text-slate-300 hover:text-slate-100 hover:bg-slate-800 text-[10px] font-bold rounded-xl cursor-pointer transition select-none"
                  >
                    Keep accounts separate (create new Google profile)
                  </button>

                  <button
                    onClick={() => {
                      cancelSameEmailLink();
                      setFormMode('login');
                    }}
                    className="w-full py-2.5 px-4 bg-transparent text-violet-400 hover:text-violet-300 text-[10px] font-bold cursor-pointer transition select-none outline-none border-0"
                  >
                    Continue with existing Email account (enter password)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Icon Container */}
              <div className="flex justify-center mt-1 select-none relative">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1.5 -left-1.5 text-violet-400 text-xs"
                  >
                    ✦
                  </motion.div>
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
                <h2 id="modal-title" className="text-base font-black text-slate-100 tracking-tight uppercase">
                  {formMode === 'options' ? title : formMode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-[10.5px] text-[#94A3B8] font-medium leading-relaxed max-w-[420px] mx-auto">
                  {subtitle}
                </p>
              </div>

              {/* Dynamic Content Views */}
              {formMode === 'options' && (
                <>
                  <AuthBenefitsList />
                  
                  <div className="flex flex-col gap-2.5 mt-2">
                    <motion.button 
                      onClick={() => setFormMode('login')}
                      whileHover={{ scale: 1.015, boxShadow: "0 0 15px rgba(139,92,246,0.3)" }}
                      whileTap={{ scale: 0.985 }}
                      className="w-full h-[40px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11.5px] font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition select-none border-0"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Continue with Email</span>
                    </motion.button>

                    <motion.button 
                      onClick={signInWithGoogle}
                      whileHover={{ scale: 1.015, backgroundColor: "#1c2642" }}
                      whileTap={{ scale: 0.985 }}
                      className="w-full h-[40px] bg-[#162039] border border-[#293550] text-slate-100 text-[11.5px] font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition select-none"
                    >
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
                      <span>Continue with Google</span>
                    </motion.button>
                  </div>
                </>
              )}

              {/* Login / Registration Forms */}
              {formMode !== 'options' && (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 text-left">
                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold p-2.5 rounded-xl text-center leading-snug">
                      {errorMsg}
                    </div>
                  )}

                  {formMode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-450 uppercase tracking-wide">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          ref={nameInputRef}
                          type="text"
                          placeholder="Akash Verma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#162039] border border-violet-500/20 focus:border-violet-500 text-slate-100 placeholder:text-slate-550 rounded-xl pl-10 pr-4 py-2.5 text-[10px] outline-none transition-colors font-medium"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-450 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        ref={emailInputRef}
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#162039] border border-violet-500/20 focus:border-violet-500 text-slate-100 placeholder:text-slate-550 rounded-xl pl-10 pr-4 py-2.5 text-[10px] outline-none transition-colors font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-450 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#162039] border border-violet-500/20 focus:border-violet-500 text-slate-100 placeholder:text-slate-550 rounded-xl pl-10 pr-4 py-2.5 text-[10px] outline-none transition-colors font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-2">
                    <motion.button 
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="flex-1 h-[40px] bg-gradient-to-r from-violet-650 to-indigo-650 text-white text-[11px] font-extrabold rounded-xl cursor-pointer transition select-none disabled:opacity-50 border-0"
                    >
                      {isSubmitting ? "Authenticating..." : formMode === 'login' ? "Sign In" : "Register"}
                    </motion.button>

                    <button 
                      type="button"
                      onClick={() => setFormMode('options')}
                      className="h-[40px] px-4 bg-slate-900 border border-violet-500/20 text-slate-350 text-[11px] font-bold rounded-xl cursor-pointer hover:bg-slate-800 transition select-none"
                    >
                      Back
                    </button>
                  </div>

                  <div className="text-center mt-1">
                    {formMode === 'login' ? (
                      <p className="text-[9px] text-slate-450">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMsg(null);
                            setFormMode('register');
                          }}
                          className="text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer outline-none border-0 bg-transparent"
                        >
                          Create one now
                        </button>
                      </p>
                    ) : (
                      <p className="text-[9px] text-slate-455">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMsg(null);
                            setFormMode('login');
                          }}
                          className="text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer outline-none border-0 bg-transparent"
                        >
                          Sign in here
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* Footer message with green shield icon */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5 border-t border-slate-900/60 pt-3.5 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[8px] text-[#94A3B8] font-bold leading-none uppercase tracking-wide">
              Your watchlist, portfolio, alerts, and reports will be securely saved after sign-in.
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
