'use client';

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Play,
  Maximize2,
  BookOpen,
  Heart,
  Clock,
  QrCode,
  X,
} from 'lucide-react';
import { QRCodeImage } from '@/lib/game/qrGenerator';
import { FullScreenQRModal } from '../common/FullScreenQRModal';
import { useToast } from '../ui/ToastNotification';

interface LiveLobbyTrainerProps {
  quizCode: string;
  quizTitle: string;
  sessionType?: string;
  participants: any[];
  onStartGame: () => void;
  onClose?: () => void;
}

export const LiveLobbyTrainer: React.FC<LiveLobbyTrainerProps> = ({
  quizCode,
  quizTitle,
  sessionType = 'CONDUCT',
  participants = [],
  onStartGame,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullScreenQROpen, setIsFullScreenQROpen] = useState(false);
  const { showToast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopied(true);
    showToast('Session Join Code copied!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarColors = [
    'bg-blue-600 text-white',
    'bg-purple-600 text-white',
    'bg-emerald-600 text-white',
    'bg-pink-600 text-white',
    'bg-indigo-600 text-white',
    'bg-amber-500 text-white',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-6xl mx-auto w-full font-sans text-slate-900 space-y-6">
      
      {/* Full Screen QR Modal */}
      <FullScreenQRModal
        isOpen={isFullScreenQROpen}
        onClose={() => setIsFullScreenQROpen(false)}
        title={quizTitle}
        code={quizCode}
        subtitle="Join Live Session"
      />

      {/* Top Banner Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-10 h-10 object-contain" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-slate-900">QuizArena</span>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                LIVE LOBBY
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
              {quizTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>5 Questions</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl">
                <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>Prompt Engineering</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 bg-slate-100 text-slate-600 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Created at 10:24 AM</span>
              </span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition hover:bg-slate-100 self-start md:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main 2-Column Grid (SCAN TO JOIN + JOIN CODE & START) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: SCAN TO JOIN QR Card (6 cols) */}
        <div className="md:col-span-6 bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center justify-center space-x-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>SCAN TO JOIN</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold">Point camera to enter live session</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner">
            <QRCodeImage value={`https://quizarena.app/quiz/join?code=${quizCode}`} size={200} />
          </div>

          <button
            onClick={() => setIsFullScreenQROpen(true)}
            className="w-full py-3 bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-2 shadow-2xs"
          >
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span>Full Screen QR & Code</span>
          </button>
        </div>

        {/* Right Column: Game Join Code & Start Quiz (6 cols) */}
        <div className="md:col-span-6 bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {/* Game Join Code Box */}
            <div className="bg-blue-50/60 border border-blue-200/80 p-6 rounded-3xl text-center relative space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                Game Join Code
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-5xl font-black font-mono tracking-widest text-blue-600">
                  {quizCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                  title="Copy Join Code"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Participants Count Badge */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center space-x-3 text-slate-700">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Participants</p>
                  <p className="text-[11px] text-slate-500 font-medium">Waiting for more players...</p>
                </div>
              </div>
              <span className="text-3xl font-black text-slate-900 font-mono">
                {participants.length || 3}
              </span>
            </div>
          </div>

          {/* Big Orange/Amber Start Quiz Button */}
          <button
            onClick={onStartGame}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-base rounded-2xl transition shadow-xl shadow-orange-500/20 flex items-center justify-center space-x-2 active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Quiz Now</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Joined Participants Avatars */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Joined Participants ({participants.length || 3})</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(participants.length > 0
            ? participants
            : [
                { displayName: 'Ajay' },
                { displayName: 'Maria' },
                { displayName: 'Rahul' },
              ]
          ).map((p, idx) => {
            const letter = p.displayName?.charAt(0).toUpperCase() || 'A';
            const style = avatarColors[idx % avatarColors.length];

            return (
              <div
                key={idx}
                className="flex items-center space-x-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 shadow-2xs"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${style}`}>
                  {letter}
                </span>
                <span>{p.displayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
