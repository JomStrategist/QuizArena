'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, ArrowLeft, Award, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ConductScoreboardProps {
  quizTitle: string;
  rankings: any[];
  onBackToDashboard: () => void;
  sessionType?: 'LIVE_GAME' | 'CONDUCT';
}

export const ConductScoreboard: React.FC<ConductScoreboardProps> = ({
  quizTitle,
  rankings = [],
  onBackToDashboard,
  sessionType = 'CONDUCT',
}) => {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const firstPlace = rankings[0] || { displayName: 'Champion', score: 0, correctAnswers: 0, wrongAnswers: 0 };
  const secondPlace = rankings[1] || { displayName: 'Runner-up', score: 0, correctAnswers: 0, wrongAnswers: 0 };
  const thirdPlace = rankings[2] || { displayName: '3rd Place', score: 0, correctAnswers: 0, wrongAnswers: 0 };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition flex items-center space-x-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {quizTitle} • {sessionType === 'LIVE_GAME' ? 'LIVE GAME FINALE' : 'FINAL SCOREBOARD'}
        </span>
      </div>

      {/* Hero Trophy Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mx-auto border-4 border-amber-200 shadow-lg animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          {sessionType === 'LIVE_GAME' ? 'LIVE GAME FINALE' : 'QUIZ FINALE'}
        </h1>
        <p className="text-xs md:text-sm font-semibold text-slate-500 max-w-md mx-auto">
          Final performance scoreboard & student rankings for <strong className="text-slate-800">{quizTitle}</strong>
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
        {/* 2nd Place */}
        <div className="flex flex-col items-center space-y-2 w-28 sm:w-36">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm border-2 border-slate-300">
            2
          </div>
          <p className="text-xs font-bold text-slate-800 truncate w-full text-center">{secondPlace.displayName}</p>
          <p className="text-[11px] font-black text-blue-600">{secondPlace.score} pts</p>
          <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 h-28 rounded-t-2xl shadow-md border-t border-slate-300 flex items-center justify-center">
            <span className="text-xl font-black text-slate-500">2nd</span>
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
          <p className="text-sm font-black text-slate-900 truncate w-full text-center">{firstPlace.displayName}</p>
          <p className="text-xs font-black text-amber-600">{firstPlace.score} pts</p>
          <div className="w-full bg-gradient-to-t from-amber-400 to-amber-300 h-40 rounded-t-2xl shadow-xl border-t-2 border-amber-200 flex items-center justify-center">
            <span className="text-2xl font-black text-slate-950">1st</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center space-y-2 w-28 sm:w-36">
          <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-sm border-2 border-amber-800">
            3
          </div>
          <p className="text-xs font-bold text-slate-800 truncate w-full text-center">{thirdPlace.displayName}</p>
          <p className="text-[11px] font-black text-amber-700">{thirdPlace.score} pts</p>
          <div className="w-full bg-gradient-to-t from-amber-700/30 to-amber-700/20 h-20 rounded-t-2xl shadow-md border-t border-amber-300 flex items-center justify-center">
            <span className="text-xl font-black text-amber-800">3rd</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Leaderboard Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Session Leaderboard</h3>

        {rankings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No responses recorded for this session.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Total Score</th>
                  <th className="py-2.5 px-3">Correct</th>
                  <th className="py-2.5 px-3">Wrong</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((r: any, idx: number) => {
                  const correct = r.correctAnswers || 0;
                  const wrong = r.wrongAnswers || 0;
                  const total = correct + wrong;
                  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition font-semibold text-slate-800">
                      <td className="py-3 px-3 font-mono font-black text-blue-600">#{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{r.displayName}</td>
                      <td className="py-3 px-3 font-black text-slate-900">{r.score || 0} pts</td>
                      <td className="py-3 px-3 text-emerald-600 font-bold">{correct}</td>
                      <td className="py-3 px-3 text-rose-500 font-bold">{wrong}</td>
                      <td className="py-3 px-3 font-bold text-slate-700">{acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
