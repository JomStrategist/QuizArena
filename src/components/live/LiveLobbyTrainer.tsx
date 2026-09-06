'use client';

import React, { useEffect, useState } from 'react';
import {
  Play,
  Users,
  Copy,
  Check,
  Radio,
  Sparkles,
  QrCode,
  Maximize2,
  KeyRound,
  Link as LinkIcon,
  Clock,
  ShieldCheck,
  Zap,
  BookOpen,
  Trophy,
  Gamepad2,
  CheckCircle2,
  FileText,
  Tag,
  Smartphone,
} from 'lucide-react';
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
  category?: string;
  questionCount?: number;
}

export const LiveLobbyTrainer: React.FC<LiveLobbyTrainerProps> = ({
  quizCode,
  quizTitle,
  sessionType = 'LIVE_GAME',
  participants,
  onStartGame,
  category = 'Prompt Engineering',
  questionCount = 5,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
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
    setCopiedCode(true);
    showToast('Game Join Code copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    showToast('Join Link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const participantCount = participants.length;

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between p-4 sm:p-8 md:p-10 space-y-8 font-sans text-slate-900">
      
      {/* Full Screen Projector View Modal */}
      <FullScreenQRModal
        isOpen={isFullScreenQROpen}
        onClose={() => setIsFullScreenQROpen(false)}
        title={quizTitle}
        code={quizCode}
        subtitle={sessionType === 'CONDUCT' ? 'Join Our Conduct Session' : 'Join Our Live Game'}
        customUrl={joinUrl}
      />

      {/* TOP HERO SECTION & ARTWORK BANNER */}
      <div className="max-w-6xl mx-auto w-full relative">
        
        {/* Left Decorative Floating Text */}
        <div className="hidden xl:flex flex-col items-center absolute -left-28 top-10 space-y-2 pointer-events-none opacity-80">
          <p className="font-serif italic font-black text-blue-600 text-sm -rotate-12 tracking-wide">
            Play<br />Learn<br />Compete<br />Grow
          </p>
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-6">
            <Gamepad2 className="w-8 h-8" />
          </div>
        </div>

        {/* Right Decorative Floating Text & Sticky Notes */}
        <div className="hidden xl:flex flex-col items-end absolute -right-32 top-6 space-y-3 pointer-events-none">
          <p className="font-serif italic font-black text-blue-600 text-sm rotate-6 tracking-wide text-right">
            Same Questions<br />Bigger Minds!
          </p>
          
          {/* Yellow Sticky Note Badge */}
          <div className="bg-amber-100 border border-amber-200/90 text-amber-900 p-3 rounded-2xl shadow-md rotate-3 text-[11px] font-bold space-y-1 w-32">
            <p className="flex items-center space-x-1"><Check className="w-3.5 h-3.5 text-amber-600" /> <span>Engage</span></p>
            <p className="flex items-center space-x-1"><Check className="w-3.5 h-3.5 text-amber-600" /> <span>Compete</span></p>
            <p className="flex items-center space-x-1"><Check className="w-3.5 h-3.5 text-amber-600" /> <span>Learn</span></p>
            <p className="flex items-center space-x-1"><Check className="w-3.5 h-3.5 text-amber-600" /> <span>Grow Together</span></p>
          </div>
        </div>

        {/* HERO TITLE HEADER */}
        <div className="text-center space-y-3 pt-2 pb-4">
          
          {/* Live Lobby Purple Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-600/20">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>LIVE GAME LOBBY</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Get Ready to Play!
          </h1>

          {/* Subtitle / Quiz Title */}
          <p className="text-lg sm:text-xl font-extrabold text-blue-700 max-w-2xl mx-auto">
            {quizTitle}
          </p>

          {/* Sub-info Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-1">
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{questionCount} Questions</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>{category}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Live Quiz Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER MAIN 2-COLUMN DISPLAY CARDS */}
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* LEFT COLUMN: SCAN QR CODE CARD */}
          <div className="bg-slate-50/80 p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col justify-between text-center space-y-6">
            
            {/* Header */}
            <div className="flex items-start space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Scan QR Code to Join</h3>
                <p className="text-xs text-slate-500 font-medium">Open camera or QR scanner on your device</p>
              </div>
            </div>

            {/* Giant QR Code Display with Center Logo */}
            <div
              onClick={() => setIsFullScreenQROpen(true)}
              className="cursor-pointer group relative p-4 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition my-auto mx-auto max-w-[260px] flex items-center justify-center"
              title="Click to expand Full Screen Projector View"
            >
              <QRCodeImage value={joinUrl || `https://quizarena.app/quiz/join?code=${quizCode}`} size={210} />
              
              <div className="absolute inset-0 bg-blue-950/0 group-hover:bg-blue-950/10 rounded-3xl transition flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg transition transform scale-95 group-hover:scale-100 flex items-center space-x-2">
                  <Maximize2 className="w-4 h-4" />
                  <span>Full Screen Projector</span>
                </span>
              </div>
            </div>

            {/* Bottom Instruction Pill */}
            <button
              onClick={() => setIsFullScreenQROpen(true)}
              className="w-full py-3 bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 border border-blue-200/90 rounded-2xl text-xs font-black transition flex items-center justify-center space-x-2 shadow-2xs"
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Scan this QR code with your device to join</span>
            </button>
          </div>

          {/* RIGHT COLUMN: JOIN USING GAME CODE CARD */}
          <div className="bg-slate-50/80 p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6">
            
            {/* Header */}
            <div className="flex items-start space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Join Using Game Code</h3>
                <p className="text-xs text-slate-500 font-medium">Enter this code in the app or at quizarena.com/join</p>
              </div>
            </div>

            {/* GIANT GAME JOIN CODE GRADIENT BOX */}
            <div
              onClick={handleCopyCode}
              title="Click to copy game code"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-600/20 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform group"
            >
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-200 block">GAME JOIN CODE</span>
                <span className="text-5xl sm:text-6xl font-black tracking-widest font-mono text-white block mt-1">
                  {quizCode}
                </span>
              </div>
              
              <div className="p-3.5 bg-white/15 rounded-2xl group-hover:bg-white/25 transition backdrop-blur-md">
                {copiedCode ? <Check className="w-6 h-6 text-emerald-300" /> : <Copy className="w-6 h-6 text-white" />}
              </div>
            </div>

            {/* Divider Line: OR */}
            <div className="flex items-center space-x-3 my-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Join via Link Input Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Join via Link</span>
              </label>

              <div className="bg-white border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs">
                <span className="text-xs font-mono font-extrabold text-blue-700 truncate pl-2 mr-2">
                  {joinUrl || `https://quizarena.com/join/${quizCode}`}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl transition shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2 METRIC CARDS GRID */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Metric 1: Participants Joined */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center space-x-3 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-tight font-mono">{participantCount}</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">
                    Participants Joined<br />
                    <span className="text-slate-400 font-medium">Waiting for students...</span>
                  </p>
                </div>
              </div>

              {/* Metric 2: Game Status */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center space-x-3 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-black">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">--:--</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">
                    Game Not Started<br />
                    <span className="text-slate-400 font-medium">Click start when ready</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM 3 FEATURE PILLARS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/80 rounded-3xl border border-slate-200/90 text-xs">
          
          <div className="flex items-center space-x-3 p-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-black text-slate-900">No Login Required</h5>
              <p className="text-[11px] text-slate-500 font-medium">Students can join using the code or QR.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 border-t md:border-t-0 md:border-l border-slate-200/90">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h5 className="font-black text-slate-900">Real-Time Participation</h5>
              <p className="text-[11px] text-slate-500 font-medium">See students join live.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 border-t md:border-t-0 md:border-l border-slate-200/90">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-black text-slate-900">Safe & Secure</h5>
              <p className="text-[11px] text-slate-500 font-medium">Only invited participants can join.</p>
            </div>
          </div>

        </div>

        {/* PRIMARY ACTION LAUNCHER BUTTON */}
        <div className="text-center space-y-3 pt-2">
          <button
            onClick={onStartGame}
            disabled={participantCount === 0}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/30 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-3 mx-auto uppercase tracking-wider"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Quiz Now</span>
          </button>
          
          <p className="text-xs text-slate-500 font-medium">
            Once you start, participants will be able to join and the quiz will begin.
          </p>
        </div>

      </div>

      {/* PARTICIPANTS LIVE AVATAR WALL */}
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


