'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  Sparkles,
  RefreshCw,
  Clock,
  Award,
  Users,
  Play,
  Loader2,
  BookOpen,
  Check,
  Sliders,
  Eye,
  Trophy,
} from 'lucide-react';
import { IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface ConductQuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: IQuiz | null;
  quizzes?: IQuiz[];
  onSessionCreated: (quizCode: string, quizTitle: string, questionTime: number, quizSnapshot: any) => void;
}

export const ConductQuizSetupModal: React.FC<ConductQuizSetupModalProps> = ({
  isOpen,
  onClose,
  quiz: initialQuiz,
  quizzes = [],
  onSessionCreated,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>(null);
  const [quizCode, setQuizCode] = useState<string>('');
  const [questionTime, setQuestionTime] = useState<number>(30);
  const [allowLateJoin, setAllowLateJoin] = useState<boolean>(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(true);
  const [showScore, setShowScore] = useState<boolean>(true);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [finalLeaderboard, setFinalLeaderboard] = useState<boolean>(true);
  const [pointsMode, setPointsMode] = useState<string>('QUIZ_SETTINGS');
  const [loading, setLoading] = useState<boolean>(false);

  const { showToast } = useToast();

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setQuizCode(code);
  };

  useEffect(() => {
    if (isOpen) {
      generateCode();
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

  const handleCreateSession = async () => {
    if (!selectedQuiz) {
      showToast('Please select a valid quiz to conduct.', 'warning');
      return;
    }

    const qCount = selectedQuiz.questionIds?.length || selectedQuiz.questions?.length || 0;
    if (qCount === 0) {
      showToast('Selected quiz has no questions. Please add questions before conducting.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuiz._id,
          sessionType: 'CONDUCT',
          questionTime,
          allowLateJoin,
          showCorrectAnswer,
          showScore,
          showLeaderboard,
          finalPodium: finalLeaderboard,
          pointsMode,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create Conduct Quiz session.');
      }

      const { quizCode: createdCode, quizTitle, quizSnapshot } = json.data;
      showToast(`Conduct Quiz Session created! Join Code: ${createdCode}`, 'success');
      onSessionCreated(createdCode, quizTitle, questionTime, quizSnapshot);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error creating session', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ClipboardList className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">CONDUCT QUIZ SETUP</h2>
              <p className="text-xs text-blue-100 font-medium">Run a structured real-time assessment with your trainees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Quiz Selector */}
          {quizzes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Quiz to Conduct:
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {quizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title} ({q.questionIds?.length || 0} Questions) - {q.category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Quiz Details Card */}
          {selectedQuiz && (
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Selected Quiz</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                  Structured Mode
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{selectedQuiz.title}</h3>
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 pt-1">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedQuiz.questionIds?.length || selectedQuiz.questions?.length || 0} Questions</span>
                </span>
                <span>•</span>
                <span>Prepared by Trainer</span>
              </div>
            </div>
          )}

          {/* Session Settings Section */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>SESSION SETTINGS</span>
            </h4>

            {/* Question Time & Points Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Question Time Limit</span>
                </label>
                <select
                  value={questionTime}
                  onChange={(e) => setQuestionTime(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds (Recommended)</option>
                  <option value={45}>45 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Scoring Formula</span>
                </label>
                <select
                  value={pointsMode}
                  onChange={(e) => setPointsMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="QUIZ_SETTINGS">Speed-Based Points (Up to 1000)</option>
                  <option value="STANDARD_1000">Fixed 1000 Pts / Question</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              {/* Allow Late Join */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Allow Late Join</span>
                  <span className="text-[10px] text-slate-400">Students can join after the trainer starts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowLateJoin(!allowLateJoin)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    allowLateJoin ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      allowLateJoin ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Show Correct Answer After Each Question */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Show Correct Answer After Each Question</span>
                  <span className="text-[10px] text-slate-400">Reveal correct choice during result stage</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    showCorrectAnswer ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showCorrectAnswer ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Show Score After Each Question */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Show Score After Each Question</span>
                  <span className="text-[10px] text-slate-400">Display points earned per question to students</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScore(!showScore)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    showScore ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showScore ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Show Leaderboard During Quiz */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Show Leaderboard During Quiz</span>
                  <span className="text-[10px] text-slate-400">Brief standings between questions</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    showLeaderboard ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showLeaderboard ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Final Leaderboard */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Final Leaderboard / Results</span>
                  <span className="text-[10px] text-slate-400">Show complete rank summary at the end</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFinalLeaderboard(!finalLeaderboard)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    finalLeaderboard ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      finalLeaderboard ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Student Access Banner */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Student Login Policy:</span>
              </div>
              <span className="font-black bg-emerald-200/70 text-emerald-800 px-2.5 py-0.5 rounded-lg text-[11px]">
                No Account Required (Name + Code)
              </span>
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
            onClick={handleCreateSession}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-amber-300" />
                <span>CREATE CONDUCT QUIZ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
