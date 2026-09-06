'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConductQuizStudent } from '@/components/live/ConductQuizStudent';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { useToast } from '@/components/ui/ToastNotification';
import {
  Loader2,
  Play,
  Users,
  Hash,
  User,
  QrCode,
  Zap,
  Trophy,
  Sparkles,
  Gamepad2,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Star,
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

  // Public Join Page matching reference design
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/70 via-blue-50/60 to-amber-50/50 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans text-slate-900 relative overflow-x-hidden">
      
      {/* BRAND HEADER */}
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full py-2">
        <a href="/" className="flex items-center space-x-3 group">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-10 h-10 object-contain group-hover:scale-105 transition" />
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Quiz<span className="text-blue-600">Arena</span>
              </span>
            </div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Learn • Assess • Grow
            </p>
          </div>
        </a>

        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">BY</span>
          <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-5 object-contain" />
        </div>
      </header>

      {/* MAIN CENTER CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT SIDE HERO SECTION */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
            
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                Join the <br />
                <span className="text-blue-600 relative inline-block">
                  Quiz!
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-amber-400"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M5 15 Q 50 0 95 15"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xs pt-1">
                It's quick, easy and fun. Enter your name and the game code to get started!
              </p>
            </div>

            {/* Left Speech Bubble Badge */}
            <div className="bg-purple-100 border border-purple-200/90 text-purple-900 px-4 py-2.5 rounded-2xl shadow-md rotate-[-4deg] font-serif italic text-xs font-bold space-y-0.5">
              <span>Play Compete Learn Together!</span>
            </div>

            {/* 3D Student Illustration Left */}
            <div className="hidden lg:flex flex-col items-center pt-2">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/20 rotate-[-6deg]">
                <Gamepad2 className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* CENTER FORM FLOATING CARD */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-[32px] p-7 sm:p-10 max-w-md w-full space-y-6">
              
              {/* Card Header Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-200/60">
                  <Users className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join QuizArena</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter your display name and the 6-digit session code to participate in the live quiz.
                </p>
              </div>

              {/* QR Code Auto-detect Notification */}
              {codeFromUrl && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-2.5 text-blue-900 text-xs font-bold">
                  <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>QR Code detected! Code <strong>{codeFromUrl}</strong> auto-filled.</span>
                </div>
              )}

              {/* JOIN FORM */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Field 1: YOUR DISPLAY NAME */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">
                    YOUR DISPLAY NAME
                  </label>
                  
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center space-x-3.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Field 2: 6-DIGIT QUIZ CODE */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">
                    6-DIGIT QUIZ CODE
                  </label>
                  
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center space-x-3.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 font-bold text-lg">
                      #
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={quizCode}
                      onChange={(e) => setQuizCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full text-lg font-black font-mono tracking-widest text-slate-900 uppercase bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm placeholder:tracking-normal"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-black text-base rounded-2xl transition shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 active:scale-95 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current text-white" />
                      <span>Join Quiz Now</span>
                    </>
                  )}
                </button>

                {/* Sub-notice */}
                <div className="text-center pt-1 text-[11px] text-slate-400 font-bold">
                  No account required • Instant participation
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE HERO SECTION */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end text-center lg:text-right space-y-5">
            
            {/* Right Speech Bubble Badge */}
            <div className="bg-amber-100 border border-amber-200/90 text-amber-900 px-4 py-2.5 rounded-2xl shadow-md rotate-[4deg] font-serif italic text-xs font-bold space-y-0.5">
              <span>Same Questions Bigger Minds!</span>
            </div>

            <p className="font-serif italic font-black text-blue-600 text-base rotate-[-3deg] tracking-wide">
              Good Learners<br />
              Brighter Futures
            </p>

            {/* 3D Student Illustration Right */}
            <div className="hidden lg:flex flex-col items-center space-y-2 pt-2">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-400/20 rotate-[6deg]">
                <Trophy className="w-12 h-12" />
              </div>

              {/* Stacked Play Learn Grow Badges */}
              <div className="flex flex-col space-y-1 text-[10px] font-black tracking-wider text-white">
                <span className="bg-blue-600 px-3 py-1 rounded-md shadow-2xs">PLAY</span>
                <span className="bg-purple-600 px-3 py-1 rounded-md shadow-2xs">LEARN</span>
                <span className="bg-amber-500 px-3 py-1 rounded-md shadow-2xs">GROW</span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM 3 FEATURE HIGHLIGHTS PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 max-w-4xl mx-auto w-full">
          
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">No Login Required</h4>
              <p className="text-[11px] text-slate-500 font-medium">Join with just a name and code</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Live Participation</h4>
              <p className="text-[11px] text-slate-500 font-medium">Be part of the action in real-time</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Fun & Engaging</h4>
              <p className="text-[11px] text-slate-500 font-medium">Learn, compete and grow together</p>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-2 text-center text-xs text-slate-400 font-semibold max-w-7xl mx-auto w-full">
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

