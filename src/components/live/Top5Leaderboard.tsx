'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Crown, TrendingUp, TrendingDown, Minus, Clock, Users, Target, Sparkles } from 'lucide-react';
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

  const firstPlace = sorted[0] || { displayName: 'Alex Thomas', score: 4820, correctAnswers: currentQNum, avgResponseTimeMs: 3200 };
  const secondPlace = sorted[1] || { displayName: 'Maria Garcia', score: 4510, correctAnswers: currentQNum, avgResponseTimeMs: 3800 };
  const thirdPlace = sorted[2] || { displayName: 'John Smith', score: 4210, correctAnswers: currentQNum, avgResponseTimeMs: 4100 };

  const totalParticipants = rankings.length || 187;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans max-w-[1400px] mx-auto w-full space-y-6">
      {/* QuizArena Championship Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-10 h-10 object-contain" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-2xl text-slate-900 tracking-tight">
                Quiz<span className="text-blue-600">Arena</span>
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">Internal Training & Assessment Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BY</span>
          <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-6 object-contain" />
        </div>
      </div>

      {/* TOP SECTION: Podium + Leaderboard Header Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 lg:p-8 text-white shadow-2xl overflow-hidden">
        {/* Background decorative lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Column: Title & Next Question Banner */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-amber-400 text-slate-950 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
              <Sparkles className="w-4 h-4 fill-current text-slate-950" />
              <span>LIVE GAME</span>
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">Leaderboard</h1>
              <p className="text-sm font-extrabold text-blue-100 mt-1">
                Question {currentQNum} of {totalQuestions} Complete!
              </p>
            </div>

            {/* Next Question Countdown Card */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center space-x-3 max-w-md">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-xs font-black text-white">Amazing effort, everyone!</p>
                <p className="text-xs font-semibold text-blue-100">
                  Next question starting in <strong className="text-amber-300 font-mono">{countdown} seconds</strong>...
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: TOP 3 PODIUM BLOCKS */}
          <div className="lg:col-span-7 flex items-end justify-center gap-3 sm:gap-6 pt-4">
            {/* 2nd Place (Silver) */}
            <div className="flex flex-col items-center space-y-2 w-28 sm:w-36 animate-in slide-in-from-bottom duration-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-900 font-black text-base flex items-center justify-center border-2 border-white shadow-lg">
                {secondPlace.displayName.charAt(0)}
              </div>
              <div className="text-center">
                <p className="text-xs font-extrabold text-white truncate max-w-[120px]">{secondPlace.displayName}</p>
                <p className="text-sm font-black text-slate-950 bg-white/90 px-2 py-0.5 rounded-full font-mono mt-0.5">
                  {(secondPlace.score || 0).toLocaleString()} <span className="text-[10px] uppercase font-bold">pts</span>
                </p>
              </div>
              <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 text-slate-800 h-28 rounded-t-2xl shadow-xl border-t-4 border-slate-300 flex flex-col items-center justify-center font-black">
                <Crown className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-2xl">2</span>
              </div>
            </div>

            {/* 1st Place (Gold - Elevated) */}
            <div className="flex flex-col items-center space-y-2 w-32 sm:w-44 -mt-8 animate-in slide-in-from-bottom duration-700">
              <div className="relative">
                <Crown className="w-7 h-7 text-amber-300 absolute -top-6 left-1/2 transform -translate-x-1/2 animate-bounce" />
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center border-4 border-white shadow-xl">
                  {firstPlace.displayName.charAt(0)}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white truncate max-w-[140px]">{firstPlace.displayName}</p>
                <p className="text-base font-black text-slate-950 bg-amber-300 px-3 py-0.5 rounded-full font-mono mt-0.5 shadow-md">
                  {(firstPlace.score || 0).toLocaleString()} <span className="text-[10px] uppercase font-bold">pts</span>
                </p>
              </div>
              <div className="w-full bg-gradient-to-t from-amber-400 to-amber-300 text-slate-950 h-36 rounded-t-2xl shadow-2xl border-t-4 border-amber-200 flex flex-col items-center justify-center font-black">
                <Trophy className="w-8 h-8 text-slate-950 mb-1" />
                <span className="text-3xl">1</span>
              </div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="flex flex-col items-center space-y-2 w-28 sm:w-36 animate-in slide-in-from-bottom duration-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-700 text-amber-100 font-black text-base flex items-center justify-center border-2 border-white shadow-lg">
                {thirdPlace.displayName.charAt(0)}
              </div>
              <div className="text-center">
                <p className="text-xs font-extrabold text-white truncate max-w-[120px]">{thirdPlace.displayName}</p>
                <p className="text-sm font-black text-slate-950 bg-white/90 px-2 py-0.5 rounded-full font-mono mt-0.5">
                  {(thirdPlace.score || 0).toLocaleString()} <span className="text-[10px] uppercase font-bold">pts</span>
                </p>
              </div>
              <div className="w-full bg-gradient-to-t from-amber-800 to-amber-700 text-amber-100 h-24 rounded-t-2xl shadow-xl border-t-4 border-amber-600 flex flex-col items-center justify-center font-black">
                <Crown className="w-5 h-5 text-amber-300 mb-1" />
                <span className="text-xl">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID: Leaderboard Table (8 cols) + Right Stats Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEADERBOARD TABLE */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>CHAMPIONSHIP RANKINGS (TOP 10)</span>
            <span>{rankings.length} Total Competitors</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3 px-4 text-center">#</th>
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
                  const isCurrentUser =
                    (userParticipantId && p.participantId === userParticipantId) ||
                    (userDisplayName && p.displayName?.toLowerCase() === userDisplayName.toLowerCase());

                  const rankNum = idx + 1;
                  const correctStr = `${p.correctAnswers || 0} / ${currentQNum}`;
                  const accuracyPct = p.accuracy !== undefined ? p.accuracy : Math.round(((p.correctAnswers || 0) / currentQNum) * 100);
                  const avgTimeSec = p.avgResponseTimeMs ? (p.avgResponseTimeMs / 1000).toFixed(1) + 's' : '3.5s';
                  const trendDelta = p.lastRankDelta || 0;

                  return (
                    <tr
                      key={p.participantId || idx}
                      className={`hover:bg-slate-50/80 transition ${
                        isCurrentUser ? 'bg-amber-50/80 font-bold border-l-4 border-l-amber-500' : ''
                      }`}
                    >
                      {/* Rank # */}
                      <td className="py-3.5 px-4 text-center font-black font-mono text-sm">
                        {rankNum === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black inline-flex items-center justify-center shadow-xs">
                            1
                          </span>
                        ) : rankNum === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black inline-flex items-center justify-center shadow-xs">
                            2
                          </span>
                        ) : rankNum === 3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black inline-flex items-center justify-center shadow-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400">#{rankNum}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center uppercase">
                            {p.displayName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm">{p.displayName}</span>
                            {isCurrentUser && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-md uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-right font-black font-mono text-sm text-slate-900">
                        {(p.score || 0).toLocaleString()}
                      </td>

                      {/* Correct */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">{correctStr}</td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-extrabold text-slate-900 w-9 text-right">{accuracyPct}%</span>
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${accuracyPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Avg. Time */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">{avgTimeSec}</td>

                      {/* Trend */}
                      <td className="py-3.5 px-4 text-center">
                        {trendDelta > 0 ? (
                          <span className="inline-flex items-center space-x-1 font-black text-emerald-600 text-xs">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>▲ {trendDelta}</span>
                          </span>
                        ) : trendDelta < 0 ? (
                          <span className="inline-flex items-center space-x-1 font-black text-rose-600 text-xs">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>▼ {Math.abs(trendDelta)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400 font-bold text-xs">
                            <Minus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR SUMMARY CARDS */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Participants */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalParticipants}</span>
              <p className="text-xs font-bold text-slate-500">Participants</p>
              <span className="inline-flex items-center space-x-1 text-[10px] font-black text-emerald-600 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Questions Completed */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {currentQNum} / {totalQuestions}
              </span>
              <p className="text-xs font-bold text-slate-500">Questions Completed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shadow-xs">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Next Question Countdown */}
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-5 rounded-3xl text-slate-950 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Next Question Starting</p>
              <p className="text-4xl font-black font-mono tracking-tight mt-1">00:0{countdown}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/10 flex items-center justify-center font-black">
              <Clock className="w-6 h-6 text-slate-950" />
            </div>
          </div>

          {/* Card 4: Slogan Ribbon */}
          <div className="bg-blue-50/80 p-5 rounded-3xl border border-blue-100 text-center space-y-1">
            <p className="text-sm font-black text-blue-900 italic">"Great minds create brighter tomorrows!"</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">QuizArena Championship</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center space-x-2">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-5 h-5 object-contain" />
          <span className="font-extrabold text-slate-700">QuizArena</span>
        </div>
        <div>Play • Learn • Grow • Together</div>
      </footer>
    </div>
  );
};
