'use client';

import React, { useState } from 'react';
import { X, Play, Eye, Users, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface ScoreboardVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (visibility: 'EVERYONE' | 'TRAINER_ONLY') => void;
  title?: string;
  isSubmitting?: boolean;
}

export const ScoreboardVisibilityModal: React.FC<ScoreboardVisibilityModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Scoreboard Display Setting',
  isSubmitting = false,
}) => {
  const [selectedVisibility, setSelectedVisibility] = useState<'EVERYONE' | 'TRAINER_ONLY'>('EVERYONE');

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans text-slate-900 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden p-6 sm:p-7 space-y-6 relative cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md border border-amber-300">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">{title}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Configure scoreboard visibility before starting
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Choice Card Options */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Where should the post-question scoreboard appear?
          </p>

          {/* Option A: Show to Everyone */}
          <div
            onClick={() => setSelectedVisibility('EVERYONE')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
              selectedVisibility === 'EVERYONE'
                ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${selectedVisibility === 'EVERYONE' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-slate-900">Show to Everyone</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md uppercase">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Full animated intermediate scoreboard will be displayed on both the Trainer screen and all Participant screens after every question.
              </p>
            </div>
          </div>

          {/* Option B: Show to Trainer Only */}
          <div
            onClick={() => setSelectedVisibility('TRAINER_ONLY')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
              selectedVisibility === 'TRAINER_ONLY'
                ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-500/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${selectedVisibility === 'TRAINER_ONLY' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">Trainer Screen Only</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Scoreboard will only be displayed on the Trainer screen. Participant screens will show a waiting card between questions.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(selectedVisibility)}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs rounded-xl transition shadow-lg flex items-center space-x-2 border border-amber-300 active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Game Now 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
