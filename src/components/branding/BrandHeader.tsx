'use client';

import React from 'react';
import { User, LogOut, Shield } from 'lucide-react';
import { useToast } from '../ui/ToastNotification';

interface BrandHeaderProps {
  subtitle?: string;
  className?: string;
  compact?: boolean;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  subtitle,
  className = '',
  compact = false,
  user,
  onLogout,
}) => {
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      showToast('Logged out successfully.', 'info');
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    } catch (e) {
      window.location.href = '/';
    }
  };

  return (
    <header className={`w-full flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center space-x-4">
        {/* QuizArena Product Identity */}
        <a href="/" className="flex items-center space-x-3 group cursor-pointer">
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
        </a>
      </div>

      <div className="flex items-center space-x-4">
        {/* Authenticated User Badge & Logout */}
        {user ? (
          <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-1.5 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {user.role === 'TRAINER' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 line-clamp-1">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* KVJ Analytics Parent Organization Identity */
          <div className="flex items-center space-x-3 bg-slate-50/80 px-3.5 py-1.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">BY</span>
            <img
              src="/KVJ analytics Logo.png"
              alt="KVJ Analytics Logo"
              className={`${compact ? 'h-5' : 'h-6'} object-contain`}
            />
          </div>
        )}
      </div>
    </header>
  );
};
