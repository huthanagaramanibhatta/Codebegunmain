'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);

    if (success) {
      // As requested: after register page it should go to login page!
      router.push('/login');
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative ambient-glow-wrapper bg-[#06070d]">
        <div className="ambient-glow-orb-2" />
        <div className="ambient-glow-orb-3" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 p-0.5 shadow-2xl shadow-violet-600/40 mx-auto mb-3.5">
              <div className="w-full h-full bg-[#0b0c16] rounded-[22px] flex items-center justify-center">
                <Sparkles size={28} className="text-violet-400" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Create BioStore Account
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1.5 max-w-xs mx-auto">
              Join thousands shopping directly from curated creators with live zero-redirect checkout
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.12] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

            {errorMsg && (
              <div className="mb-5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-fade-in">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="label" htmlFor="name">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="name"
                    type="text"
                    required
                    className="luxury-input pl-11"
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    required
                    className="luxury-input pl-11"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="password"
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
                disabled={loading}
                className="btn-luxury-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-5 shadow-lg shadow-violet-600/30"
              >
                <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-white/50">
                Already have an account?{' '}
                <Link href="/login" className="text-violet-400 font-bold hover:underline">
                  Sign In here
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Protected by 256-Bit SSL Encryption</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
