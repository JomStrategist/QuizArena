'use client';

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Users, Target, Trophy } from 'lucide-react';
import { ILiveParticipant } from '@/types';
import { soundManager } from '@/lib/game/soundManager';
import { LEADERBOARD_ANIMATION_CONFIG } from '@/config/leaderboardAnimationConfig';

interface Top5LeaderboardProps {
  rankings: ILiveParticipant[];
  currentQuestionIndex: number;
  totalQuestions: number;
  userDisplayName?: string;
  userParticipantId?: string;
  sessionType?: 'LIVE_GAME' | 'CONDUCT';
}

/**
 * Animated Number Counter for smooth score transition (160 -> 183)
 */
const AnimatedNumber: React.FC<{ value: number; durationMs?: number }> = ({
  value,
  durationMs = LEADERBOARD_ANIMATION_CONFIG.intermediate.scoreAnimationDurationMs,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) return;

    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeOutCubic);
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, durationMs]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export const Top5Leaderboard: React.FC<Top5LeaderboardProps> = ({
  rankings = [],
  currentQuestionIndex,
  totalQuestions,
  userDisplayName = '',
  userParticipantId = '',
  sessionType = 'LIVE_GAME',
}) => {
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (LEADERBOARD_ANIMATION_CONFIG.audio.enabled) {
      soundManager.playLeaderboardSound();
    }
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...rankings].sort((a, b) => (b.score || 0) - (a.score || 0));
  const allRankings = sorted;
  const currentQNum = (currentQuestionIndex || 0) + 1;
  const totalParticipants = rankings.length;

  const avatarColors = [
    'bg-purple-600 text-white',
    'bg-blue-600 text-white',
    'bg-amber-600 text-white',
    'bg-blue-500 text-white',
    'bg-indigo-600 text-white',
    'bg-sky-500 text-white',
    'bg-rose-500 text-white',
    'bg-violet-600 text-white',
    'bg-red-500 text-white',
    'bg-purple-500 text-white',
  ];

  // FLIP Animation References
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const prevRectsRef = useRef<Record<string, DOMRect>>({});

  // Dynamic calculate row stagger delay based on total participant count
  const effectiveStaggerMs = Math.min(
    LEADERBOARD_ANIMATION_CONFIG.intermediate.rowStaggerMs,
    Math.max(15, Math.floor(LEADERBOARD_ANIMATION_CONFIG.intermediate.maxRowStaggerMs / Math.max(1, allRankings.length)))
  );

  // FLIP (First, Last, Invert, Play) Layout Animation Hook
  useLayoutEffect(() => {
    allRankings.forEach((p) => {
      const id = p.participantId || p.displayName;
      const el = rowRefs.current[id];
      if (el) {
        const newRect = el.getBoundingClientRect();
        const prevRect = prevRectsRef.current[id];
        if (prevRect) {
          const deltaY = prevRect.top - newRect.top;
          if (deltaY !== 0) {
            // First & Last -> Invert
            el.style.transform = `translateY(${deltaY}px)`;
            el.style.transition = 'transform 0s';

            // Play smooth transition to final location
            requestAnimationFrame(() => {
              el.style.transform = '';
              el.style.transition = `transform ${LEADERBOARD_ANIMATION_CONFIG.intermediate.rankMovementDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`;
            });
          }
        }
        prevRectsRef.current[id] = newRect;
      }
    });
  }, [allRankings]);

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800 p-3 sm:p-5 max-w-[1440px] mx-auto w-full space-y-4 animate-in fade-in zoom-in-95 duration-500"
      style={{ animationDuration: `${LEADERBOARD_ANIMATION_CONFIG.intermediate.containerDurationMs}ms` }}
    >
      {/* LEADERBOARD TITLE HEADER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-wider text-amber-300">
            <Trophy className="w-4 h-4 fill-amber-300" />
            <span>LIVE SCOREBOARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Leaderboard Standings</h1>
          <p className="text-xs sm:text-sm font-bold text-blue-100">
            Question <strong className="text-amber-300 font-mono">{currentQNum}</strong> of{' '}
            <strong className="text-amber-300 font-mono">{totalQuestions}</strong> Complete!
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
            <span className="text-2xl font-black font-mono block text-white">{totalParticipants}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 block">Participants</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
            <span className="text-2xl font-black font-mono block text-amber-300">00:0{countdown}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 block">Next Question</span>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH LEADERBOARD TABLE (MAXIMUM PARTICIPANTS WITH STAGGERED ROW REVEAL) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/80 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3.5 px-4 text-center w-14">Rank</th>
                <th className="py-3.5 px-4">Participant Name</th>
                <th className="py-3.5 px-4 text-right">Score</th>
                <th className="py-3.5 px-4 text-center">Correct</th>
                <th className="py-3.5 px-4 text-center">Accuracy</th>
                <th className="py-3.5 px-4 text-center">Avg. Time</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allRankings.map((p, idx) => {
                const rowId = p.participantId || p.displayName || `row-${idx}`;
                const displayName = p.displayName || `Player ${idx + 1}`;
                const isCurrentUser =
                  (userParticipantId && p.participantId === userParticipantId) ||
                  (userDisplayName && displayName.toLowerCase() === userDisplayName.toLowerCase());

                const rankNum = idx + 1;
                const scoreVal = p.score !== undefined ? p.score : 0;
                const correctStr = `${p.correctAnswers || 0} / ${currentQNum}`;
                const accuracyPct = p.accuracy !== undefined ? p.accuracy : 0;
                const avgTimeSec = p.avgResponseTimeMs ? (p.avgResponseTimeMs / 1000).toFixed(1) + 's' : '-';
                const trendDelta = p.lastRankDelta !== undefined ? p.lastRankDelta : 0;

                // Row highlight & movement indicator
                let rowBgClass = 'hover:bg-slate-50 transition-colors duration-200';
                if (rankNum === 1) rowBgClass = 'bg-amber-50/80 hover:bg-amber-50 font-bold';
                else if (rankNum === 2) rowBgClass = 'bg-blue-50/60 hover:bg-blue-50 font-bold';
                else if (rankNum === 3) rowBgClass = 'bg-orange-50/60 hover:bg-orange-50 font-bold';

                if (trendDelta > 0) {
                  rowBgClass += ' ring-1 ring-emerald-400 bg-emerald-50/40';
                } else if (trendDelta < 0) {
                  rowBgClass += ' ring-1 ring-rose-300 bg-rose-50/30';
                }

                if (isCurrentUser) rowBgClass += ' ring-2 ring-blue-500';

                return (
                  <tr
                    key={rowId}
                    ref={(el) => {
                      rowRefs.current[rowId] = el;
                    }}
                    className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out ${rowBgClass}`}
                    style={{ animationDelay: `${idx * effectiveStaggerMs}ms` }}
                  >
                    {/* Rank # */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {rankNum === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs inline-flex items-center justify-center font-black shadow-xs transition-transform hover:scale-110">
                          🥇 1
                        </span>
                      ) : rankNum === 2 ? (
                        <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 text-xs inline-flex items-center justify-center font-black shadow-xs transition-transform hover:scale-110">
                          🥈 2
                        </span>
                      ) : rankNum === 3 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs inline-flex items-center justify-center font-black shadow-xs transition-transform hover:scale-110">
                          🥉 3
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-sm">#{rankNum}</span>
                      )}
                    </td>

                    {/* Name with initial avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${avatarColors[idx % avatarColors.length]}`}>
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{displayName}</span>
                          {isCurrentUser && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-md uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Score with Count-Up Animation */}
                    <td className="py-3.5 px-4 text-right font-black font-mono text-base text-slate-900">
                      <AnimatedNumber value={scoreVal} />
                    </td>

                    {/* Correct Answers */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{correctStr}</td>

                    {/* Accuracy Progress Bar with Width Transition */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="font-extrabold text-emerald-700 w-8 text-right">{accuracyPct}%</span>
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all ease-out"
                            style={{
                              width: `${accuracyPct}%`,
                              transitionDuration: `${LEADERBOARD_ANIMATION_CONFIG.intermediate.accuracyAnimationDurationMs}ms`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Avg. Time */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">{avgTimeSec}</td>

                    {/* Trend Indicator */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {trendDelta > 0 ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 animate-in zoom-in-75 duration-300">
                          <TrendingUp className="w-3 h-3" />
                          <span>▲ {trendDelta}</span>
                        </span>
                      ) : trendDelta < 0 ? (
                        <span className="inline-flex items-center space-x-1 text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 animate-in zoom-in-75 duration-300">
                          <TrendingDown className="w-3 h-3" />
                          <span>▼ {Math.abs(trendDelta)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER BAR */}
      <footer className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center space-x-2">
          <img src="/QuizArena Logo.png" alt="QuizArena" className="h-5 object-contain" />
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            Internal Training & Assessment Platform
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Play • Learn • Grow • Together</span>
          <span className="w-6 h-1 bg-amber-400 rounded-full" />
        </div>
      </footer>
    </div>
  );
};
