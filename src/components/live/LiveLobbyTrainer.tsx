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
import { soundManager } from '@/lib/game/soundManager';

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
  const [joinUrl, setJoinUrl] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    soundManager.setAudioState('LOBBY');
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/quiz/join?code=${quizCode}`);
    }
  }, [quizCode]);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const url = joinUrl || `${window.location.origin}/quiz/join?code=${quizCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Session URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
    <div className="min-h-[88vh] bg-slate-50 p-2 sm:p-4 w-full font-sans text-slate-900 space-y-6 flex flex-col justify-between">
      
      {/* Full Screen QR Modal — triggers native browser fullscreen */}
      <FullScreenQRModal
        isOpen={isFullScreenQROpen}
        onClose={() => setIsFullScreenQROpen(false)}
        title={quizTitle}
        code={quizCode}
        subtitle="Scan to Join Conduct Quiz Session"
        customUrl={joinUrl}
      />

      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {quizTitle}
          </h1>
        </div>

        {/* Center: Game Join Code Card (Fills Center Space) */}
        <div className="flex-1 max-w-xl mx-auto md:mx-6 bg-rose-50/60 border-2 border-rose-300 px-8 py-3 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-600 whitespace-nowrap hidden sm:inline">
              GAME CODE
            </span>
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono tracking-[0.2em] text-rose-600">
              {quizCode}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="p-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-100/80 rounded-xl transition cursor-pointer flex items-center"
            title="Copy URL"
          >
            {copiedLink ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-rose-600" />}
          </button>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-y-2">
          {/* Scoreboard Visibility Live Toggle Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                const nextVis = (sessionType === 'TRAINER_ONLY' ? 'EVERYONE' : 'TRAINER_ONLY');
                const res = await fetch('/api/v1/live-sessions/update-settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ quizCode, scoreboardVisibility: nextVis }),
                });
                const json = await res.json();
                if (json.success) {
                  showToast(
                    `Scoreboard visibility: ${nextVis === 'EVERYONE' ? 'Show to Everyone 👥' : 'Trainer Screen Only 🔒'}`,
                    'info'
                  );
                }
              } catch (e) {
                showToast('Error toggling scoreboard visibility.', 'error');
              }
            }}
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-2xl text-xs font-black transition flex items-center space-x-1.5 shadow-2xs"
            title="Choose whether the scoreboard is shown to everyone or trainer screen only"
          >
            <span>👥 Scoreboard: Show to Everyone</span>
          </button>

          {/* Start Quiz Button */}
          <button
            onClick={onStartGame}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-300 rounded-2xl text-xs font-black transition flex items-center space-x-2 shadow-xs cursor-pointer active:scale-95"
            title="Start Quiz Now"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Quiz</span>
          </button>

          {/* Prominent Close/Exit Button */}
          <button
            onClick={onClose ? onClose : () => { window.location.href = '/trainer/dashboard'; }}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 shadow-xs cursor-pointer"
            title="Close & Exit Lobby"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close Lobby</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid (SCAN TO JOIN + JOIN CODE & START) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Left Column: SCAN TO JOIN QR Card (6 cols) */}
        <div className="md:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">

          <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner my-auto flex items-center justify-center">
            <QRCodeImage value={joinUrl || `/quiz/join?code=${quizCode}`} size={380} />
          </div>
        </div>

        {/* Right Column: Joined Players (6 cols) */}
        <div className="md:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-start space-y-6">
          
          <div className="space-y-6">

            {/* Participants Count Badge */}
            <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-3xl">
              <div className="flex items-center space-x-4 text-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-900">LOBBY PARTICIPANTS</p>
                  <p className="text-xs text-slate-500 font-semibold">Updating in real-time...</p>
                </div>
              </div>
              <span className="text-4xl font-black text-slate-900 font-mono">
                {participants.length}
              </span>
            </div>

            {/* Joined Participants Avatars */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Joined Players ({participants.length})</span>
              </p>

              <div className="flex flex-wrap items-center gap-2.5 max-h-[320px] overflow-y-auto p-1">
                {participants.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3">No participants yet. Waiting for players to join using 6-digit code or QR code...</p>
                ) : (
                  participants.map((p, idx) => {
                    const name = typeof p === 'string' ? p : p?.displayName || p?.name || `Player ${idx + 1}`;
                    const letter = name.charAt(0).toUpperCase();
                    const style = avatarColors[idx % avatarColors.length];

                    return (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 shadow-2xs animate-in zoom-in-95 duration-150"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${style}`}>
                          {letter}
                        </span>
                        <span>{name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
