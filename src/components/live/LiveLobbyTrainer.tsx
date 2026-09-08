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
    <div className="min-h-[88vh] bg-slate-50 p-2 sm:p-4 w-full max-w-[99%] mx-auto font-sans text-slate-900 space-y-6 flex flex-col justify-between">
      
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
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {quizTitle}
          </h1>
        </div>

        {/* Center: Game Join Code Card */}
        <div className="bg-slate-950 text-white px-6 py-2 rounded-2xl border border-slate-800 shadow-md flex items-center space-x-4 self-center md:self-auto">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              GAME CODE
            </p>
            <p className="text-2xl md:text-3xl font-black font-mono tracking-widest text-amber-400">
              {quizCode}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
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
        <div className="md:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center justify-center space-x-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>SCAN TO JOIN</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold">Point phone camera to enter live session instantly</p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner my-2">
            <QRCodeImage value={joinUrl || `/quiz/join?code=${quizCode}`} size={260} />
          </div>

          {/* Copy URL / Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-4 bg-blue-100/70 hover:bg-blue-200/80 text-blue-600 border border-blue-200 rounded-2xl text-sm font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-black">URL Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-blue-600" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Game Join Code & Start Quiz (6 cols) */}
        <div className="md:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          
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

              <div className="flex flex-wrap items-center gap-2.5 max-h-[180px] overflow-y-auto p-1">
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

          <button
            onClick={onStartGame}
            className="w-full py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-lg rounded-2xl transition shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-3 active:scale-98"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START QUIZ NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
