'use client';

import React from 'react';
import { Play, Users, Radio, Sparkles, Copy, Check } from 'lucide-react';
import { ILiveParticipant } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface LiveLobbyTrainerProps {
  quizCode: string;
  quizTitle: string;
  participants: ILiveParticipant[];
  onStartGame: () => void;
}

export const LiveLobbyTrainer: React.FC<LiveLobbyTrainerProps> = ({
  quizCode,
  quizTitle,
  participants,
  onStartGame,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { showToast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopied(true);
    showToast('Quiz Code copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-10 space-y-8">
      {/* Top Banner & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            LIVE SESSION LOBBY
          </span>
        </div>
        <h1 className="text-lg font-black text-slate-800">{quizTitle}</h1>
      </div>

      {/* Main Display Box (Projector / TV View) */}
      <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 md:p-12 text-center space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">JOIN AT QUIZARENA PRO</p>
          <p className="text-xs text-slate-500 font-medium">Enter Join Code on Mobile Device:</p>
        </div>

        {/* Big Code Box */}
        <div
          onClick={handleCopyCode}
          className="inline-flex items-center space-x-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white px-10 py-6 rounded-3xl shadow-2xl shadow-blue-600/30 cursor-pointer hover:scale-[1.02] transition-transform group"
        >
          <span className="text-5xl md:text-7xl font-black tracking-widest font-mono">{quizCode}</span>
          <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition">
            {copied ? <Check className="w-6 h-6 text-emerald-300" /> : <Copy className="w-6 h-6 text-blue-100" />}
          </div>
        </div>

        {/* Participant Counter */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <Users className="w-6 h-6 text-blue-600" />
          <span className="text-2xl font-black text-slate-900">{participants.length}</span>
          <span className="text-sm font-bold text-slate-500">Players Joined</span>
        </div>

        {/* Start Game Trigger */}
        <div>
          <button
            onClick={onStartGame}
            disabled={participants.length === 0}
            className="px-10 py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-400/30 transition transform hover:scale-105 active:scale-95 flex items-center space-x-3 mx-auto"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START QUIZ NOW</span>
          </button>
          {participants.length === 0 && (
            <p className="text-xs text-slate-400 mt-2 font-medium">Waiting for players to enter code...</p>
          )}
        </div>
      </div>

      {/* Participants Avatar Wall */}
      <div className="max-w-5xl mx-auto w-full bg-white/80 p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Joined Participants ({participants.length})
        </h3>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {participants.map((p, idx) => (
            <div
              key={idx}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-in zoom-in duration-200"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{p.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
