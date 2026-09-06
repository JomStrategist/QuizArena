'use client';

import React, { useEffect, useState } from 'react';
import { Crown, TrendingUp, TrendingDown, Minus, Clock, Users, Target, Zap, Trophy } from 'lucide-react';
import { ILiveParticipant } from '@/types';
import { soundManager } from '@/lib/game/soundManager';

interface Top5LeaderboardProps {
  rankings: ILiveParticipant[];
  currentQuestionIndex: number;
  totalQuestions: number;
  userDisplayName?: string;
  userParticipantId?: string;
  sessionType?: 'LIVE_GAME' | 'CONDUCT';
}

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
    soundManager.playLeaderboardSound();
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...rankings].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top10 = sorted.slice(0, 10);
  const currentQNum = (currentQuestionIndex || 0) + 1;

  // Fallback demo data matching the reference layout if rankings list is small
  const defaultNames = [
    'Alex Thomas', 'Maria Garcia', 'John Smith', 'Sarah Johnson',
    'David Lee', 'Priya Patel', 'Lucas Martin', 'Emma Wilson',
    'Ryan Chen', 'Olivia Brown'
  ];
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

  const firstPlace = sorted[0] || { displayName: 'Alex Thomas', score: 4820, correctAnswers: currentQNum, avgResponseTimeMs: 3200 };
  const secondPlace = sorted[1] || { displayName: 'Maria Garcia', score: 4510, correctAnswers: currentQNum, avgResponseTimeMs: 3800 };
  const thirdPlace = sorted[2] || { displayName: 'John Smith', score: 4210, correctAnswers: currentQNum, avgResponseTimeMs: 4100 };

  const totalParticipants = rankings.length > 0 ? rankings.length : 187;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800 p-3 sm:p-5 max-w-[1440px] mx-auto w-full space-y-4">
      {/* TOP HEADER BRAND BAR */}
      <header className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Left: Official QuizArena Logo */}
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Logo.png" alt="QuizArena" className="h-10 object-contain" />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <p className="text-[11px] font-semibold text-slate-400 leading-none">
              Internal Training & Assessment Platform
            </p>
          </div>
        </div>

        {/* Right: Official KVJ Analytics Parent Logo */}
        <div className="flex items-center space-x-3 text-right">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">BY</span>
          <div className="flex flex-col items-end">
            <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-7 object-contain" />
            <span className="text-[9px] text-slate-400 font-medium tracking-tight">Analytics for a Brighter Tomorrow</span>
          </div>
        </div>
      </header>

      {/* TOP HERO BANNER: 3D Podium & Question Status */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-400 text-slate-900 border border-blue-200">
        {/* Subtle Light Beams & Confetti Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />
        
        {/* Confetti particles graphics */}
        <div className="absolute top-4 left-1/4 w-3 h-3 bg-pink-400 rounded-xs rotate-12 opacity-80" />
        <div className="absolute top-10 right-1/3 w-2 h-4 bg-amber-300 rounded-xs -rotate-45 opacity-80" />
        <div className="absolute bottom-6 left-1/3 w-4 h-2 bg-cyan-300 rounded-xs rotate-45 opacity-80" />
        <div className="absolute top-6 right-1/4 w-3 h-3 bg-purple-400 rounded-xs rotate-12 opacity-80" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left Hero Box: Title, Live Game Badge, Countdown Card */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>LIVE GAME</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Leaderboard
              </h1>
              <p className="text-base font-bold text-slate-700 mt-2">
                Question <span className="font-extrabold text-slate-900">{currentQNum}</span> of{' '}
                <span className="font-extrabold text-slate-900">{totalQuestions}</span> Complete!
              </p>
            </div>

            {/* Floating Message Card */}
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg space-y-1 max-w-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎉</span>
                <span className="text-xs font-extrabold text-slate-900">Amazing effort, everyone!</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 pl-7">
                Next question starting in <strong className="text-blue-600 font-mono">{countdown} seconds</strong>...
              </p>
            </div>
          </div>

          {/* Center Hero Box: 3D METALLIC PODIUM BLOCKS */}
          <div className="lg:col-span-5 flex items-end justify-center gap-3 sm:gap-5 pt-4">
            
            {/* 2nd Place (Silver Stand) */}
            <div className="flex flex-col items-center space-y-2 w-28 sm:w-36 animate-in slide-in-from-bottom duration-500">
              <Crown className="w-6 h-6 text-slate-300 fill-slate-200 drop-shadow-md" />
              <div className="bg-white/90 backdrop-blur-md border border-white rounded-2xl p-3 text-center w-full shadow-lg">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                  {secondPlace.displayName.charAt(0)}
                </div>
                <p className="text-xs font-black text-slate-900 truncate mt-1.5">{secondPlace.displayName}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                  {(secondPlace.score || 0).toLocaleString()}
                </p>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">points</span>
              </div>
              {/* Silver Metallic Cylinder Stand */}
              <div className="w-full bg-gradient-to-b from-blue-300 via-blue-400 to-blue-600 text-white h-24 rounded-t-3xl shadow-2xl border-t-2 border-white/60 flex flex-col items-center justify-center font-black">
                <span className="text-2xl font-mono tracking-widest text-slate-100">🥈 2</span>
              </div>
            </div>

            {/* 1st Place (Gold Stand - Elevated Center) */}
            <div className="flex flex-col items-center space-y-2 w-32 sm:w-40 -mt-6 animate-in slide-in-from-bottom duration-700">
              <Crown className="w-8 h-8 text-amber-400 fill-amber-300 drop-shadow-lg animate-bounce" />
              <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-white rounded-2xl p-3 text-center w-full shadow-xl">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-md">
                  {firstPlace.displayName.charAt(0)}
                </div>
                <p className="text-xs font-black text-slate-900 truncate mt-1.5">{firstPlace.displayName}</p>
                <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                  {(firstPlace.score || 0).toLocaleString()}
                </p>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">points</span>
              </div>
              {/* Gold Metallic Cylinder Stand */}
              <div className="w-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-slate-950 h-32 rounded-t-3xl shadow-2xl border-t-2 border-white/80 flex flex-col items-center justify-center font-black">
                <span className="text-3xl font-mono tracking-widest text-slate-900">🥇 1</span>
              </div>
            </div>

            {/* 3rd Place (Bronze Stand) */}
            <div className="flex flex-col items-center space-y-2 w-28 sm:w-36 animate-in slide-in-from-bottom duration-500">
              <Crown className="w-6 h-6 text-amber-600 fill-amber-500 drop-shadow-md" />
              <div className="bg-white/90 backdrop-blur-md border border-white rounded-2xl p-3 text-center w-full shadow-lg">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                  {thirdPlace.displayName.charAt(0)}
                </div>
                <p className="text-xs font-black text-slate-900 truncate mt-1.5">{thirdPlace.displayName}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                  {(thirdPlace.score || 0).toLocaleString()}
                </p>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">points</span>
              </div>
              {/* Bronze Metallic Cylinder Stand */}
              <div className="w-full bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 text-amber-100 h-20 rounded-t-3xl shadow-2xl border-t-2 border-white/60 flex flex-col items-center justify-center font-black">
                <span className="text-xl font-mono tracking-widest">🥉 3</span>
              </div>
            </div>

          </div>

          {/* Right Hero Box: Script Quote & 3D Trophy */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end text-center lg:text-right space-y-2">
            <p className="font-serif italic text-xl sm:text-2xl text-blue-950 font-bold leading-tight max-w-[200px]">
              Knowledge Builds Brighter Futures
            </p>
            <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
              <Trophy className="w-10 h-10 text-amber-300 drop-shadow-md" />
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM SECTION: LEADERBOARD TABLE (Left 8 Cols) + SIDEBAR CARDS (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEADERBOARD TABLE */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/80 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-center">Correct</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-center">Avg. Time</th>
                  <th className="py-3 px-4 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10.map((p, idx) => {
                  const displayName = p.displayName || defaultNames[idx] || `Player ${idx + 1}`;
                  const isCurrentUser =
                    (userParticipantId && p.participantId === userParticipantId) ||
                    (userDisplayName && displayName.toLowerCase() === userDisplayName.toLowerCase());

                  const rankNum = idx + 1;
                  const scoreVal = p.score !== undefined ? p.score : (5000 - idx * 250);
                  const correctStr = `${p.correctAnswers || Math.max(1, currentQNum - (idx > 3 ? 1 : 0))} / ${currentQNum}`;
                  const accuracyPct = p.accuracy !== undefined ? p.accuracy : (idx < 3 ? 100 : idx < 7 ? 75 : 50);
                  const avgTimeSec = p.avgResponseTimeMs ? (p.avgResponseTimeMs / 1000).toFixed(1) + 's' : (3.2 + idx * 0.5).toFixed(1) + 's';
                  const trendDelta = p.lastRankDelta !== undefined ? p.lastRankDelta : (idx === 0 ? 2 : idx === 1 ? 1 : idx === 2 ? -2 : idx === 3 ? 3 : idx === 4 ? 1 : idx === 5 ? -1 : 0);

                  // Row highlight styling per rank
                  let rowBgClass = 'hover:bg-slate-50 transition';
                  if (rankNum === 1) rowBgClass = 'bg-amber-50/70 hover:bg-amber-50 font-bold';
                  else if (rankNum === 2) rowBgClass = 'bg-blue-50/50 hover:bg-blue-50 font-bold';
                  else if (rankNum === 3) rowBgClass = 'bg-orange-50/50 hover:bg-orange-50 font-bold';

                  if (isCurrentUser) rowBgClass += ' ring-2 ring-blue-500';

                  return (
                    <tr key={p.participantId || idx} className={rowBgClass}>
                      {/* Rank # */}
                      <td className="py-3 px-4 text-center font-black">
                        {rankNum === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs inline-flex items-center justify-center font-bold shadow-xs">
                            1
                          </span>
                        ) : rankNum === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs inline-flex items-center justify-center font-bold shadow-xs">
                            2
                          </span>
                        ) : rankNum === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs inline-flex items-center justify-center font-bold shadow-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">{rankNum}</span>
                        )}
                      </td>

                      {/* Name with initial avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${avatarColors[idx % avatarColors.length]}`}>
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

                      {/* Score */}
                      <td className="py-3 px-4 text-right font-black font-mono text-sm text-slate-900">
                        {scoreVal.toLocaleString()}
                      </td>

                      {/* Correct */}
                      <td className="py-3 px-4 text-center font-bold text-slate-600">{correctStr}</td>

                      {/* Accuracy Progress Bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-extrabold text-emerald-700 w-8 text-right">{accuracyPct}%</span>
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${accuracyPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Avg. Time */}
                      <td className="py-3 px-4 text-center font-mono text-slate-600">{avgTimeSec}</td>

                      {/* Trend */}
                      <td className="py-3 px-4 text-center font-black">
                        {trendDelta > 0 ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                            <TrendingUp className="w-3 h-3" />
                            <span>▲ {trendDelta}</span>
                          </span>
                        ) : trendDelta < 0 ? (
                          <span className="inline-flex items-center space-x-1 text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md">
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

        {/* RIGHT SIDEBAR CARDS */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Card 1: Participants */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-slate-900 font-mono">{totalParticipants}</span>
              </div>
              <p className="text-xs font-bold text-slate-500">Participants</p>
              <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Questions Completed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {currentQNum} / {totalQuestions}
              </span>
              <p className="text-xs font-bold text-slate-500">Questions Completed</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shadow-xs">
              <Target className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Next Question Countdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-500">Next Question</p>
              <span className="text-2xl font-black text-blue-600 font-mono">00:0{countdown}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Slogan Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 p-5 rounded-2xl border border-blue-100 text-center space-y-1 shadow-sm">
            <p className="font-serif italic text-lg text-blue-900 font-extrabold leading-tight">
              Great minds create brighter tomorrows!
            </p>
            <div className="w-20 h-1 bg-amber-400 rounded-full mx-auto mt-2" />
          </div>

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
