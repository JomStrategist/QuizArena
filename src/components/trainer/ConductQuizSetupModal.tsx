'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Clock,
  Zap,
  CheckCircle2,
  Users,
  Eye,
  Trophy,
  BookOpen,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface ConductQuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz?: IQuiz | null;
  quizzes?: IQuiz[];
  onSessionCreated: (quizCode: string, quizTitle: string, questionTime: number, quizSnapshot: any) => void;
}

export const ConductQuizSetupModal: React.FC<ConductQuizSetupModalProps> = ({
  isOpen,
  onClose,
  quiz,
  quizzes = [],
  onSessionCreated,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [questionTime, setQuestionTime] = useState<number>(30);
  const [pointsMode, setPointsMode] = useState<string>('SPEED_BASED');
  const [allowLateJoin, setAllowLateJoin] = useState<boolean>(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(true);
  const [showScore, setShowScore] = useState<boolean>(true);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (quiz?._id) {
      setSelectedQuizId(quiz._id);
    } else if (quizzes.length > 0) {
      setSelectedQuizId(quizzes[0]._id);
    }
  }, [quiz, quizzes]);

  if (!isOpen) return null;

  const currentSelectedQuiz = quizzes.find((q) => q._id === selectedQuizId) || quiz;

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      showToast('Please select a valid quiz to conduct.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuizId,
          sessionType: 'CONDUCT',
          questionTime,
          maxParticipants: 200,
          allowLateJoin,
          speedScoring: pointsMode === 'SPEED_BASED',
          showCorrectAnswer,
          showScore,
          showLeaderboard,
          finalPodium: true,
          pointsMode,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to initialize Conduct Quiz session.');
      }

      const { quizCode, quizTitle, quizSnapshot } = json.data;
      showToast(`Conduct Quiz created for "${quizTitle}"! Code: ${quizCode}`, 'success');
      onSessionCreated(quizCode, quizTitle, questionTime, quizSnapshot);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error creating conduct session.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-900 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden space-y-5 p-6 md:p-8 relative cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <img src="/QuizArena Icon.png" alt="QuizArena" className="w-8 h-8 object-contain" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-slate-900">QuizArena</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 rounded-md">
                  CONDUCT QUIZ SETUP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                Configure your quiz with flexible options
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateSession} className="space-y-5">
          
          {/* Select Quiz to Conduct */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
              Select Quiz to Conduct
            </label>

            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.questionIds?.length || 5} Questions)
                </option>
              ))}
            </select>
          </div>

          {/* SESSION SETTINGS Header */}
          <div className="space-y-3 pt-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
              SESSION SETTINGS
            </p>

            {/* Question Time Limit */}
            <div className="space-y-1">
              <label className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Question Time Limit</span>
              </label>

              <select
                value={questionTime}
                onChange={(e) => setQuestionTime(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={15}>15 seconds</option>
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds (Recommended)</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            {/* Scoring Formula */}
            <div className="space-y-1 pt-1">
              <label className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Scoring Formula</span>
              </label>

              <select
                value={pointsMode}
                onChange={(e) => setPointsMode(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="SPEED_BASED">Speed-Based Points (Up to 1000)</option>
                <option value="FLAT_POINTS">Flat Points (100 pts per question)</option>
                <option value="NO_POINTS">No Points (Assessment only)</option>
              </select>
            </div>

            {/* Interactive Toggles */}
            <div className="space-y-3 pt-2">
              
              {/* Toggle 1: Allow Late Join */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Allow Late Join</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Students can join after the trainer starts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowLateJoin}
                    onChange={(e) => setAllowLateJoin(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Toggle 2: Show Correct Answer After Each Question */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Show Correct Answer After Each Question</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Reveal correct choice during result stage</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCorrectAnswer}
                    onChange={(e) => setShowCorrectAnswer(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Toggle 3: Show Score After Each Question */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Show Score After Each Question</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Display points earned per question to students</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showScore}
                    onChange={(e) => setShowScore(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Toggle 4: Show Leaderboard During Quiz */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Show Leaderboard During Quiz</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Brief standings between questions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLeaderboard}
                    onChange={(e) => setShowLeaderboard(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Create Conduct Quiz</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
