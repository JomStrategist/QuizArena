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
  onLaunchLiveGame: (quizId: string, settings: {
    questionTime: number;
    maxParticipants: number;
    speedScoring: boolean;
    showCorrectAnswer: boolean;
    showLeaderboard: boolean;
    finalPodium: boolean;
  }) => void;
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
  
  // Game Settings State
  const [questionTime, setQuestionTime] = useState<number>(20);
  const [maxParticipants, setMaxParticipants] = useState<number>(200);
  const [speedScoring, setSpeedScoring] = useState<boolean>(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(true);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [finalPodium, setFinalPodium] = useState<boolean>(true);

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

    onLaunchLiveGame(selectedQuiz._id, {
      questionTime,
      maxParticipants,
      speedScoring,
      showCorrectAnswer,
      showLeaderboard,
      finalPodium,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">START LIVE GAME</h2>
              <p className="text-xs text-slate-950 font-semibold opacity-90">
                Configure real-time competitive settings for up to {maxParticipants} students
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
        <div className="p-6 space-y-5 text-xs text-slate-800 overflow-y-auto">
          {/* Quiz Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Quiz Activity:
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
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                  {selectedQuiz.category}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full">
                  {selectedQuiz.questionIds?.length || selectedQuiz.questions?.length || 0} Questions
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{selectedQuiz.title}</h3>
              <p className="text-xs text-slate-600 font-medium">
                {selectedQuiz.description || 'No description provided.'}
              </p>
            </div>
          )}

          {/* GAME SETTINGS GRID */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">GAME SETTINGS</h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Setting 1: Question Time */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Question Time Limit</label>
                <select
                  value={questionTime}
                  onChange={(e) => setQuestionTime(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds (Default)</option>
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                </select>
              </div>

              {/* Setting 2: Maximum Participants */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Maximum Participants</label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none"
                >
                  <option value={50}>50 Students</option>
                  <option value={100}>100 Students</option>
                  <option value={200}>200 Students (Max)</option>
                </select>
              </div>
            </div>

            {/* Checkbox / Toggle Settings */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Toggle 1: Speed Scoring */}
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Speed Scoring</p>
                  <p className="text-[10px] text-slate-500">Faster answers get more points</p>
                </div>
                <input
                  type="checkbox"
                  checked={speedScoring}
                  onChange={(e) => setSpeedScoring(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
              </label>

              {/* Toggle 2: Show Correct Answer */}
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Show Correct Answer</p>
                  <p className="text-[10px] text-slate-500">Reveal answer after timer ends</p>
                </div>
                <input
                  type="checkbox"
                  checked={showCorrectAnswer}
                  onChange={(e) => setShowCorrectAnswer(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
              </label>

              {/* Toggle 3: Show Leaderboard */}
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Show Leaderboard</p>
                  <p className="text-[10px] text-slate-500">Display leaderboard between questions</p>
                </div>
                <input
                  type="checkbox"
                  checked={showLeaderboard}
                  onChange={(e) => setShowLeaderboard(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
              </label>

              {/* Toggle 4: Final Podium */}
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Final Podium</p>
                  <p className="text-[10px] text-slate-500">Show 1st/2nd/3rd place celebration</p>
                </div>
                <input
                  type="checkbox"
                  checked={finalPodium}
                  onChange={(e) => setFinalPodium(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
              </label>
            </div>
          </div>
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
            <span>CREATE LIVE GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
