'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Send,
  Play,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  ListOrdered,
  Eye,
  Radio,
} from 'lucide-react';
import { IQuiz, IAssignment } from '@/types';
import { useToast } from '../ui/ToastNotification';
import { QuestionBankView } from './QuestionBankView';
import { ImportWizard } from './ImportWizard';
import { QuizCreatorModal } from './QuizCreatorModal';
import { AssignQuizModal } from './AssignQuizModal';

interface TrainerDashboardProps {
  onStartLiveSession: (quizCode: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onStartLiveSession }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUESTION_BANK' | 'QUIZZES' | 'ASSIGNMENTS'>('OVERVIEW');
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizRes, assignRes] = await Promise.all([
        fetch('/api/v1/quizzes'),
        fetch('/api/v1/assignments'),
      ]);

      const quizJson = await quizRes.json();
      const assignJson = await assignRes.json();

      if (quizJson.success) setQuizzes(quizJson.data);
      if (assignJson.success) setAssignments(assignJson.data);
    } catch (err) {
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLaunchLiveSession = async (quizId: string) => {
    try {
      const res = await fetch('/api/v1/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to start Live Session.');
      }

      const quizCode = json.data.quizCode;
      showToast(`Live Session created! Join Code: ${quizCode}`, 'success');
      onStartLiveSession(quizCode);
    } catch (err: any) {
      showToast(err.message || 'Error launching live game', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          {[
            { id: 'OVERVIEW', label: 'Dashboard Overview', icon: BarChart3 },
            { id: 'QUESTION_BANK', label: 'Question Bank', icon: ListOrdered },
            { id: 'QUIZZES', label: 'Quizzes', icon: BookOpen },
            { id: 'ASSIGNMENTS', label: 'Assignments', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'QUESTION_BANK' && <QuestionBankView />}

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Quick Action Shortcuts Panel */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-bounce-light" />
                  <h2 className="text-xl font-black">Trainer Command Center</h2>
                </div>
                <p className="text-xs text-blue-100 mt-1">
                  Launch quizzes, assign tasks to students, or import questions in one click.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => setIsCreateQuizOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group backdrop-blur-md"
              >
                <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">CREATE QUIZ</span>
              </button>

              <button
                onClick={() => setIsImportOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group backdrop-blur-md"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">IMPORT QUESTIONS</span>
              </button>

              <button
                onClick={() => setIsAssignOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group backdrop-blur-md"
              >
                <Send className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">ASSIGN QUIZ</span>
              </button>

              <button
                onClick={() => {
                  if (quizzes.length > 0) {
                    handleLaunchLiveSession(quizzes[0]._id);
                  } else {
                    showToast('Please create or import a quiz first.', 'warning');
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group shadow-lg shadow-amber-500/20 font-black"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <span className="text-xs">START LIVE GAME</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-medium">Total Quizzes</p>
              <p className="text-2xl font-black text-slate-900">{quizzes.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-medium">Active Assignments</p>
              <p className="text-2xl font-black text-blue-600">{assignments.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-medium">Capacity Target</p>
              <p className="text-2xl font-black text-emerald-600">~200 Students</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-medium">Engine Mode</p>
              <p className="text-base font-black text-purple-600">Kahoot-Style Live</p>
            </div>
          </div>

          {/* Quizzes Overview List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Your Quizzes</h3>
              <button
                onClick={() => setIsCreateQuizOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                + Build New Quiz
              </button>
            </div>

            {loading ? (
              <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ) : quizzes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                No quizzes created yet. Create a quiz or import questions to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200 transition flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{quiz.title}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
                          {quiz.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {quiz.questionIds?.length || 0} Questions • Created by Trainer
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLaunchLiveSession(quiz._id)}
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Launch Live Game</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'QUIZZES' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">All Quizzes</h2>
            <button
              onClick={() => setIsCreateQuizOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
            >
              + Create Quiz
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <div key={q._id} className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{q.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    {q.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{q.description || 'No description provided.'}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-medium text-slate-400">
                    {q.questionIds?.length || 0} Questions
                  </span>
                  <button
                    onClick={() => handleLaunchLiveSession(q._id)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                  >
                    Start Live
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ASSIGNMENTS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Dispatched Assignments</h2>
            <button
              onClick={() => setIsAssignOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
            >
              + Assign Quiz
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No active assignments found.</div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      Assigned to {a.studentEmails.length} student(s) • Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                    {a.studentEmails.length} Assigned
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => loadData()}
      />
      <QuizCreatorModal
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        onQuizCreated={() => loadData()}
      />
      <AssignQuizModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        quizzes={quizzes}
        onAssignmentCreated={() => loadData()}
      />
    </div>
  );
};
