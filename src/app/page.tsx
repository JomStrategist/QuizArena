'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { Shield, User, Play, Sparkles, ArrowRight, FileSpreadsheet, Lock, Send } from 'lucide-react';
import { useToast } from '@/components/ui/ToastNotification';

export default function PublicLandingPage() {
  const [quizCodeInput, setQuizCodeInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCodeInput.trim() || quizCodeInput.trim().length !== 6) {
      showToast('Please enter a valid 6-digit Quiz Code (e.g. 482915)', 'warning');
      return;
    }
    if (!displayNameInput.trim()) {
      showToast('Please enter your display name to join.', 'warning');
      return;
    }

    showToast(`Joining Live Quiz Session #${quizCodeInput}...`, 'info');
    router.push(`/auth/student?code=${quizCodeInput.trim()}&name=${encodeURIComponent(displayNameInput.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <BrandHeader subtitle="Internal Training & Assessment Platform" />

      {/* Main Landing & Entry Experience */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 space-y-12 flex flex-col justify-center">
        {/* Hero Branding Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              ENTERPRISE LEARNING & ASSESSMENT
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Interactive Quizzes & <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Real-Time Assessments
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 font-medium max-w-xl mx-auto">
            Welcome to <strong className="text-slate-900">QuizArena</strong>, the internal training platform by{' '}
            <strong className="text-slate-900">KVJ Analytics</strong>. Please select your role to proceed.
          </p>
        </div>

        {/* Dual Entry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* TRAINER PORTAL CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 flex flex-col justify-between space-y-6 hover:border-blue-300 transition group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Shield className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">Trainer Portal</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  For trainers and instructors managing quizzes, importing questions, assigning tests, and conducting live games.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Question Bank & Excel/Word File Import</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Assign Quizzes by Student Emails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Launch ~200 Student Live Game Sessions</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => router.push('/auth/trainer')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Trainer Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STUDENT PORTAL CARD */}
          <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 rounded-3xl shadow-xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-slate-950 flex items-center justify-center backdrop-blur-md">
                <User className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black">Student Portal</h2>
                <p className="text-xs font-semibold text-slate-900/80 mt-1">
                  Access your assigned quizzes, view upcoming due dates, or join a live classroom competition.
                </p>
              </div>

              {/* Instant Live Code Join Form */}
              <form onSubmit={handleQuickJoin} className="bg-white/95 p-4 rounded-2xl space-y-3 text-slate-900 shadow-inner">
                <p className="text-xs font-black uppercase tracking-wider text-slate-800">Quick Join Live Quiz</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="Your Display Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={quizCodeInput}
                    onChange={(e) => setQuizCodeInput(e.target.value)}
                    placeholder="6-Digit Code (e.g. 482915)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-black tracking-widest uppercase text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Join Live Session</span>
                </button>
              </form>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push('/auth/student')}
                className="w-full py-3 bg-white/20 hover:bg-white/30 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center space-x-2 border border-white/30"
              >
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400 font-medium">
        QuizArena by KVJ Analytics • Internal Assessment Platform
      </footer>
    </div>
  );
}
