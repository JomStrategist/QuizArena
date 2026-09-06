'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  KeyRound,
  Rocket,
  ArrowRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { QRCodeImage } from '@/lib/game/qrGenerator';
import { useToast } from '../ui/ToastNotification';

interface FullScreenQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // e.g. "Data Analytics - September 2026" or "Activity 4: Prompt Engineering Challenge"
  code: string;  // e.g. "DA26" or "394810"
  subtitle?: string;
  customUrl?: string;
}

export const FullScreenQRModal: React.FC<FullScreenQRModalProps> = ({
  isOpen,
  onClose,
  title,
  code,
  subtitle = 'Join Our Session',
  customUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = customUrl || `${window.location.origin}/quiz/join?code=${code}`;
      setJoinUrl(url);
    }
  }, [code, customUrl]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    showToast('Join URL copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard!', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 text-white font-sans overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto shrink-0">
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-10 h-10 object-contain" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Quiz<span className="text-blue-400">Arena</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-blue-300 tracking-wide">
              Learn • Assess • Grow
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold transition flex items-center space-x-1.5 text-white backdrop-blur-md"
        >
          <X className="w-4 h-4" />
          <span>Close (Esc)</span>
        </button>
      </div>

      {/* Main Center Content */}
      <div className="my-auto py-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            {subtitle}
          </h1>
          <p className="text-lg sm:text-xl font-bold text-blue-200 tracking-wide">
            {title}
          </p>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch max-w-4xl mx-auto">
          {/* Left Column: QR Code Card */}
          <div className="bg-white text-slate-900 p-7 rounded-3xl shadow-2xl flex flex-col items-center justify-between text-center border border-white/40">
            <div className="flex items-center justify-center my-auto py-2">
              <QRCodeImage value={joinUrl || `https://quizarena.app/quiz/join?code=${code}`} size={260} />
            </div>

            <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-700 mt-4 pt-3 border-t border-slate-100 w-full justify-center">
              <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Scan this QR code with your device to join</span>
            </div>
          </div>

          {/* Right Column: Code Card */}
          <div className="bg-white/95 backdrop-blur-xl text-slate-900 p-7 rounded-3xl shadow-2xl flex flex-col justify-between space-y-5 border border-white/40">
            <div className="flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-widest text-blue-600 pt-1">
              <KeyRound className="w-4 h-4" />
              <span>Session / Batch Code</span>
            </div>

            {/* Giant Code Box */}
            <div
              onClick={handleCopyCode}
              title="Click to copy code"
              className="bg-slate-50 border border-slate-200/90 p-6 rounded-3xl text-center relative cursor-pointer hover:bg-blue-50/50 transition group"
            >
              <span className="text-5xl sm:text-6xl font-black tracking-widest font-mono text-slate-900 block group-hover:scale-105 transition-transform">
                {code}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                Click to copy code
              </span>
            </div>

            <p className="text-xs font-bold text-slate-500 text-center">
              Enter this code in the app to join
            </p>

            {/* Or Visit URL Box */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
                Or visit
              </p>
              <div className="bg-blue-50/80 border border-blue-200 p-2.5 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-blue-700 truncate mr-2 pl-1">
                  {joinUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition shrink-0 shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Horizontal Process Guide */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-blue-100 pt-2">
          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Scan QR or enter code</span>
          </div>

          <ArrowRight className="w-4 h-4 text-blue-300 hidden sm:block" />

          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Join the session</span>
          </div>

          <ArrowRight className="w-4 h-4 text-blue-300 hidden sm:block" />

          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>Start learning!</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Rocket & Slogans */}
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full pt-4 border-t border-white/10 text-xs text-blue-200 shrink-0">
        <p className="font-serif italic font-medium">
          Questions today Build a brighter tomorrow
        </p>

        <div className="flex items-center space-x-2 font-serif italic font-bold text-blue-300 mt-2 sm:mt-0">
          <Rocket className="w-4 h-4 text-amber-400" />
          <span>Learn Grow Achieve Together</span>
        </div>
      </div>
    </div>
  );
};
