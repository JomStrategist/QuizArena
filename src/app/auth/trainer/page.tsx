'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/ToastNotification';

function TrainerLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const errorMessage = searchParams.get('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your trainer email address.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role: 'TRAINER',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Authentication failed.');
      }

      showToast(`Welcome back, ${json.data.user.name}!`, 'success');
      router.push('/trainer/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trainer Portal Sign In</h1>
        <p className="text-xs text-slate-500 font-medium">
          Access quiz management, question bank, assignments & live session controls
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>
            {errorMessage === 'unauthorized'
              ? 'Please sign in to access the Trainer area.'
              : 'Access denied. Trainer permissions required.'}
          </span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Trainer Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@thestrategist.co.in"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Trainer Dashboard</span>}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function TrainerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <BrandHeader subtitle="Trainer Authentication Portal" />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="p-8 text-slate-500">Loading form...</div>}>
          <TrainerLoginForm />
        </Suspense>
      </main>
      <footer className="py-4 text-center text-xs text-slate-400 font-medium">
        QuizArena by KVJ Analytics
      </footer>
    </div>
  );
}
