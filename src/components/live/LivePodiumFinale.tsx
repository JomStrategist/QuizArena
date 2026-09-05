'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Crown, ArrowLeft } from 'lucide-react';
import { ILiveParticipant } from '@/types';

interface LivePodiumFinaleProps {
  quizTitle: string;
  rankings: ILiveParticipant[];
  onBackToDashboard: () => void;
}

export const LivePodiumFinale: React.FC<LivePodiumFinaleProps> = ({
  quizTitle,
  rankings,
  onBackToDashboard,
}) => {
  useEffect(() => {
    // Fire celebratory confetti cannons
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const firstPlace = rankings[0] || { displayName: 'Champion', score: 0 };
  const secondPlace = rankings[1] || { displayName: 'Runner-up', score: 0 };
  const thirdPlace = rankings[2] || { displayName: '3rd Place', score: 0 };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition flex items-center space-x-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quizTitle} FINALE</span>
      </div>

      {/* Podium Display */}
      <div className="max-w-3xl mx-auto w-full space-y-8 text-center">
        <div className="space-y-2">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce-light" />
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">QUIZARENA CHAMPION</h1>
          <p className="text-sm font-semibold text-slate-500">Live Game Finale & Rankings</p>
        </div>

        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-8 pb-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center space-y-2 w-28 sm:w-36">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm border-2 border-slate-300">
              2
            </div>
            <p className="text-xs font-bold text-slate-800 truncate w-full">{secondPlace.displayName}</p>
            <p className="text-[11px] font-black text-blue-600">{secondPlace.score} pts</p>
            <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 h-32 rounded-t-2xl shadow-md border-t border-slate-300 flex items-center justify-center">
              <span className="text-2xl font-black text-slate-500">2nd</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center space-y-2 w-32 sm:w-44 -mt-6">
            <div className="relative">
              <Crown className="w-6 h-6 text-amber-500 absolute -top-5 left-1/2 transform -translate-x-1/2 animate-pulse" />
              <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg border-4 border-amber-300 shadow-lg">
                1
              </div>
            </div>
            <p className="text-sm font-black text-slate-900 truncate w-full">{firstPlace.displayName}</p>
            <p className="text-xs font-black text-amber-600">{firstPlace.score} pts</p>
            <div className="w-full bg-gradient-to-t from-amber-400 to-amber-300 h-44 rounded-t-2xl shadow-xl border-t-2 border-amber-200 flex items-center justify-center">
              <span className="text-3xl font-black text-slate-950">1st</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center space-y-2 w-28 sm:w-36">
            <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-sm border-2 border-amber-800">
              3
            </div>
            <p className="text-xs font-bold text-slate-800 truncate w-full">{thirdPlace.displayName}</p>
            <p className="text-[11px] font-black text-amber-700">{thirdPlace.score} pts</p>
            <div className="w-full bg-gradient-to-t from-amber-700/30 to-amber-700/20 h-24 rounded-t-2xl shadow-md border-t border-amber-300 flex items-center justify-center">
              <span className="text-2xl font-black text-amber-800">3rd</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-2xl mx-auto w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Leaderboard</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {rankings.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="font-mono font-black text-slate-400 w-5">#{i + 1}</span>
                <span className="font-bold text-slate-900">{r.displayName}</span>
              </div>
              <span className="font-black text-blue-600">{r.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
