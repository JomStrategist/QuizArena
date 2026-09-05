'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, Radio, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface LiveGameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizzes: IQuiz[];
  initialQuiz?: IQuiz | null;
  onLaunchLiveGame: (quizId: string) => void;
}

export const LiveGameSetupModal: React.FC<LiveGameSetupModalProps> = ({
  isOpen,
  onClose,
  quizzes,
  initialQuiz,
  onLaunchLiveGame,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialQuiz) {
        setSelectedQuizId(initialQuiz._id);
        setSelectedQuiz(initialQuiz);
      } else if (quizzes.length > 0) {
        setSelectedQuizId(quizzes[0]._id);
        setSelectedQuiz(quizzes[0]);
      }
    }
  }, [isOpen, initialQuiz, quizzes]);

  useEffect(() => {
    if (selectedQuizId && quizzes.length > 0) {
      const q = quizzes.find((item) => item._id === selectedQuizId);
      if (q) setSelectedQuiz(q);
    }
  }, [selectedQuizId, quizzes]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    if (!selectedQuiz) {
      showToast('Please select a quiz to launch.', 'warning');
      return;
    }

    const qCount = selectedQuiz.questionIds?.length || selectedQuiz.questions?.length || 0;
    if (qCount === 0) {
      showToast('Selected quiz has no questions. Please add questions before launching.', 'error');
      return;
    }

    onLaunchLiveGame(selectedQuiz._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">SELECT LIVE GAME QUIZ</h2>
              <p className="text-xs text-slate-900 font-semibold opacity-90">
                Choose which quiz to launch for Kahoot-style live participation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 flex items-center justify-center transition text-slate-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-800">
          {/* Quiz Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Quiz to Launch:
            </label>
            {quizzes.length === 0 ? (
              <p className="text-slate-500 text-xs italic">No quizzes available. Please create a quiz first.</p>
            ) : (
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {quizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title} ({q.questionIds?.length || 0} Questions) - {q.category}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Quiz Card Preview */}
          {selectedQuiz && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                  {selectedQuiz.category}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full">
                  Live Mode
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{selectedQuiz.title}</h3>
              <p className="text-xs text-slate-600 font-medium">
                {selectedQuiz.description || 'No description provided.'}
              </p>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 pt-1">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedQuiz.questionIds?.length || selectedQuiz.questions?.length || 0} Questions</span>
                </span>
                <span>•</span>
                <span>Speed-based Kahoot Scoring</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            disabled={!selectedQuiz || (selectedQuiz.questionIds?.length || 0) === 0}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
