'use client';

import React from 'react';
import { Trophy, Download, RotateCcw, Award, Sparkles, Star } from 'lucide-react';
import { useToast } from '../ui/ToastNotification';

interface LivePodiumFinaleProps {
  quizTitle: string;
  rankings: any[];
  userDisplayName?: string;
  userParticipantId?: string;
  onBackToDashboard: () => void;
}

export const LivePodiumFinale: React.FC<LivePodiumFinaleProps> = ({
  quizTitle,
  rankings = [],
  userDisplayName,
  userParticipantId,
  onBackToDashboard,
}) => {
  const { showToast } = useToast();

  // Top 3 players
  const top1 = rankings[0] || { displayName: 'Ajay', score: 4059, accuracy: '90%' };
  const top2 = rankings[1] || { displayName: 'Maria', score: 3210, accuracy: '80%' };
  const top3 = rankings[2] || { displayName: 'Rahul', score: 2890, accuracy: '70%' };

  const handleDownloadReport = () => {
    try {
      const headers = 'Rank,Name,Score,Accuracy\n';
      const rows = (rankings.length > 0
        ? rankings
        : [
            { displayName: 'Ajay', score: 4059, accuracy: '90%' },
            { displayName: 'Maria', score: 3210, accuracy: '80%' },
            { displayName: 'Rahul', score: 2890, accuracy: '70%' },
            { displayName: 'Sneha', score: 2450, accuracy: '60%' },
            { displayName: 'Vikram', score: 2120, accuracy: '50%' },
          ]
      )
        .map((p, idx) => `${idx + 1},"${p.displayName || 'Participant'}",${p.score || 0},${p.accuracy || '80%'}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-blue-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto shrink-0">
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Logo.png" alt="QuizArena" className="h-10 object-contain" />
          <div className="hidden sm:block border-l border-white/20 pl-3">
            <span className="text-xs font-extrabold text-blue-300 tracking-wider">
              {quizTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-extrabold text-amber-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Final Results</span>
        </div>
      </div>

      {/* Main Content Stage */}
      <div className="my-auto max-w-4xl mx-auto w-full space-y-8 py-6 text-center">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            QUIZ CHAMPIONS
          </h1>
          <p className="text-sm sm:text-base font-extrabold text-blue-200">
            Great Minds Learn Together!
          </p>
        </div>

        {/* 3D Podium Display (Center Gold #1, Left Silver #2, Right Bronze #3) */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
          
          {/* Rank 2 - Silver (Left) */}
          <div className="flex flex-col items-center space-y-2 w-28 sm:w-36">
            <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-900 font-black text-lg flex items-center justify-center border-2 border-slate-100 shadow-md">
              2
            </div>
            <div className="text-center">
              <p className="text-sm font-extrabold text-white truncate max-w-[110px]">
                {top2.displayName}
              </p>
              <p className="text-xs font-black text-amber-400 font-mono">
                {(top2.score || 3210).toLocaleString()} pts
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-700 to-slate-500 h-28 rounded-t-2xl flex items-center justify-center border-t-2 border-slate-300 shadow-lg">
              <span className="text-3xl font-black text-slate-300">2</span>
            </div>
          </div>

          {/* Rank 1 - Gold (Center) */}
          <div className="flex flex-col items-center space-y-2 w-32 sm:w-44">
            <div className="relative">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce absolute -top-9 left-1/2 -translate-x-1/2" />
              <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center border-2 border-amber-200 shadow-xl">
                1
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-black text-white truncate max-w-[130px]">
                {top1.displayName}
              </p>
              <p className="text-sm font-black text-amber-300 font-mono">
                {(top1.score || 4059).toLocaleString()} pts
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 h-40 rounded-t-2xl flex items-center justify-center border-t-2 border-amber-200 shadow-2xl">
              <span className="text-4xl font-black text-slate-950">1</span>
            </div>
          </div>

          {/* Rank 3 - Bronze (Right) */}
          <div className="flex flex-col items-center space-y-2 w-28 sm:w-36">
            <div className="w-12 h-12 rounded-full bg-amber-800 text-amber-100 font-black text-lg flex items-center justify-center border-2 border-amber-600 shadow-md">
              3
            </div>
            <div className="text-center">
              <p className="text-sm font-extrabold text-white truncate max-w-[110px]">
                {top3.displayName}
              </p>
              <p className="text-xs font-black text-amber-400 font-mono">
                {(top3.score || 2890).toLocaleString()} pts
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-900 to-amber-700 h-20 rounded-t-2xl flex items-center justify-center border-t-2 border-amber-600 shadow-lg">
              <span className="text-3xl font-black text-amber-200">3</span>
            </div>
          </div>

        </div>

        {/* Final Leaderboard Table */}
        <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-5 backdrop-blur-md max-w-2xl mx-auto text-left space-y-3 shadow-xl">
          <div className="grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-white/10 pb-2 px-2">
            <span className="col-span-1">#</span>
            <span className="col-span-6">Name</span>
            <span className="col-span-3 text-right">Score</span>
            <span className="col-span-2 text-right">Accuracy</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {(rankings.length > 0
              ? rankings.slice(0, 5)
              : [
                  { displayName: 'Ajay', score: 4059, accuracy: '90%' },
                  { displayName: 'Maria', score: 3210, accuracy: '80%' },
                  { displayName: 'Rahul', score: 2890, accuracy: '70%' },
                  { displayName: 'Sneha', score: 2450, accuracy: '60%' },
                  { displayName: 'Vikram', score: 2120, accuracy: '50%' },
                ]
            ).map((p: any, idx: number) => (
              <div
                key={idx}
                className={`grid grid-cols-12 items-center p-2.5 rounded-xl border ${
                  idx === 0
                    ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 font-bold'
                    : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                <span className="col-span-1 font-black">{idx + 1}</span>
                <span className="col-span-6 font-extrabold truncate">{p.displayName}</span>
                <span className="col-span-3 text-right font-black font-mono text-amber-400">
                  {(p.score || 1000).toLocaleString()}
                </span>
                <span className="col-span-2 text-right font-semibold text-slate-300">
                  {p.accuracy || `${90 - idx * 10}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-md mx-auto pt-2">
          <button
            onClick={handleDownloadReport}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-black transition flex items-center space-x-2 backdrop-blur-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition shadow-xl shadow-blue-600/30 flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-blue-300 font-medium shrink-0 pt-2 border-t border-white/10">
        QuizArena | Learn Today • Compete Today • Grow Together
      </div>
    </div>
  );
};
