'use client';

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Trophy,
  Flame,
  Zap,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  ArrowUpRight,
  Crown,
} from 'lucide-react';
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
  isTrainer?: boolean;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onNextQuestion?: () => void;
  timerDurationSec?: number;
}

export type LeaderboardAnimPhase =
  | 'PREVIOUS_SCOREBOARD' // Step 1: Show initial scores before points added (0 - 1.2s)
  | 'COUNTING_POINTS' // Step 2: Animated points count-up (+pts) (1.2s - 2.7s)
  | 'REORDERING_RANKS' // Step 3: FLIP row re-sorting / position changing (2.7s - 3.9s)
  | 'EMOJI_REVEAL' // Step 4: Cartoon emoji reveal & sunglasses drop animation (3.9s - 4.9s)
  | 'POST_ANIMATION_COUNTDOWN'; // Step 5: 5-Second Countdown Timer for Next Question (4.9s - 9.9s)

/**
 * Cartoon Developer Avatar Smiley Component
 * Features Cartoon Sunglasses Drop Animation for Rank 1:
 * Displays face WITHOUT sunglasses first (😃), then sunglasses (🕶️) slide down onto face and transform into 😎!
 */
const CartoonSmileyAvatar: React.FC<{
  rankNum: number;
  trendDelta: number;
  isEmojiPhase: boolean;
}> = ({ rankNum, trendDelta, isEmojiPhase }) => {
  const [glassesLanded, setGlassesLanded] = useState<boolean>(false);

  useEffect(() => {
    if (isEmojiPhase && rankNum === 1) {
      // 250ms cartoon delay: User sees face without sunglasses first, then sunglasses drop!
      const timer = setTimeout(() => {
        setGlassesLanded(true);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setGlassesLanded(false);
    }
  }, [isEmojiPhase, rankNum]);

  if (!isEmojiPhase) return null;

  // Rank 1: Cartoon Sunglasses Drop Animation (Without Sunglasses -> Glasses Drop -> 😎)
  if (rankNum === 1) {
    return (
      <div className="relative inline-flex items-center justify-center">
        {/* Base Smiley */}
        <span className="text-sm select-none filter drop-shadow-xs transition-all duration-300">
          {glassesLanded ? '😎' : '😃'}
        </span>

        {/* Cartoon Sunglasses Drop Effect */}
        {!glassesLanded && (
          <span
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-sm select-none animate-in slide-in-from-top-6 fade-in duration-500 transform -rotate-12 z-20"
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            🕶️
          </span>
        )}

        {/* Sparkle burst when sunglasses snap onto face */}
        {glassesLanded && (
          <span className="absolute -top-2 -right-2 text-[10px] animate-ping select-none">
            ✨
          </span>
        )}
      </div>
    );
  }

  // Rank 2: Star-Eyed Runner Up with Rotating Sparkle Stars
  if (rankNum === 2) {
    return (
      <div className="relative inline-flex items-center justify-center animate-in zoom-in-75 duration-300">
        <span className="text-sm select-none filter drop-shadow-xs">🤩</span>
        <span className="absolute -top-1 -right-1 text-[9px] animate-spin">✨</span>
      </div>
    );
  }

  // Rank 3: Party Horn Podium Contender
  if (rankNum === 3) {
    return (
      <div className="relative inline-flex items-center justify-center animate-in zoom-in-75 duration-300">
        <span className="text-sm select-none filter drop-shadow-xs">🥳</span>
        <span className="absolute -top-1 -right-1 text-[9px] animate-bounce">🎉</span>
      </div>
    );
  }

  // Rank Climber: Grinning Climber with Lightning Bolt
  if (trendDelta > 0) {
    return (
      <div className="relative inline-flex items-center justify-center animate-in zoom-in-75 duration-300">
        <span className="text-sm select-none filter drop-shadow-xs">😁</span>
        <span className="absolute -top-1 -right-1 text-[9px] animate-bounce">⚡</span>
      </div>
    );
  }

  // Default Comeback Monocle Smiley
  return (
    <span className="text-sm select-none filter drop-shadow-xs animate-in zoom-in-75 duration-300">
      🧐
    </span>
  );
};

/**
 * Animated Number Counter for smooth score transition (e.g. 100 -> 183)
 */
const AnimatedNumber: React.FC<{ value: number; fromValue?: number; durationMs?: number }> = ({
  value,
  fromValue,
  durationMs = LEADERBOARD_ANIMATION_CONFIG.intermediate.scoreAnimationDurationMs,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(fromValue !== undefined ? fromValue : value);
  const prevValueRef = useRef<number>(fromValue !== undefined ? fromValue : value);

  useEffect(() => {
    const startValue = fromValue !== undefined ? fromValue : prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

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
  }, [value, fromValue, durationMs]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export const Top5Leaderboard: React.FC<Top5LeaderboardProps> = ({
  rankings = [],
  currentQuestionIndex,
  totalQuestions,
  userDisplayName = '',
  userParticipantId = '',
  sessionType = 'LIVE_GAME',
  isTrainer = false,
  isPaused = false,
  onTogglePause,
  onNextQuestion,
  timerDurationSec = 3,
}) => {
  const [animPhase, setAnimPhase] = useState<LeaderboardAnimPhase>('PREVIOUS_SCOREBOARD');
  const [nextQCountdown, setNextQCountdown] = useState<number>(
    timerDurationSec || LEADERBOARD_ANIMATION_CONFIG.intermediate.postAnimationCountdownSec || 3
  );
  const hasTriggeredNextRef = useRef<boolean>(false);

  // Play leaderboard audio reveal sound on mount
  useEffect(() => {
    if (LEADERBOARD_ANIMATION_CONFIG.audio.enabled) {
      soundManager.playLeaderboardSound();
    }
  }, []);

  // Multi-phase animation timeline sequence
  useEffect(() => {
    const p1Time = LEADERBOARD_ANIMATION_CONFIG.intermediate.previousScoreboardPhaseMs || 2000;
    const p2Time = LEADERBOARD_ANIMATION_CONFIG.intermediate.countingPointsPhaseMs || 2000;
    const p3Time = LEADERBOARD_ANIMATION_CONFIG.intermediate.reorderingPhaseMs || 2000;
    const p4Time = LEADERBOARD_ANIMATION_CONFIG.intermediate.emojiRevealPhaseMs || 1500;

    // Step 1 -> Step 2: Start Counting Points
    const timer1 = setTimeout(() => {
      setAnimPhase('COUNTING_POINTS');
    }, p1Time);

    // Step 2 -> Step 3: Reorder Row Positions
    const timer2 = setTimeout(() => {
      setAnimPhase('REORDERING_RANKS');
    }, p1Time + p2Time);

    // Step 3 -> Step 4: Reveal Emojis & Sunglasses Drop
    const timer3 = setTimeout(() => {
      setAnimPhase('EMOJI_REVEAL');
    }, p1Time + p2Time + p3Time);

    // Step 4 -> Step 5: Start 5-Second Countdown Timer AFTER initial animations complete
    const timer4 = setTimeout(() => {
      setAnimPhase('POST_ANIMATION_COUNTDOWN');
    }, p1Time + p2Time + p3Time + p4Time);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Phase 5: 5-Second Countdown Timer to Next Question (Runs strictly during POST_ANIMATION_COUNTDOWN)
  useEffect(() => {
    if (animPhase !== 'POST_ANIMATION_COUNTDOWN') return;
    if (isPaused) return; // Pause countdown timer when trainer clicks pause

    const interval = setInterval(() => {
      setNextQCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTriggeredNextRef.current) {
            hasTriggeredNextRef.current = true;
            if (onNextQuestion) {
              onNextQuestion();
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [animPhase, isPaused, onNextQuestion]);

  // Compute previous scores & earnings for each participant
  const processedParticipants = rankings.map((p) => {
    const lastEarned = p.lastPointsEarned !== undefined ? p.lastPointsEarned : 0;
    const prevScore = Math.max(0, (p.score || 0) - lastEarned);
    return {
      ...p,
      prevScore,
      newScore: p.score || 0,
      lastEarned,
    };
  });

  // Sort lists for Previous vs New Scoreboard states
  const sortedByPrevScore = [...processedParticipants].sort((a, b) => b.prevScore - a.prevScore);
  const sortedByNewScore = [...processedParticipants].sort((a, b) => b.newScore - a.newScore);

  // Select active list based on animation phase
  const activeRankings =
    animPhase === 'PREVIOUS_SCOREBOARD' || animPhase === 'COUNTING_POINTS'
      ? sortedByPrevScore
      : sortedByNewScore;

  const currentQNum = (currentQuestionIndex || 0) + 1;
  const totalParticipants = rankings.length;

  // Identify Highest Climber (maximum positive lastRankDelta > 0)
  let highestClimberId: string | null = null;
  let maxRankClimb = 0;
  sortedByNewScore.forEach((p) => {
    const delta = p.lastRankDelta || 0;
    if (delta > maxRankClimb) {
      maxRankClimb = delta;
      highestClimberId = p.participantId || p.displayName;
    }
  });

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

  // FLIP (First, Last, Invert, Play) Layout Animation Hook for Position Reordering (Upward Only)
  useLayoutEffect(() => {
    activeRankings.forEach((p) => {
      const id = p.participantId || p.displayName;
      const el = rowRefs.current[id];
      if (el) {
        const newRect = el.getBoundingClientRect();
        const prevRect = prevRectsRef.current[id];
        if (prevRect && (animPhase === 'REORDERING_RANKS' || animPhase === 'EMOJI_REVEAL' || animPhase === 'POST_ANIMATION_COUNTDOWN')) {
          const deltaY = prevRect.top - newRect.top;
          
          // ONLY animate if row is moving UPWARDS towards the top of the table (deltaY > 0)
          if (deltaY > 0) {
            // First & Last -> Invert
            el.style.transform = `translateY(${deltaY}px)`;
            el.style.transition = 'transform 0s';

            // Play smooth transition upwards to final position based on rank
            requestAnimationFrame(() => {
              el.style.transform = 'translateY(0px)';
              el.style.transition = `transform ${LEADERBOARD_ANIMATION_CONFIG.intermediate.rankMovementDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`;
            });

            // Lock position fixed in place once transition finishes
            const handleTransitionEnd = (e: TransitionEvent) => {
              if (e.propertyName === 'transform') {
                el.style.transform = '';
                el.style.transition = '';
                el.removeEventListener('transitionend', handleTransitionEnd);
              }
            };
            el.addEventListener('transitionend', handleTransitionEnd);
          } else {
            // Non-climbing rows reset instantly without downward sliding animation
            el.style.transform = '';
            el.style.transition = '';
          }
        }
        prevRectsRef.current[id] = newRect;
      }
    });
  }, [activeRankings, animPhase]);

  return (
    <div
      className="max-w-6xl mx-auto w-full space-y-4 py-4 px-3 sm:px-6 font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-500"
      style={{ animationDuration: `${LEADERBOARD_ANIMATION_CONFIG.intermediate.containerDurationMs}ms` }}
    >
      {/* LEADERBOARD TITLE HEADER WITH MULTI-STEP ANIMATION PHASE BADGE */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 sm:p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        <div className="space-y-1.5">
          {/* Phase Badge Indicator */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-wider border border-white/20">
            {animPhase === 'PREVIOUS_SCOREBOARD' ? (
              <span className="text-amber-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>PHASE 1: PREVIOUS STANDINGS (2s)</span>
              </span>
            ) : animPhase === 'COUNTING_POINTS' ? (
              <span className="text-emerald-300 flex items-center space-x-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PHASE 2: ADDING POINTS (+PTS) (2s)</span>
              </span>
            ) : animPhase === 'REORDERING_RANKS' ? (
              <span className="text-purple-300 flex items-center space-x-1.5 animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>PHASE 3: REORDERING POSITIONS (2s)</span>
              </span>
            ) : animPhase === 'EMOJI_REVEAL' ? (
              <span className="text-amber-300 flex items-center space-x-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>PHASE 4: LEADERBOARD REVEAL (1.5s)</span>
              </span>
            ) : (
              <span className="text-emerald-300 flex items-center space-x-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>NEXT QUESTION IN {nextQCountdown}s (5s)</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center space-x-3">
            <span>
              {animPhase === 'PREVIOUS_SCOREBOARD'
                ? 'Previous Scoreboard'
                : animPhase === 'COUNTING_POINTS'
                ? 'Calculating Scores...'
                : animPhase === 'REORDERING_RANKS'
                ? 'Updating Standings!'
                : animPhase === 'EMOJI_REVEAL'
                ? 'Leaderboard Standings'
                : 'Get Ready for Next Question!'}
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-bold text-blue-100">
            Question <strong className="text-amber-300 font-mono">{currentQNum}</strong> of{' '}
            <strong className="text-amber-300 font-mono">{totalQuestions}</strong> Complete!
          </p>
        </div>

        {/* Right Section: Stats, Timer & Trainer Pause/Next Controls */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Total Participants Badge */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center min-w-[90px]">
            <span className="text-xl sm:text-2xl font-black font-mono block text-white">{totalParticipants}</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-200 block">Participants</span>
          </div>

          {/* Countdown Timer Badge */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center min-w-[120px] relative">
            <span className={`text-xl sm:text-2xl font-black font-mono block ${isPaused ? 'text-amber-400 animate-pulse' : 'text-amber-300'}`}>
              {animPhase === 'POST_ANIMATION_COUNTDOWN' ? `00:0${nextQCountdown}` : 'UPDATING'}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-200 block">
              {isPaused ? 'PAUSED' : animPhase === 'POST_ANIMATION_COUNTDOWN' ? 'NEXT QUESTION IN' : 'LEADERBOARD'}
            </span>
          </div>

          {/* Trainer Interactive Controls (Pause/Resume & Next Question) */}
          {(isTrainer || onTogglePause || onNextQuestion) && (
            <div className="flex items-center space-x-2 pl-2 border-l border-white/20">
              {onTogglePause && (
                <button
                  type="button"
                  onClick={onTogglePause}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shadow-sm border ${
                    isPaused
                      ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 animate-pulse scale-[1.03]'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                  }`}
                  title={isPaused ? 'Resume Leaderboard Timer' : 'Pause Leaderboard Timer'}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}

              {onNextQuestion && (
                <button
                  type="button"
                  onClick={onNextQuestion}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                  title="Immediately advance to next question"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                  <span>Next Question</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULL-WIDTH LEADERBOARD TABLE WITH CARTOON SUNGLASSES & BADGES REVEAL */}
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
              {activeRankings.map((p, idx) => {
                const rowId = p.participantId || p.displayName || `row-${idx}`;
                const displayName = p.displayName || `Player ${idx + 1}`;
                const isCurrentUser =
                  (userParticipantId && p.participantId === userParticipantId) ||
                  (userDisplayName && displayName.toLowerCase() === userDisplayName.toLowerCase());

                const rankNum = idx + 1;

                // Points & Score determinations by phase
                const isPrevPhase = animPhase === 'PREVIOUS_SCOREBOARD';
                const isCountingPhase = animPhase === 'COUNTING_POINTS';
                const isReorderingPhase = animPhase === 'REORDERING_RANKS';
                const isEmojiPhase = animPhase === 'EMOJI_REVEAL' || animPhase === 'POST_ANIMATION_COUNTDOWN';

                const correctStr = `${p.correctAnswers || 0} / ${currentQNum}`;
                const accuracyPct = p.accuracy !== undefined ? p.accuracy : 0;
                const avgTimeSec = p.avgResponseTimeMs ? (p.avgResponseTimeMs / 1000).toFixed(1) + 's' : '-';
                const trendDelta = p.lastRankDelta !== undefined ? p.lastRankDelta : 0;

                const isHighestClimber =
                  highestClimberId &&
                  (p.participantId === highestClimberId || p.displayName === highestClimberId) &&
                  trendDelta > 0;

                const isNewRankOneLeader = rankNum === 1 && trendDelta > 0;
                const streakCount = p.correctAnswers !== undefined && p.correctAnswers >= 2 ? p.correctAnswers : 0;

                // Row highlight classes
                let rowBgClass = 'hover:bg-slate-50 transition-all duration-300';
                if (isEmojiPhase) {
                  if (isNewRankOneLeader) {
                    rowBgClass =
                      'bg-gradient-to-r from-amber-200/90 via-amber-100/80 to-amber-50/50 ring-4 ring-amber-400 shadow-xl shadow-amber-400/30 font-bold';
                  } else if (rankNum === 1) {
                    rowBgClass =
                      'bg-gradient-to-r from-amber-100/90 via-amber-50/70 to-slate-50 ring-2 ring-amber-400/80 shadow-md shadow-amber-400/10 font-bold';
                  } else if (isHighestClimber) {
                    rowBgClass =
                      'bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-amber-50/40 ring-2 ring-emerald-400 shadow-md shadow-emerald-400/20 font-bold';
                  } else if (trendDelta > 0) {
                    rowBgClass =
                      'bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50 ring-2 ring-emerald-400/80 shadow-sm shadow-emerald-500/10 font-bold';
                  } else if (rankNum === 2) {
                    rowBgClass = 'bg-blue-50/60 hover:bg-blue-50 font-bold';
                  } else if (rankNum === 3) {
                    rowBgClass = 'bg-orange-50/60 hover:bg-orange-50 font-bold';
                  }
                } else if (isReorderingPhase) {
                  rowBgClass += ' bg-indigo-50/40 shadow-sm';
                }

                if (isCurrentUser) rowBgClass += ' ring-2 ring-blue-500';

                return (
                  <tr
                    key={rowId}
                    ref={(el) => {
                      rowRefs.current[rowId] = el;
                    }}
                    className={`transition-colors duration-300 ${rowBgClass}`}
                  >
                    {/* Rank # with Gold / Silver / Bronze Badge */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {rankNum === 1 ? (
                        <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs inline-flex items-center justify-center font-black shadow-md border border-amber-300 transition-transform hover:scale-110">
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

                    {/* Name with Avatar & Cartoon Sunglasses Drop Animation */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        {/* Avatar Container with Cartoon Sunglasses Animation Overlay */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-md transition-transform hover:scale-105 ${
                              avatarColors[idx % avatarColors.length]
                            }`}
                          >
                            {displayName.charAt(0)}
                          </div>

                          {/* Cartoon Sunglasses Drop & Smiley Overlay (Phase 4 & 5) */}
                          <div className="absolute -bottom-1 -right-1">
                            <CartoonSmileyAvatar
                              rankNum={rankNum}
                              trendDelta={trendDelta}
                              isEmojiPhase={isEmojiPhase}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{displayName}</span>

                          {/* YOU Badge */}
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-md uppercase tracking-wider">
                              YOU
                            </span>
                          )}

                          {/* Phase 4 & 5 Cartoon Badges */}
                          {isEmojiPhase && (
                            <>
                              {/* New Rank 1 Leader Animated Callout Badge */}
                              {isNewRankOneLeader && (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 font-black text-[10px] rounded-full shadow-md animate-bounce border border-amber-300">
                                  <span className="text-xs">😎✨</span>
                                  <span>NEW RANK 1 LEADER!</span>
                                </span>
                              )}

                              {/* Kahoot Highest Climber Badge */}
                              {!isNewRankOneLeader && isHighestClimber && (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-full text-[10px] font-black shadow-xs animate-bounce border border-amber-300">
                                  <Zap className="w-3 h-3 fill-slate-950" />
                                  <span>Highest Climber (+{trendDelta})</span>
                                </span>
                              )}

                              {/* Kahoot Rank Up Badge (for non-highest climbers) */}
                              {!isNewRankOneLeader && !isHighestClimber && trendDelta >= 2 && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black shadow-xs animate-pulse">
                                  <TrendingUp className="w-3 h-3 stroke-[3]" />
                                  <span>+{trendDelta} Ranks</span>
                                </span>
                              )}

                              {/* Kahoot Streak Badge */}
                              {streakCount >= 2 && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-[10px] font-black shadow-xs">
                                  <Flame className="w-3 h-3 fill-amber-200" />
                                  <span>{streakCount} Streak!</span>
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Score with Count-Up Animation & Green +PTS Pill */}
                    <td className="py-3.5 px-4 text-right font-black font-mono text-base text-slate-900">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Animated Points Added Badge (+X pts) in Phase 2 & 3 */}
                        {(isCountingPhase || isReorderingPhase) && p.lastEarned > 0 && (
                          <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 bg-emerald-500 text-white text-xs font-black rounded-lg shadow-sm animate-bounce">
                            <span>+</span>
                            <span>{p.lastEarned}</span>
                          </span>
                        )}

                        {/* Animated Score Number */}
                        {isPrevPhase ? (
                          <span>{p.prevScore.toLocaleString()}</span>
                        ) : isCountingPhase ? (
                          <AnimatedNumber value={p.newScore} fromValue={p.prevScore} />
                        ) : (
                          <span>{p.newScore.toLocaleString()}</span>
                        )}
                      </div>
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

                    {/* Trend Indicator with Matching Smileys (Revealed in Phase 4) */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {isEmojiPhase ? (
                        trendDelta > 0 ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 text-xs font-black bg-emerald-100/90 px-2.5 py-1 rounded-xl border border-emerald-300/80 shadow-xs animate-in zoom-in-90 duration-300">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 animate-bounce stroke-[3]" />
                            <span>▲ {trendDelta}</span>
                            <span className="text-xs ml-0.5">😁</span>
                          </span>
                        ) : trendDelta < 0 ? (
                          <span className="inline-flex items-center space-x-1 text-rose-700 text-xs font-black bg-rose-100/90 px-2.5 py-1 rounded-xl border border-rose-300/80 shadow-xs animate-in zoom-in-90 duration-300">
                            <TrendingDown className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                            <span>▼ {Math.abs(trendDelta)}</span>
                            <span className="text-xs ml-0.5">🧐</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">-</span>
                        )
                      ) : (
                        <span className="text-slate-300 font-mono text-xs">-</span>
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
          <img src="/QuizArena Icon.png" alt="QuizArena" className="h-5 object-contain" />
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
