'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConductQuizStudent } from '@/components/live/ConductQuizStudent';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { useToast } from '@/components/ui/ToastNotification';
import {
  Loader2,
  Play,
  User,
  QrCode,
  Sparkles,
  Smile,
  ShieldCheck,
} from 'lucide-react';

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
      const storedParticipantId =
        typeof window !== 'undefined' ? sessionStorage.getItem(`participant_${code.trim()}`) : null;

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-4 max-w-sm w-full">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Connecting to Quiz Session...</h2>
          <p className="text-xs text-slate-500 font-semibold">Hold tight! Entering the live lobby.</p>
        </div>
      </div>
    );
  }

  // Active Session View (Conduct Quiz & Live Quiz Session Client)
  if (joined && session) {
    if (session.sessionType === 'LIVE_GAME') {
      return (
        <LiveGameStudent
          quizCode={quizCode}
          displayName={displayName}
          participantId={participantId}
          onExit={() => router.push('/')}
        />
      );
    }
    return (
      <ConductQuizStudent
        quizCode={quizCode}
        displayName={displayName}
        participantId={participantId}
        onExit={() => router.push('/')}
      />
    );
  }

  // SCREEN 1: JOIN SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-50 to-purple-50/40 flex flex-col items-center justify-between p-4 sm:p-6 font-sans text-slate-900 relative overflow-hidden">
      
      {/* Top Banner Taglines */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between text-xs font-serif italic text-blue-600 font-bold px-2 pt-1">
        <span className="rotate-[-2deg]">Great Learners Make a Brighter Tomorrow!</span>
        <span className="rotate-[2deg] text-amber-600">Same Questions Bigger Minds!</span>
      </div>

      {/* Center Mobile-Style Floating Card (Screen 1 Design) */}
      <main className="my-auto max-w-md w-full py-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[36px] p-7 sm:p-9 space-y-6 text-center relative overflow-hidden">
          
          {/* Top Logo Identity */}
          <div className="flex flex-col items-center space-y-1.5 pt-1">
            <img src="/QuizArena Icon.png" alt="QuizArena Logo" className="w-14 h-14 object-contain drop-shadow-sm" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Quiz<span className="text-blue-600">Arena</span>
            </h1>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Learn • Assess • Grow
            </p>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Join the Live Quiz</h2>
            <p className="text-xs text-slate-500 font-medium px-4">
              Enter your name and the 6-digit game code to get started.
            </p>
          </div>

          {/* QR Auto-detect Pill */}
          {codeFromUrl && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center space-x-2 text-blue-900 text-xs font-bold">
              <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
              <span>QR Code detected! Code <strong>{codeFromUrl}</strong> auto-filled.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            
            {/* Input 1: Enter your name */}
            <div className="space-y-1">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center space-x-3.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Enter your name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ajay"
                    className="w-full text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Input 2: Game Code */}
            <div className="space-y-1">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center space-x-3.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 font-black text-lg">
                  #
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Game Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value)}
                    placeholder="e.g. 522584"
                    className="w-full text-lg font-black font-mono tracking-widest text-slate-900 uppercase bg-transparent focus:outline-none placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-base rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 active:scale-98 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current text-white" />
                  <span>Join Quiz</span>
                </>
              )}
            </button>

            {/* Caption */}
            <p className="text-center text-[11px] font-bold text-slate-400 pt-1">
              No account required
            </p>
          </form>

          {/* Cartoon Avatar Illustration with Slogan Badge */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md rotate-[-4deg]">
                <Smile className="w-7 h-7" />
              </div>
              <div>
                <p className="font-serif italic font-extrabold text-xs text-blue-700 leading-tight">
                  Play • Learn • Compete • Grow
                </p>
                <p className="text-[10px] text-slate-400 font-bold">QuizArena Live</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">BY</span>
              <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-4 object-contain mt-0.5" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 text-center text-[11px] text-slate-400 font-semibold w-full">
        QuizArena | Learn Today • Compete Today • Grow Together
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
