'use client';

import React, { useEffect } from 'react';
import { Users, Crown, Zap, X } from 'lucide-react';

interface ProjectorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizCode: string;
  quizTitle?: string;
  currentQuestion: any;
  currentIdx: number;
  totalQuestions: number;
  timeLeft: number;
  totalTime?: number;
  totalParticipants: number;
}

export const ProjectorViewModal: React.FC<ProjectorViewModalProps> = ({
  isOpen,
  onClose,
  quizCode,
  quizTitle = 'Activity 4: Prompt Engineering Challenge',
  currentQuestion,
  currentIdx,
  totalQuestions,
  timeLeft,
  totalTime = 20,
  totalParticipants,
}) => {
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

  const progressPercent = Math.min(
    100,
    Math.round((currentIdx / Math.max(1, totalQuestions)) * 100)
  );

  // SVG Circular progress for timer
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const timePercent = Math.max(0, Math.min(1, timeLeft / Math.max(1, totalTime)));
  const strokeDashoffset = circumference * (1 - timePercent);

  // Highlight keyword inside question if applicable
  const renderQuestionText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(WHO|WHAT|HOW|WHY|WHERE|WHEN)/gi);
    return parts.map((part, index) => {
      if (['WHO', 'WHAT', 'HOW', 'WHY', 'WHERE', 'WHEN'].includes(part.toUpperCase())) {
        return (
          <span key={index} className="text-amber-400 font-extrabold underline decoration-amber-400 decoration-wavy">
            {part}
          </span>
        );
      }
      return part;
    });
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
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto shrink-0">
        {/* Left Branding */}
        <div className="flex items-center space-x-4">
          <img src="/QuizArena Logo.png" alt="QuizArena" className="h-12 w-auto object-contain drop-shadow-md" />
          <div className="hidden sm:block border-l border-white/20 pl-4 py-0.5">
            <p className="text-xs font-bold text-blue-200 tracking-wider">
              Learn • Assess • Grow
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
      <div className="my-auto py-6 max-w-7xl mx-auto w-full space-y-8">
        
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

            {/* Question Text */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight pt-4 tracking-tight drop-shadow-md">
              {currentQuestion?.questionText ? (
                renderQuestionText(currentQuestion.questionText)
              ) : (
                'Which element of the RCTOF prompt engineering framework defines WHO the AI should act as during response generation?'
              )}
            </h1>
          </div>

          {/* Right Column: Giant Circular Timer (3 cols) */}
          <div className="md:col-span-3 flex justify-center md:justify-end">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800/80"
                  fill="transparent"
                />
                {/* Progress Ring */}
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
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-lg">
                  {timeLeft}
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                  seconds
                </span>
              </div>
            </div>
          </div>
        </div>

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

      {/* Bottom Footer Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto shrink-0 pt-4 border-t border-white/10 gap-4">
        {/* Left: Participants Badge */}
        <div className="flex items-center space-x-3 text-slate-200">
          <div className="p-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-white leading-none block">
              {totalParticipants || 28}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Participants
            </span>
          </div>
        </div>

        {/* Center: Slogan with Crown */}
        <div className="flex items-center space-x-2 text-slate-300 text-sm font-extrabold tracking-wide">
          <Crown className="w-5 h-5 text-amber-400" />
          <span>Think • Choose • Be the Champion!</span>
        </div>

        {/* Right: Live Quiz Session Badge */}
        <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
          <Zap className="w-4 h-4 text-pink-400 fill-pink-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Live Quiz Session</p>
            <p className="text-xs font-black text-white">{quizTitle}</p>
          </div>
        </div>
      </div>

      {/* Bottom Branding & Handwritten Tagline */}
      <div className="flex items-end justify-between w-full max-w-7xl mx-auto shrink-0 pt-2 text-xs">
        {/* Left: Parent Org Logo */}
        <div className="flex items-center space-x-2 opacity-90">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BY</span>
          <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-6 object-contain" />
        </div>

        {/* Right: Handwritten Script Slogan */}
        <div className="relative text-right">
          <p className="font-serif italic text-xl sm:text-2xl font-bold tracking-wide text-white drop-shadow-sm">
            Same Questions <br className="sm:hidden" />
            <span className="text-amber-300">Bigger Minds!</span>
          </p>
          <svg className="w-48 h-3 text-amber-400 ml-auto mt-0.5" viewBox="0 0 200 12" fill="none">
            <path
              d="M 5 6 Q 100 12 195 4"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
