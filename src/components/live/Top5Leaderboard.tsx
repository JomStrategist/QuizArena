'use client';

import React from 'react';
import { Trophy, Medal, Award, Sparkles, User, Loader2 } from 'lucide-react';
import { ILiveParticipant } from '@/types';

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
  // Sort participants by score descending
  const sorted = [...rankings].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top5 = sorted.slice(0, 5);

  // Find current user position if outside top 5
  const userRankIndex = sorted.findIndex(
    (p) =>
      (userParticipantId && p.participantId === userParticipantId) ||
      (userDisplayName && p.displayName?.toLowerCase() === userDisplayName.toLowerCase())
  );
  const userParticipant = userRankIndex >= 0 ? sorted[userRankIndex] : null;
  const isUserInTop5 = userRankIndex >= 0 && userRankIndex < 5;

  const currentQNum = (currentQuestionIndex || 0) + 1;

  const rankBadgeIcons = [
    <Trophy key="1" className="w-5 h-5 text-amber-950 fill-current" />,
    <Medal key="2" className="w-5 h-5 text-slate-700 fill-current" />,
    <Award key="3" className="w-5 h-5 text-amber-700 fill-current" />,
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full space-y-6 font-sans animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <span className="px-3.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-current text-amber-600 animate-spin" />
            <span>TOP 5 LEADERBOARD</span>
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Scores After Question {currentQNum} of {totalQuestions}
        </h1>

        <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Next question starting in 5 seconds...</span>
        </div>
      </div>

      {/* Top 5 Rankings Cards */}
      <div className="space-y-3 flex-1">
        {top5.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-bold">
            No participant scores recorded yet.
          </div>
        ) : (
          top5.map((p, idx) => {
            const isCurrentUser =
              (userParticipantId && p.participantId === userParticipantId) ||
              (userDisplayName && p.displayName?.toLowerCase() === userDisplayName.toLowerCase());

            // Styling per rank
            let rowStyle = 'bg-white border-slate-200 text-slate-900';
            let rankBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

            if (idx === 0) {
              rowStyle = 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20';
              rankBadgeStyle = 'bg-slate-950 text-amber-400 border-amber-400';
            } else if (idx === 1) {
              rowStyle = 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 border-slate-300 text-slate-900 shadow-md';
              rankBadgeStyle = 'bg-slate-800 text-slate-100 border-slate-400';
            } else if (idx === 2) {
              rowStyle = 'bg-gradient-to-r from-amber-100/90 via-orange-100/90 to-amber-100/90 border-amber-300 text-amber-950 shadow-sm';
              rankBadgeStyle = 'bg-amber-800 text-amber-100 border-amber-600';
            }

            return (
              <div
                key={p.participantId || p.displayName || idx}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-transform duration-200 ${rowStyle} ${
                  isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm shadow-2xs ${rankBadgeStyle}`}
                  >
                    {idx < 3 ? rankBadgeIcons[idx] : `#${idx + 1}`}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm leading-tight">{p.displayName}</span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    {p.lastPointsEarned !== undefined && p.lastPointsEarned > 0 && (
                      <p className="text-[11px] font-bold opacity-80 mt-0.5">
                        +{p.lastPointsEarned} pts on last question
                      </p>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-lg font-black font-mono tracking-tight">
                    {(p.score || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">PTS</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Out-of-Top-5 Student Card */}
      {userParticipant && !isUserInTop5 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-900 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              #{userRankIndex + 1}
            </div>
            <div>
              <p className="text-xs font-black">Your Current Position</p>
              <p className="text-[11px] text-blue-700 font-semibold">{userParticipant.displayName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black font-mono">{(userParticipant.score || 0).toLocaleString()}</span>
            <span className="text-[10px] font-bold uppercase block text-blue-600">PTS</span>
          </div>
        </div>
      )}

      <footer className="py-2 text-center text-[11px] text-slate-400 font-medium">
        QuizArena by KVJ Analytics
      </footer>
    </div>
  );
};
