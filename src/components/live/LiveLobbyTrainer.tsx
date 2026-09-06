'use client';

import React, { useEffect, useState } from 'react';
import { Play, Users, Copy, Check, Radio, Sparkles, QrCode, Maximize2 } from 'lucide-react';
import { ILiveParticipant } from '@/types';
import { useToast } from '../ui/ToastNotification';
import { QRCodeImage } from '@/lib/game/qrGenerator';
import { FullScreenQRModal } from '../common/FullScreenQRModal';

interface LiveLobbyTrainerProps {
  quizCode: string;
  quizTitle: string;
  sessionType?: 'LIVE_GAME' | 'CONDUCT';
  participants: ILiveParticipant[];
  onStartGame: () => void;
}

export const LiveLobbyTrainer: React.FC<LiveLobbyTrainerProps> = ({
  quizCode,
  quizTitle,
  sessionType = 'LIVE_GAME',
  participants,
  onStartGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [isFullScreenQROpen, setIsFullScreenQROpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/quiz/join?code=${quizCode}`);
    }
  }, [quizCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopied(true);
    showToast('Quiz Code copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const participantCount = participants.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-10 space-y-8 font-sans">
      {/* Full Screen Projector View Modal */}
      <FullScreenQRModal
        isOpen={isFullScreenQROpen}
        onClose={() => setIsFullScreenQROpen(false)}
        title={quizTitle}
        code={quizCode}
        subtitle={sessionType === 'CONDUCT' ? 'Join Our Conduct Session' : 'Join Our Live Game'}
        customUrl={joinUrl}
      />

      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <a href="/" className="flex items-center space-x-2">
            <img src="/QuizArena Icon.png" alt="QuizArena Logo" className="w-9 h-9 object-contain" />
            <span className="font-black text-2xl tracking-tight text-slate-900">
              Quiz<span className="text-blue-600">Arena</span>
            </span>
          </a>
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>LIVE GAME LOBBY</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <h2 className="text-base font-extrabold text-slate-800 hidden md:block">{quizTitle}</h2>

          <button
            onClick={() => setIsFullScreenQROpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center space-x-2 shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Projector View (Full Screen)</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-400">BY</span>
            <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-5 object-contain" />
          </div>
        </div>
      </div>

      {/* Main Projector Center Display Grid */}
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column: Large QR Code */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 text-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>SCAN TO JOIN</span>
              </div>
              <button
                onClick={() => setIsFullScreenQROpen(true)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Expand Full Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => setIsFullScreenQROpen(true)}
              className="cursor-pointer group relative p-2 bg-white rounded-2xl shadow-xs hover:shadow-md transition"
              title="Click for full screen view"
            >
              <QRCodeImage value={joinUrl || `https://quizarena.app/quiz/join?code=${quizCode}`} size={210} />
              <div className="absolute inset-0 bg-blue-950/0 group-hover:bg-blue-950/10 rounded-2xl transition flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg transition transform scale-95 group-hover:scale-100 flex items-center space-x-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsFullScreenQROpen(true)}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 shadow-2xs"
            >
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Full Screen QR & Code</span>
            </button>
          </div>

          {/* Right Column: 6-Digit Join Code & Launcher */}
          <div className="flex flex-col items-center md:items-start space-y-6 text-center md:text-left">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                OR ENTER CODE ON MOBILE
              </span>
              <p className="text-xs font-bold text-slate-600">No student login or app download required</p>
            </div>

            {/* Huge 6-Digit Code Badge */}
            <div
              onClick={handleCopyCode}
              title="Click to copy join code"
              className="w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-600/25 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform group"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-200 block">GAME JOIN CODE</span>
                <span className="text-5xl lg:text-6xl font-black tracking-widest font-mono">{quizCode}</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition">
                {copied ? <Check className="w-6 h-6 text-emerald-300" /> : <Copy className="w-6 h-6 text-blue-100" />}
              </div>
            </div>

            {/* Live Participant Count */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">LOBBY PARTICIPANTS</p>
                  <p className="text-xs text-slate-500 font-medium">Ready for real-time training</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 font-mono">{participantCount}</span>
                <span className="text-xs font-bold text-slate-500 ml-1">PLAYERS</span>
              </div>
            </div>

            {/* Start Quiz Launcher Button */}
            <div className="w-full">
              <button
                onClick={onStartGame}
                disabled={participantCount === 0}
                className="w-full py-5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 disabled:opacity-50 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-400/30 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-3 uppercase tracking-wider"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>START QUIZ NOW</span>
              </button>
              {participantCount === 0 && (
                <p className="text-xs text-slate-400 text-center mt-2 font-semibold">
                  Waiting for students to join using code or QR...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Participants Avatar Wall */}
      <div className="max-w-5xl mx-auto w-full bg-white/90 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Joined Participants ({participantCount})</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">Live updating</span>
        </div>

        <div className="flex flex-wrap gap-2.5 max-h-44 overflow-y-auto pt-1">
          {participants.length === 0 ? (
            <div className="w-full py-8 text-center text-slate-400 text-xs font-semibold">
              No students joined yet. Share code <strong className="text-slate-700">{quizCode}</strong> or scan QR code.
            </div>
          ) : (
            participants.map((p, idx) => (
              <div
                key={p.participantId || idx}
                className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-blue-300 text-slate-900 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-transform animate-in zoom-in-50 duration-300 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] uppercase">
                  {p.displayName.charAt(0)}
                </div>
                <span>{p.displayName}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

