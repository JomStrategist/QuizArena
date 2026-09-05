'use client';

import React from 'react';

interface BrandHeaderProps {
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ subtitle, className = '', compact = false }) => {
  return (
    <header className={`w-full flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center space-x-4">
        {/* QuizArena Product Identity */}
        <div className="flex items-center space-x-3 group cursor-pointer">
          <img
            src="/QuizArena Icon.png"
            alt="QuizArena Icon"
            className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} object-contain transition-transform group-hover:scale-105`}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-black tracking-tight text-slate-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
                Quiz<span className="text-blue-600">Arena</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                PRO
              </span>
            </div>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* KVJ Analytics Parent Organization Identity */}
      <div className="flex items-center space-x-3 bg-slate-50/80 px-3.5 py-1.5 rounded-xl border border-slate-200/80">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">BY</span>
        <img
          src="/KVJ analytics Logo.png"
          alt="KVJ Analytics Logo"
          className={`${compact ? 'h-5' : 'h-6'} object-contain`}
        />
      </div>
    </header>
  );
};
