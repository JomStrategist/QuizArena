'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { ConductQuizStudent } from '@/components/live/ConductQuizStudent';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { LivePodiumFinale } from '@/components/live/LivePodiumFinale';
import { IQuestion, ILiveParticipant } from '@/types';
import { useToast } from '@/components/ui/ToastNotification';
import { Loader2, Play, Users, Hash, User } from 'lucide-react';

function PublicQuizJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const codeFromUrl = searchParams.get('code') || '';
  const nameFromUrl = searchParams.get('name') || '';

  const [quizCode, setQuizCode] = useState(codeFromUrl);
  const [displayName, setDisplayName] = useState(nameFromUrl);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  // Joining session with Quiz Code (No login required)
  const joinSession = async (code: string, name: string) => {
    if (!code || code.length !== 6 || !name) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/live-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode: code.trim(),
          displayName: name.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to join quiz session.');
      }

      setSession(json.data);
      setJoined(true);
      showToast(`Joined session for "${json.data.quizTitle}"!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error joining quiz session', 'error');
      setJoined(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codeFromUrl && nameFromUrl) {
      joinSession(codeFromUrl, nameFromUrl);
    }
  }, [codeFromUrl, nameFromUrl]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Please enter your name.', 'warning');
      return;
    }
    if (!quizCode.trim() || quizCode.trim().length !== 6) {
      showToast('Please enter a valid 6-digit Quiz Code.', 'warning');
      return;
    }
    joinSession(quizCode, displayName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500 font-bold text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Connecting to Quiz Session...</span>
        </div>
      </div>
    );
  }

  // Active Session View (Conduct Quiz or Live Game)
  if (joined && session) {
    if (session.sessionType === 'CONDUCT') {
      return (
        <ConductQuizStudent
          quizCode={quizCode}
          displayName={displayName}
          onExit={() => router.push('/')}
        />
      );
    }

    // Default Live Game view for Live Session
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <BrandHeader subtitle="Live Quiz Arena" />
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-50">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase">
                LIVE GAME SESSION
              </span>
              <h1 className="text-2xl font-black text-slate-900 pt-2">{session.quizTitle}</h1>
              <p className="text-xs font-bold text-slate-500">Player: {displayName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-amber-700 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Waiting for Trainer to start the Live Game...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Public Join Form if code/name not prefilled
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <BrandHeader subtitle="Join Quiz Session" />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Join Quiz Arena</h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your 6-digit Quiz Code and name to join the session immediately
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">6-Digit Quiz Code</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  placeholder="e.g. 482915"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black tracking-widest text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current text-amber-300" />
              <span>Join Quiz Now</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 font-medium">
        QuizArena by KVJ Analytics
      </footer>
    </div>
  );
}

export default function PublicQuizJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <PublicQuizJoinContent />
    </Suspense>
  );
}
