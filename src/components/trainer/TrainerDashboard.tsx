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
  ClipboardList,
  Edit,
  Archive,
} from 'lucide-react';
import { IQuiz, IAssignment, IQuestion } from '@/types';
import { useToast } from '../ui/ToastNotification';
import { QuestionBankView } from './QuestionBankView';
import { ImportWizard } from './ImportWizard';
import { QuizCreatorModal } from './QuizCreatorModal';
import { AssignQuizModal } from './AssignQuizModal';
import { ConductQuizSetupModal } from './ConductQuizSetupModal';

interface TrainerDashboardProps {
  onStartLiveSession: (quizCode: string, quizTitle: string, questions: IQuestion[]) => void;
  onStartConductQuiz: (quizCode: string, quizTitle: string, questionTime: number, quizSnapshot: any) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  onStartLiveSession,
  onStartConductQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUESTION_BANK' | 'QUIZZES' | 'ASSIGNMENTS'>('OVERVIEW');
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isConductSetupOpen, setIsConductSetupOpen] = useState(false);
  const [selectedQuizForConduct, setSelectedQuizForConduct] = useState<IQuiz | null>(null);

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
        body: JSON.stringify({ quizId, sessionType: 'LIVE_GAME' }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to start Live Session.');
      }

      const { quizCode, quizTitle, quizSnapshot } = json.data;
      showToast(`Live Session created for "${quizTitle}"! Join Code: ${quizCode}`, 'success');
      onStartLiveSession(quizCode, quizTitle, quizSnapshot?.questions || []);
    } catch (err: any) {
      showToast(err.message || 'Error launching live game', 'error');
    }
  };

  const handleOpenConductSetup = (quiz?: IQuiz) => {
    if (quiz) {
      setSelectedQuizForConduct(quiz);
    } else if (quizzes.length > 0) {
      setSelectedQuizForConduct(quizzes[0]);
    } else {
      setSelectedQuizForConduct(null);
    }
    setIsConductSetupOpen(true);
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
          {/* Quick Action Shortcuts Panel: 5 Buttons Command Center */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-bounce-light" />
                  <h2 className="text-xl font-black">Trainer Command Center</h2>
                </div>
                <p className="text-xs text-blue-100 mt-1">
                  Conduct structured sessions, start live Kahoot-style games, assign tasks, or import questions in one click.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {/* Button 1: CREATE QUIZ */}
              <button
                onClick={() => setIsCreateQuizOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group backdrop-blur-md"
              >
                <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center">CREATE QUIZ</span>
              </button>

              {/* Button 2: IMPORT QUESTIONS */}
              <button
                onClick={() => setIsImportOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group backdrop-blur-md"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center">IMPORT QUESTIONS</span>
              </button>

              {/* Button 3: ASSIGN QUIZ */}
              <button
                onClick={() => setIsAssignOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group backdrop-blur-md"
              >
                <Send className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center">ASSIGN QUIZ</span>
              </button>

              {/* Button 4: CONDUCT QUIZ */}
              <button
                onClick={() => handleOpenConductSetup()}
                className="bg-blue-500 hover:bg-blue-400 text-white p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group shadow-lg shadow-blue-500/30 font-black border border-blue-300/40"
              >
                <ClipboardList className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-center">CONDUCT QUIZ</span>
              </button>

              {/* Button 5: START LIVE GAME */}
              <button
                onClick={() => {
                  if (quizzes.length > 0) {
                    handleLaunchLiveSession(quizzes[0]._id);
                  } else {
                    showToast('Please create or import a quiz first.', 'warning');
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition group shadow-lg shadow-amber-500/20 font-black col-span-2 sm:col-span-1"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform text-slate-950" />
                <span className="text-xs text-center">START LIVE GAME</span>
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
              <p className="text-xs text-slate-500 font-medium">Modes Available</p>
              <p className="text-base font-black text-purple-600">Assign • Conduct • Live</p>
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
                    className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{quiz.title}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
                          {quiz.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {quiz.questionIds?.length || 0} Questions • Created by Trainer • Version 1
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => showToast(`Viewing "${quiz.title}" details`, 'info')}
                        className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>VIEW</span>
                      </button>
                      <button
                        onClick={() => showToast(`Editing "${quiz.title}"`, 'info')}
                        className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>EDIT</span>
                      </button>
                      <button
                        onClick={() => setIsAssignOpen(true)}
                        className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-lg transition flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ASSIGN</span>
                      </button>
                      <button
                        onClick={() => handleOpenConductSetup(quiz)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>CONDUCT QUIZ</span>
                      </button>
                      <button
                        onClick={() => handleLaunchLiveSession(quiz._id)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>LIVE GAME</span>
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
              <div key={q._id} className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{q.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{q.description || 'No description provided.'}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {q.questionIds?.length || 0} Questions • Version 1
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-200/60">
                  <button
                    onClick={() => showToast(`Editing "${q.title}"`, 'info')}
                    className="px-2.5 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => setIsAssignOpen(true)}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-lg transition"
                  >
                    ASSIGN
                  </button>
                  <button
                    onClick={() => handleOpenConductSetup(q)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
                  >
                    <ClipboardList className="w-3 h-3" />
                    <span>CONDUCT QUIZ</span>
                  </button>
                  <button
                    onClick={() => handleLaunchLiveSession(q._id)}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition flex items-center space-x-1"
                  >
                    <Radio className="w-3 h-3" />
                    <span>LIVE GAME</span>
                  </button>
                  <button
                    onClick={() => showToast(`Quiz "${q.title}" archived`, 'info')}
                    className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-bold transition"
                  >
                    ARCHIVE
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
      <ConductQuizSetupModal
        isOpen={isConductSetupOpen}
        onClose={() => setIsConductSetupOpen(false)}
        quiz={selectedQuizForConduct}
        quizzes={quizzes}
        onSessionCreated={(code, title, questionTime, quizSnapshot) => {
          onStartConductQuiz(code, title, questionTime, quizSnapshot);
        }}
      />
    </div>
  );
};
