'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, 
  User as UserIcon, Zap, CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();

  const initialMode = searchParams.get('mode') === 'register';
  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justRegisteredMsg, setJustRegisteredMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setJustRegisteredMsg('');

    if (isSignUp) {
      // ─── Registration Flow ───────────────────────────────────────
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      if (!email.trim()) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Password must be at least 4 characters');
        return;
      }

      setLoading(true);
      const success = await register(name, email, password);
      setLoading(false);

      if (success) {
        // As requested: after register, transition to login page with pre-filled email!
        setJustRegisteredMsg('Account created successfully! Please enter your password to sign in.');
        setIsSignUp(false);
        setPassword('');
      }
    } else {
      // ─── Login Flow ──────────────────────────────────────────────
      if (!email.trim()) {
        setErrorMsg('Please enter your email');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password');
        return;
      }

      setLoading(true);
      const success = await login(email, password);
      setLoading(false);

      if (success) {
        // As requested: after login, go to the home page that displays sidebar and everything!
        router.push('/');
      }
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string = '123456', role: 'admin' | 'customer' = 'customer') => {
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
    const success = await login(demoEmail, demoPassword, role);
    setLoading(false);
    if (success) {
      router.push('/');
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative ambient-glow-wrapper bg-[#06070d]">
        <div className="ambient-glow-orb-2" />
        <div className="ambient-glow-orb-3" />

        <div className="w-full max-w-md relative z-10">
          {/* Top Brand Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 p-0.5 shadow-2xl shadow-violet-600/40 mx-auto mb-3.5">
              <div className="w-full h-full bg-[#0b0c16] rounded-[22px] flex items-center justify-center">
                <Sparkles size={28} className="text-violet-400" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              {isSignUp ? 'Create BioStore Account' : 'Welcome to BioStore'}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1.5 max-w-xs mx-auto">
              {isSignUp 
                ? 'Join thousands shopping directly from curated creators with live zero-redirect checkout'
                : 'Sign in to access your orders, saved wishlist, and live stock synchronization'
              }
            </p>
          </div>

          {/* Luxury Auth Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.12] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Top Glow Accent Line */}
            <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

            {/* Success notification after registration */}
            {justRegisteredMsg && (
              <div className="mb-5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{justRegisteredMsg}</span>
              </div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-fade-in">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab Switcher: Sign In vs Register */}
            <div className="flex rounded-xl bg-white/[0.04] p-1 mb-5 border border-white/[0.06]">
              <button
                type="button"
                id="login-tab-signin"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                  setJustRegisteredMsg('');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  !isSignUp 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md' 
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="login-tab-register"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                  setJustRegisteredMsg('');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isSignUp 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md' 
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* 1-Click Demo Profiles (For Instant Evaluation) */}
            {!isSignUp && (
              <div className="mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-2 px-1 flex items-center gap-1.5">
                  <Zap size={11} className="fill-violet-400" /> 1-Click Fast Demo Login
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('priya.sharma@gmail.com', '123456', 'customer')}
                    className="p-2.5 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-left transition-all group"
                  >
                    <p className="font-bold text-xs text-pink-300 group-hover:text-white">VIP Shopper</p>
                    <p className="text-[10px] text-white/40 truncate">Priya Sharma</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin@biostorefront.com', '123456', 'admin')}
                    className="p-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-left transition-all group"
                  >
                    <p className="font-bold text-xs text-violet-300 group-hover:text-white">Store Owner</p>
                    <p className="text-[10px] text-white/40 truncate">Aarav Patel (Admin)</p>
                  </button>
                </div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div className="animate-fade-in">
                  <label className="label" htmlFor="register-name">Full Name</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      className="luxury-input pl-11"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label" htmlFor="login-email">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    className="luxury-input pl-11"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="luxury-input pl-11 pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="auth-submit-button"
                disabled={loading}
                className="btn-luxury-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-5 shadow-lg shadow-violet-600/30"
              >
                <span>
                  {loading 
                    ? 'Authenticating...' 
                    : isSignUp 
                      ? 'Register Account' 
                      : 'Sign In to Storefront'
                  }
                </span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="mt-5 text-center">
              {isSignUp ? (
                <p className="text-xs text-white/50">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg('');
                    }}
                    className="text-violet-400 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p className="text-xs text-white/50">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMsg('');
                    }}
                    className="text-violet-400 font-bold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}
            </div>

            {/* Security Guarantee */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Live PostgreSQL Persistence & 256-Bit SSL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#06070d] text-white/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Loading authentication...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
