'use client';

import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Download, RotateCcw, Crown, Sparkles, X, Award } from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { soundManager } from '@/lib/game/soundManager';
import { LEADERBOARD_ANIMATION_CONFIG } from '@/config/leaderboardAnimationConfig';

interface LivePodiumFinaleProps {
  quizTitle: string;
  rankings: any[];
  userDisplayName?: string;
  userParticipantId?: string;
  onBackToDashboard: () => void;
  isTrainer?: boolean;
}

export const LivePodiumFinale: React.FC<LivePodiumFinaleProps> = ({
  quizTitle,
  rankings = [],
  userDisplayName,
  userParticipantId,
  onBackToDashboard,
  isTrainer = false,
}) => {
  const { showToast } = useToast();

  // Sequential Reveal State Machine:
  // 'intro' -> 'reveal3rd' -> 'reveal2nd' -> 'reveal1st' -> 'celebrate' -> 'showRemaining'
  const [stage, setStage] = useState<'intro' | 'reveal3rd' | 'reveal2nd' | 'reveal1st' | 'celebrate' | 'showRemaining'>('intro');

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Sequential Animation Timeline Controller
  useEffect(() => {
    // Reset state & clear previous timers/effects for Replay Protection
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Start Leaderboard Reveal Music (Single Instance)
    if (LEADERBOARD_ANIMATION_CONFIG.audio.enabled) {
      soundManager.playLeaderboardSound();
    }

    const cfg = LEADERBOARD_ANIMATION_CONFIG.final;

    // Timeline calculations:
    const t3 = cfg.introDurationMs;
    const t2 = t3 + cfg.thirdPlaceRevealDurationMs;
    const t1 = t2 + cfg.secondPlaceRevealDurationMs;
    const tCelebrate = t1 + cfg.winnerRevealDurationMs;
    const tRemaining = tCelebrate + 400;

    // 1. Reveal 3rd Place
    const timer3 = setTimeout(() => {
      setStage('reveal3rd');
    }, t3);

    // 2. Reveal 2nd Place
    const timer2 = setTimeout(() => {
      setStage('reveal2nd');
    }, t2);

    // 3. Reveal 1st Place
    const timer1 = setTimeout(() => {
      setStage('reveal1st');
    }, t1);

    // 4. Trigger Winner Confetti & Celebration
    const timerCelebrate = setTimeout(() => {
      setStage('celebrate');
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6', '#ec4899'],
        });
      } catch (e) {}
    }, tCelebrate);

    // 5. Reveal Remaining Participants
    const timerRemaining = setTimeout(() => {
      setStage('showRemaining');
    }, tRemaining);

    timersRef.current = [timer3, timer2, timer1, timerCelebrate, timerRemaining];

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [rankings.length]);

  // Top 3 players
  const top1 = rankings[0] || null;
  const top2 = rankings[1] || null;
  const top3 = rankings[2] || null;
  const remainingRankings = rankings.slice(3);

  // Dynamic calculate remaining row stagger delay based on participant count
  const effectiveRemainingStaggerMs = Math.min(
    LEADERBOARD_ANIMATION_CONFIG.final.remainingParticipantStaggerMs,
    Math.max(15, Math.floor(LEADERBOARD_ANIMATION_CONFIG.final.maxRemainingStaggerMs / Math.max(1, remainingRankings.length)))
  );

  const handleDownloadReport = () => {
    try {
      const headers = 'Rank,Name,Score,Accuracy\n';
      const rows = rankings
        .map((p, idx) => `${idx + 1},"${p.displayName || 'Participant'}",${p.score || 0},${p.accuracy || 0}%`)
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quizTitle.replace(/\s+/g, '_')}_Conduct_Report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Conduct Report CSV downloaded!', 'success');
    } catch (e) {
      showToast('Error downloading report.', 'error');
    }
  };

  const isVisible3rd = stage !== 'intro';
  const isVisible2nd = stage !== 'intro' && stage !== 'reveal3rd';
  const isVisible1st = stage === 'reveal1st' || stage === 'celebrate' || stage === 'showRemaining';
  const isVisibleRemaining = stage === 'showRemaining';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-blue-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans overflow-x-hidden animate-in fade-in duration-500">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto shrink-0 pt-2">
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Logo.png" alt="QuizArena" className="h-10 object-contain" />
          <div className="hidden sm:block border-l border-white/20 pl-3">
            <span className="text-xs font-extrabold text-blue-300 tracking-wider">
              {quizTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-extrabold text-amber-300 backdrop-blur-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Final Quiz Leaderboard</span>
          </div>

          {isTrainer && (
            <button
              onClick={onBackToDashboard}
              title="Close & Return to Dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose-500/80 border border-white/20 hover:border-rose-400 text-white transition-all duration-200 shadow-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Stage */}
      <div className="my-auto max-w-4xl mx-auto w-full space-y-8 py-6 text-center">
        
        {/* Title Banner */}
        <div className="space-y-1 animate-in zoom-in-95 duration-500">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-lg">
            QUIZ CHAMPIONS
          </h1>
          <p className="text-sm sm:text-base font-extrabold text-blue-200">
            Great Minds Learn Together!
          </p>
        </div>

        {/* 3D PODIUM DISPLAY (Sequential Reveal: 3rd -> 2nd -> 1st) */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-2 min-h-[260px]">
          
          {/* Rank 2 - Silver (Left - Revealed 2nd) */}
          <div
            className={`flex flex-col items-center space-y-2 w-28 sm:w-36 transition-all duration-700 ${
              isVisible2nd
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-900 font-black text-lg flex items-center justify-center border-2 border-slate-100 shadow-lg ring-4 ring-slate-400/30">
              2
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[110px]">
                {top2 ? top2.displayName : '-'}
              </p>
              <p className="text-xs font-black text-slate-300 font-mono">
                {top2 ? `${(top2.score || 0).toLocaleString()} pts` : '-'}
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-700 to-slate-500 h-28 rounded-t-2xl flex items-center justify-center border-t-2 border-slate-300 shadow-xl">
              <span className="text-3xl font-black text-slate-200">🥈 2</span>
            </div>
          </div>

          {/* Rank 1 - Gold (Center - Dramatic Coronation Reveal 1st) */}
          <div
            className={`flex flex-col items-center space-y-2 w-36 sm:w-48 -mt-10 transition-all duration-1000 ${
              isVisible1st
                ? 'opacity-100 translate-y-0 scale-105'
                : 'opacity-0 translate-y-16 scale-90 pointer-events-none'
            }`}
          >
            {/* CORONATION CROWN & AVATAR CONTAINER */}
            <div className="relative flex flex-col items-center pt-8">
              {/* ANIMATED DESCENDING CROWN (Lands onto 1st place head in celebrate stage) */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-20 transform ${
                  stage === 'celebrate' || stage === 'showRemaining'
                    ? 'translate-y-0 opacity-100 scale-100 rotate-0'
                    : '-translate-y-12 opacity-0 scale-150 -rotate-12'
                }`}
              >
                <div className="relative">
                  <Crown className="w-11 h-11 text-amber-300 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-bounce" />
                  <Sparkles className="w-5 h-5 text-amber-200 animate-spin absolute -top-2 -right-3" />
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse absolute -top-1 -left-3" />
                </div>
              </div>

              {/* CHAMPION AVATAR WITH GOLDEN GLOW & COOL SUNGLASSES */}
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-3xl flex items-center justify-center border-4 border-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.6)] ring-4 transition-all duration-700 ${
                    stage === 'celebrate' || stage === 'showRemaining'
                      ? 'scale-110 ring-amber-300 ring-8 shadow-[0_0_40px_rgba(251,191,36,0.9)]'
                      : 'ring-amber-400/50'
                  }`}
                >
                  <span>{top1 ? top1.displayName?.charAt(0).toUpperCase() : '1'}</span>
                </div>

                {/* Cool Sunglasses Emoji Overlay on Champion Avatar */}
                <span className="absolute -bottom-1 -right-1 text-2xl select-none filter drop-shadow-md animate-bounce">
                  😎
                </span>
              </div>
            </div>

            {/* CHAMPION DETAILS & CORONATION BADGE */}
            <div className="text-center space-y-1 pt-1">
              {(stage === 'celebrate' || stage === 'showRemaining') && (
                <div className="inline-flex items-center space-x-1 px-3 py-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-full text-[10px] sm:text-[11px] font-black shadow-lg border border-amber-200 animate-bounce">
                  <span>👑 CORONATED CHAMPION 👑</span>
                </div>
              )}
              <p className="text-base sm:text-lg font-black text-amber-300 truncate max-w-[150px] drop-shadow-md">
                {top1 ? top1.displayName : '-'}
              </p>
              <p className="text-sm font-black text-amber-400 font-mono">
                {top1 ? `${(top1.score || 0).toLocaleString()} pts` : '-'}
              </p>
            </div>

            <div className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 h-44 rounded-t-2xl flex items-center justify-center border-t-4 border-amber-200 shadow-2xl">
              <span className="text-4xl font-black text-slate-950">🥇 1st</span>
            </div>
          </div>

          {/* Rank 3 - Bronze (Right - Revealed 1st in Sequence) */}
          <div
            className={`flex flex-col items-center space-y-2 w-28 sm:w-36 transition-all duration-700 ${
              isVisible3rd
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-800 text-amber-100 font-black text-lg flex items-center justify-center border-2 border-amber-600 shadow-lg ring-4 ring-amber-700/30">
              3
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[110px]">
                {top3 ? top3.displayName : '-'}
              </p>
              <p className="text-xs font-black text-amber-400 font-mono">
                {top3 ? `${(top3.score || 0).toLocaleString()} pts` : '-'}
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-900 to-amber-700 h-20 rounded-t-2xl flex items-center justify-center border-t-2 border-amber-600 shadow-xl">
              <span className="text-3xl font-black text-amber-200">🥉 3</span>
            </div>
          </div>

        </div>

        {/* FINAL LEADERBOARD TABLE (Remaining 4th+ Participants revealed after 1st place) */}
        <div
          className={`bg-slate-900/90 border border-white/15 rounded-3xl p-5 backdrop-blur-md max-w-2xl mx-auto text-left space-y-3 shadow-2xl transition-all duration-500 ${
            isVisibleRemaining
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 px-2">
            <h3 className="text-xs font-black uppercase text-blue-300 tracking-wider">
              Overall Standings & Performers
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{rankings.length} Total Participants</span>
          </div>

          <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
            {rankings.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2">No scores recorded yet.</p>
            ) : (
              rankings.map((p: any, idx: number) => {
                const isCurrentUser =
                  (userParticipantId && p.participantId === userParticipantId) ||
                  (userDisplayName && p.displayName?.trim().toLowerCase() === userDisplayName.trim().toLowerCase());

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 items-center p-3 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-amber-400/20 border-amber-400/50 text-amber-200 font-extrabold shadow-sm'
                        : idx === 1
                        ? 'bg-blue-400/15 border-blue-400/30 text-blue-200 font-bold'
                        : idx === 2
                        ? 'bg-amber-700/20 border-amber-600/30 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 text-white font-semibold'
                    } ${isCurrentUser ? 'ring-2 ring-blue-400' : ''}`}
                    style={{ animationDelay: `${(idx - 3) * effectiveRemainingStaggerMs}ms` }}
                  >
                    <span className="col-span-1 font-black text-slate-400">#{idx + 1}</span>
                    <span className="col-span-6 font-extrabold truncate flex items-center space-x-2">
                      <span>{p.displayName}</span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="col-span-3 text-right font-black font-mono text-amber-400 text-sm">
                      {(p.score || 0).toLocaleString()}
                    </span>
                    <span className="col-span-2 text-right font-bold text-emerald-400">
                      {p.accuracy !== undefined ? `${p.accuracy}%` : '0%'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 max-w-md mx-auto pt-2 transition-all duration-500 ${
            isVisibleRemaining ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {isTrainer && (
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-black transition flex items-center space-x-2 backdrop-blur-md cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          )}

          <button
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black transition shadow-xl shadow-blue-600/30 flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isTrainer ? 'Back to Dashboard' : 'Play Again'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-blue-300 font-medium shrink-0 pt-2 border-t border-white/10">
        QuizArena | Play • Learn • Compete • Grow Together
      </div>
    </div>
  );
};
