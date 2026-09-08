'use client';

import React, { useEffect, useState } from 'react';
import { Users, Crown, Zap, X, QrCode, Sparkles } from 'lucide-react';
import { QuestionRenderer } from '../common/QuestionRenderer';
import { QRCodeImage } from '@/lib/game/qrGenerator';

interface ProjectorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizCode: string;
  quizTitle?: string;
  currentQuestion?: any;
  currentIdx?: number;
  totalQuestions?: number;
  timeLeft?: number;
  totalTime?: number;
  totalParticipants?: number;
  stage?: string;
  participants?: any[];
}

export const ProjectorViewModal: React.FC<ProjectorViewModalProps> = ({
  isOpen,
  onClose,
  quizCode,
  quizTitle = 'Activity 4: Prompt Engineering Challenge',
  currentQuestion,
  currentIdx = 1,
  totalQuestions = 5,
  timeLeft = 30,
  totalTime = 20,
  totalParticipants = 0,
  stage = 'LOBBY',
  participants = [],
}) => {
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/quiz/join?code=${quizCode}`);
    }
  }, [quizCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLobby = stage === 'LOBBY' || (!currentQuestion && stage !== 'QUESTION_ACTIVE');
  const count = participants.length || totalParticipants || 0;

  const avatarColors = [
    'bg-blue-600 text-white',
    'bg-purple-600 text-white',
    'bg-emerald-600 text-white',
    'bg-pink-600 text-white',
    'bg-indigo-600 text-white',
    'bg-amber-500 text-white',
  ];

  // SVG Circular progress for timer
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const timePercent = Math.max(0, Math.min(1, timeLeft / Math.max(1, totalTime)));
  const strokeDashoffset = circumference * (1 - timePercent);

  const progressPercent = Math.min(
    100,
    Math.round((currentIdx / Math.max(1, totalQuestions)) * 100)
  );

  const renderQuestionText = (text: string) => {
    return text || '';
  };

  const optionColors = [
    { bg: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/40 text-white', circleBg: 'bg-emerald-700/80 text-white', letter: 'A' },
    { bg: 'bg-blue-600 hover:bg-blue-500 border-blue-400/40 text-white', circleBg: 'bg-blue-700/80 text-white', letter: 'B' },
    { bg: 'bg-amber-500 hover:bg-amber-400 border-amber-300/40 text-slate-950', circleBg: 'bg-amber-600/80 text-white', letter: 'C' },
    { bg: 'bg-pink-600 hover:bg-pink-500 border-pink-400/40 text-white', circleBg: 'bg-pink-700/80 text-white', letter: 'D' },
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-[96%] mx-auto shrink-0">
        {/* Left Branding */}
        <div className="flex items-center space-x-4">
          <img src="/QuizArena Logo.png" alt="QuizArena" className="h-12 w-auto object-contain drop-shadow-md" />
          <div className="hidden sm:block border-l border-white/20 pl-4 py-0.5">
            <p className="text-xs font-bold text-blue-200 tracking-wider">
              {isLobby ? 'Live Lobby • Scan & Join' : 'Learn • Assess • Grow'}
            </p>
          </div>
        </div>

        {/* Right Header Controls / Game Code */}
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-xl flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Game Code
            </span>
            <span className="text-3xl font-black font-mono tracking-widest text-amber-400">
              {quizCode}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition"
            title="Exit Projector View (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="my-auto py-6 max-w-[96%] mx-auto w-full space-y-8 max-h-[80vh] overflow-y-auto pr-1">
        
        {isLobby ? (
          /* ==================== LOBBY STAGE VIEW ==================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Card: QR Code & Game Code (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-900/80 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center justify-between text-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center justify-center space-x-2">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>Scan to Join via Mobile</span>
                </h3>
                <p className="text-sm font-bold text-slate-300">Point phone camera at the QR code below</p>
              </div>

              {/* QR Code */}
              <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/20 transform transition hover:scale-105">
                <QRCodeImage value={joinUrl || `https://quizarena.com/join?code=${quizCode}`} size={300} className="rounded-xl" />
              </div>

              {/* Game Code Display */}
              <div className="space-y-1 bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl w-full max-w-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Game Code</p>
                <p className="text-4xl font-black font-mono tracking-widest text-amber-400">{quizCode}</p>
                {joinUrl && (
                  <p className="text-[11px] font-bold text-slate-400 pt-1 truncate">
                    {joinUrl}
                  </p>
                )}
              </div>
            </div>

            {/* Right Card: Joined Participants List (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-900/80 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Participants Joined</h3>
                    <p className="text-xs font-semibold text-slate-400">Live players waiting for game start</p>
                  </div>
                </div>

                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-2xl text-2xl font-black">
                  {count}
                </span>
              </div>

              {/* Participants Grid / List */}
              <div className="flex-1 max-h-[360px] overflow-y-auto pr-1">
                {participants.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {participants.map((p, idx) => {
                      const name = typeof p === 'string' ? p : p?.displayName || p?.name || p?.participantId || `Player ${idx + 1}`;
                      const colorClass = avatarColors[idx % avatarColors.length];
                      return (
                        <div
                          key={idx}
                          className="px-4 py-2 bg-slate-800/90 border border-white/10 rounded-2xl flex items-center space-x-2.5 shadow-md animate-in fade-in zoom-in-95 duration-200"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${colorClass}`}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-extrabold text-white truncate max-w-[150px]">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center space-y-3 p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-300">Waiting for players to join...</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Players can scan the QR Code or enter the Game Code on their mobile devices.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-3 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>The session will begin as soon as the trainer clicks "Start Game"</span>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== ACTIVE QUESTION STAGE VIEW ==================== */
          <>
            {/* Progress & Circular Timer Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Question Progress Header (Left 9 cols) */}
              <div className="md:col-span-9 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                  <span className="tracking-wide">
                    Question {currentIdx} of {totalQuestions}
                  </span>
                  <span className="text-blue-400 font-extrabold">{progressPercent}% Completed</span>
                </div>

                {/* Glowing Blue Progress Bar */}
                <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Right Column: Giant Circular Timer (3 cols) */}
              <div className="md:col-span-3 flex justify-center md:justify-end">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-slate-800/80"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      className={`${
                        timeLeft <= 5 ? 'text-rose-500' : 'text-amber-400'
                      } transition-all duration-1000 ease-linear`}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-lg">
                      {timeLeft}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      sec
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Display Stage */}
            {currentQuestion?.questionType && currentQuestion.questionType !== 'MCQ' && currentQuestion.questionType !== 'TRUE_FALSE' ? (
              <div className="bg-slate-900/90 p-6 rounded-3xl border border-white/10 shadow-2xl">
                <QuestionRenderer question={currentQuestion} mode="projector" />
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {currentQuestion?.questionText ? (
                    renderQuestionText(currentQuestion.questionText)
                  ) : (
                    'Which element of the RCTOF prompt engineering framework defines WHO the AI should act as during response generation?'
                  )}
                </h1>

                {/* 2x2 Option Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {(currentQuestion?.options || [
                    'Role / Persona',
                    'Context',
                    'Task',
                    'Output Format',
                  ]).map((optionText: string, idx: number) => {
                    const style = optionColors[idx % 4];
                    return (
                      <div
                        key={idx}
                        className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex items-center space-x-5 transition-transform duration-200 ${style.bg}`}
                      >
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black shadow-inner shrink-0 border border-white/30 ${style.circleBg}`}
                        >
                          {style.letter}
                        </div>
                        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                          {optionText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};
