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
  const [participantId, setParticipantId] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  // Joining session with Quiz Code (No login required)
  const joinSession = async (code: string, name: string) => {
    if (!code || code.length !== 6 || !name) return;

    setLoading(true);
    try {
      const storedParticipantId = typeof window !== 'undefined' ? sessionStorage.getItem(`participant_${code.trim()}`) : null;

      const res = await fetch('/api/v1/live-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode: code.trim(),
          displayName: name.trim(),
          participantId: storedParticipantId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to join quiz session.');
      }

      setSession(json.data);
      const pId = json.participantId || json.participant?.participantId || '';
      setParticipantId(pId);
      if (pId && typeof window !== 'undefined') {
        sessionStorage.setItem(`participant_${code.trim()}`, pId);
      }
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

  // Active Session View (Conduct Quiz & Live Quiz Session Client)
  if (joined && session) {
    return (
      <ConductQuizStudent
        quizCode={quizCode}
        displayName={displayName}
        participantId={participantId}
        onExit={() => router.push('/')}
      />
    );
  }

  // Public Join Form if code/name not prefilled
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <BrandHeader subtitle="Join Quiz Session" />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Join a Quiz</h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Enter your name and the 6-digit code provided by your trainer.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                YOUR NAME
              </label>
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
              <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                QUIZ CODE
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black tracking-widest text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current text-amber-300" />
              <span>JOIN QUIZ</span>
            </button>

            <div className="text-center pt-1 text-slate-500 text-xs font-semibold">
              <span>No account required</span>
            </div>
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
