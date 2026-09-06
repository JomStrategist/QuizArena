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
  ClipboardList,
  Edit,
  Trash2,
  History,
  Search,
  ChevronDown,
  Bell,
  Award,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  LogOut,
  Shield,
  User,
  MoreVertical,
  LayoutGrid,
  List,
  Lightbulb,
  FolderKanban,
  Brain,
  Cpu,
  Layers,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { IQuiz, IAssignment, IQuestion } from '@/types';
import { useToast } from '../ui/ToastNotification';
import { QuestionBankView } from './QuestionBankView';
import { ImportWizard } from './ImportWizard';
import { QuizCreatorModal } from './QuizCreatorModal';
import { AssignQuizModal } from './AssignQuizModal';
import { ConductQuizSetupModal } from './ConductQuizSetupModal';
import { LiveGameSetupModal } from './LiveGameSetupModal';
import { ConductQuizResultsView } from './ConductQuizResultsView';

interface TrainerDashboardProps {
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  onStartLiveSession: (quizCode: string, quizTitle: string, questions: IQuestion[]) => void;
  onStartConductQuiz: (quizCode: string, quizTitle: string, questionTime: number, quizSnapshot: any) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  user,
  onLogout,
  onStartLiveSession,
  onStartConductQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUESTION_BANK' | 'QUIZZES' | 'ASSIGNMENTS' | 'REPORTS'>('OVERVIEW');
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [recentConductResults, setRecentConductResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Pagination for Overview "Your Quizzes" table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Search, Filter & Pagination for Quizzes Tab
  const [quizzesTabSearch, setQuizzesTabSearch] = useState('');
  const [quizzesTabCategory, setQuizzesTabCategory] = useState('ALL');
  const [quizzesTabStatus, setQuizzesTabStatus] = useState('ALL');
  const [quizzesTabSortBy, setQuizzesTabSortBy] = useState<'LAST_MODIFIED' | 'TITLE' | 'QUESTIONS'>('LAST_MODIFIED');
  const [quizzesTabViewMode, setQuizzesTabViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [quizzesTabPage, setQuizzesTabPage] = useState(1);
  const quizzesTabItemsPerPage = 4;

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<IQuiz | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [isConductSetupOpen, setIsConductSetupOpen] = useState(false);
  const [selectedQuizForConduct, setSelectedQuizForConduct] = useState<IQuiz | null>(null);

  const [isLiveSetupOpen, setIsLiveSetupOpen] = useState(false);
  const [selectedQuizForLive, setSelectedQuizForLive] = useState<IQuiz | null>(null);

  const [viewingConductResultsCode, setViewingConductResultsCode] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { showToast } = useToast();

  const handleOpenLiveSetup = (quiz?: IQuiz) => {
    if (quiz) {
      setSelectedQuizForLive(quiz);
    } else if (quizzes.length > 0) {
      setSelectedQuizForLive(quizzes[0]);
    } else {
      setSelectedQuizForLive(null);
    }
    setIsLiveSetupOpen(true);
  };

  const handleEditQuiz = (quiz: IQuiz) => {
    setEditingQuiz(quiz);
    setIsCreateQuizOpen(true);
  };

  const handleCreateNewQuiz = () => {
    setEditingQuiz(null);
    setIsCreateQuizOpen(true);
  };

  const handleDeleteQuiz = async (quiz: IQuiz) => {
    if (!confirm(`Are you sure you want to delete the quiz "${quiz.title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/quizzes?id=${quiz._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Quiz "${quiz.title}" deleted successfully.`, 'info');
        loadData();
      } else {
        showToast(json.error?.message || 'Failed to delete quiz.', 'error');
      }
    } catch (err) {
      showToast('Error deleting quiz.', 'error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizRes, assignRes, resultsRes] = await Promise.all([
        fetch('/api/v1/quizzes'),
        fetch('/api/v1/assignments'),
        fetch('/api/v1/live-sessions/results'),
      ]);

      const quizJson = await quizRes.json();
      const assignJson = await assignRes.json();
      const resultsJson = await resultsRes.json();

      if (quizJson.success) setQuizzes(quizJson.data);
      if (assignJson.success) setAssignments(assignJson.data);
      if (resultsJson.success) setRecentConductResults(resultsJson.data || []);
    } catch (err) {
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLaunchLiveSession = async (
    quizId: string,
    settings?: {
      questionTime?: number;
      maxParticipants?: number;
      speedScoring?: boolean;
      showCorrectAnswer?: boolean;
      showLeaderboard?: boolean;
      finalPodium?: boolean;
    }
  ) => {
    try {
      const res = await fetch('/api/v1/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          sessionType: 'LIVE_GAME',
          questionTime: settings?.questionTime || 20,
          maxParticipants: settings?.maxParticipants || 200,
          speedScoring: settings?.speedScoring !== false,
          showCorrectAnswer: settings?.showCorrectAnswer !== false,
          showLeaderboard: settings?.showLeaderboard !== false,
          finalPodium: settings?.finalPodium !== false,
        }),
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

  // Categories list
  const categoriesList = Array.from(new Set((quizzes || []).map((q) => q?.category).filter(Boolean)));

  // Safe Date Formatter helper
  const formatDateSafe = (dateVal: any, fallback = '06 Sep 2026') => {
    if (!dateVal) return fallback;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return fallback;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return fallback;
    }
  };

  // Filter quizzes for overview
  const filteredQuizzes = (quizzes || []).filter((q) => {
    if (!q) return false;
    const titleText = (q.title || '').toLowerCase();
    const categoryText = (q.category || '').toLowerCase();
    const search = (searchQuery || '').toLowerCase();

    const matchesSearch = titleText.includes(search) || categoryText.includes(search);
    const matchesCategory = selectedCategory === 'ALL' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / itemsPerPage));
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter & Sort quizzes for Quizzes Tab
  const filteredQuizzesTab = (quizzes || []).filter((q) => {
    if (!q) return false;
    const search = (quizzesTabSearch || '').toLowerCase();
    const matchesSearch =
      !search ||
      (q.title || '').toLowerCase().includes(search) ||
      (q.category || '').toLowerCase().includes(search) ||
      (q.description || '').toLowerCase().includes(search);

    const matchesCategory = quizzesTabCategory === 'ALL' || q.category === quizzesTabCategory;
    const matchesStatus = quizzesTabStatus === 'ALL' || (q.status || 'READY') === quizzesTabStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedQuizzesTab = [...filteredQuizzesTab].sort((a, b) => {
    if (quizzesTabSortBy === 'TITLE') return (a.title || '').localeCompare(b.title || '');
    if (quizzesTabSortBy === 'QUESTIONS') return (b.questionIds?.length || 0) - (a.questionIds?.length || 0);
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  const totalQuizzesTabPages = Math.max(1, Math.ceil(sortedQuizzesTab.length / quizzesTabItemsPerPage));
  const paginatedQuizzesTab = sortedQuizzesTab.slice(
    (quizzesTabPage - 1) * quizzesTabItemsPerPage,
    quizzesTabPage * quizzesTabItemsPerPage
  );

  const totalQuestionsCount = (quizzes || []).reduce((acc, q) => acc + (q?.questionIds?.length || 0), 0);

  // Category badge colors mapping
  const getCategoryBadgeClass = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('prompt')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (cat.includes('business') || cat.includes('ai')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (cat.includes('ml') || cat.includes('tech')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (cat.includes('fund') || cat.includes('basic')) return 'bg-pink-50 text-pink-700 border-pink-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  // Left Border Colors for Quiz Cards
  const getQuizCardBorderColor = (index: number) => {
    const borderColors = [
      'border-l-blue-500',
      'border-l-purple-500',
      'border-l-teal-500',
      'border-l-pink-500',
    ];
    return borderColors[index % borderColors.length];
  };

  // Thumbnail Icon for Quiz Cards
  const renderQuizIcon = (index: number, category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('prompt')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('business') || cat.includes('ai')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('ml') || cat.includes('tech')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
    );
  };

  if (viewingConductResultsCode) {
    return (
      <ConductQuizResultsView
        quizCode={viewingConductResultsCode}
        onClose={() => setViewingConductResultsCode(null)}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12">
      {/* Top Header Navbar matching reference design */}
      <header className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs px-5 py-3 flex items-center justify-between">
        {/* Left: Brand Identity with official logo */}
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Icon.png" alt="QuizArena Logo" className="w-9 h-9 object-contain" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Quiz<span className="text-blue-600">Arena</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-blue-600 tracking-wide">
              Learn • Assess • Grow
            </p>
          </div>
        </div>

        {/* Center: Navigation Pill Tabs */}
        <div className="hidden md:flex items-center bg-slate-100/90 border border-slate-200/80 p-1 rounded-full space-x-1 shadow-inner">
          {[
            { id: 'OVERVIEW', label: 'Dashboard', icon: BarChart3 },
            { id: 'QUESTION_BANK', label: 'Question Bank', icon: BookOpen },
            { id: 'QUIZZES', label: 'Quizzes', icon: ClipboardList },
            { id: 'ASSIGNMENTS', label: 'Assignments', icon: Send },
            { id: 'REPORTS', label: 'Reports', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center space-x-3">
          <button className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition relative shadow-xs">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
                  {user?.role || 'TRAINER'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name || 'Admin Trainer'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@quizarena.com'}</p>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab switch fallback for mobile screen widths */}
      <div className="flex md:hidden overflow-x-auto pb-1 space-x-1 border-b border-slate-200">
        {[
          { id: 'OVERVIEW', label: 'Dashboard' },
          { id: 'QUESTION_BANK', label: 'Question Bank' },
          { id: 'QUIZZES', label: 'Quizzes' },
          { id: 'ASSIGNMENTS', label: 'Assignments' },
          { id: 'REPORTS', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'QUESTION_BANK' && <QuestionBankView />}

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* TRAINER COMMAND CENTER Hero Banner */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/60 p-6 md:p-7 rounded-3xl border border-blue-100/90 shadow-xs relative overflow-hidden">
            {/* Background floating accent shapes */}
            <div className="absolute top-4 left-1/4 w-3 h-3 rounded-full bg-amber-400/40 animate-ping" />
            <div className="absolute bottom-6 left-1/3 w-4 h-4 rounded-sm bg-pink-400/40 rotate-12" />
            <div className="absolute top-8 right-1/3 w-3 h-3 rounded-full bg-emerald-400/40" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Command Center Text */}
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-extrabold tracking-widest text-blue-600 uppercase bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200/60">
                  TRAINER COMMAND CENTER
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Create. Assess. Engage.
                </h1>
                <p className="text-xs md:text-sm text-slate-600 font-medium">
                  Everything you need to run amazing learning experiences.
                </p>

                <div className="pt-2 flex items-center space-x-2">
                  <span className="font-serif italic text-blue-600 font-bold text-lg tracking-wide hover:scale-105 transition-transform inline-block">
                    Knowledge Builds Brighter Futures
                  </span>
                </div>
              </div>

              {/* 5 Quick Action Colorful Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
                {/* 1. Create Quiz */}
                <button
                  onClick={handleCreateNewQuiz}
                  className="bg-gradient-to-b from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-blue-400/30 flex flex-col justify-between h-36 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-left leading-tight">Create Quiz</h3>
                    <p className="text-[10px] text-blue-100 text-left line-clamp-2 mt-0.5 opacity-90">
                      Build engaging quizzes in minutes
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* 2. Import Questions */}
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="bg-gradient-to-b from-purple-500 to-indigo-600 text-white p-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-purple-400/30 flex flex-col justify-between h-36 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <FileSpreadsheet className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-left leading-tight">Import Questions</h3>
                    <p className="text-[10px] text-purple-100 text-left line-clamp-2 mt-0.5 opacity-90">
                      Add from Excel or Word
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* 3. Assign Quiz */}
                <button
                  onClick={() => setIsAssignOpen(true)}
                  className="bg-gradient-to-b from-teal-400 to-emerald-500 text-white p-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-teal-300/30 flex flex-col justify-between h-36 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Send className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-left leading-tight">Assign Quiz</h3>
                    <p className="text-[10px] text-teal-100 text-left line-clamp-2 mt-0.5 opacity-90">
                      Share with learners and track progress
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* 4. Conduct Quiz */}
                <button
                  onClick={() => handleOpenConductSetup()}
                  className="bg-gradient-to-b from-amber-400 to-orange-500 text-white p-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-amber-300/30 flex flex-col justify-between h-36 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <ClipboardList className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-left leading-tight">Conduct Quiz</h3>
                    <p className="text-[10px] text-amber-100 text-left line-clamp-2 mt-0.5 opacity-90">
                      Run structured assessment
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* 5. Start Live Game */}
                <button
                  onClick={() => {
                    if (quizzes.length > 0) {
                      handleOpenLiveSetup();
                    } else {
                      showToast('Please create or import a quiz first.', 'warning');
                    }
                  }}
                  className="bg-gradient-to-b from-pink-500 to-rose-600 text-white p-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-pink-400/30 flex flex-col justify-between h-36 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Radio className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-left leading-tight">Start Live Game</h3>
                    <p className="text-[10px] text-pink-100 text-left line-clamp-2 mt-0.5 opacity-90">
                      Real-time. Fun. Competitive.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Decorative Right Illustration Graphics */}
              <div className="hidden xl:flex flex-col items-center justify-center p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xs max-w-[160px] text-center">
                <div className="relative mb-2">
                  <Award className="w-10 h-10 text-amber-500 animate-bounce-light mx-auto" />
                  <div className="w-12 h-10 bg-blue-500/20 rounded-md -mt-2 mx-auto flex items-center justify-center text-[9px] font-black text-blue-800">
                    LEARN
                  </div>
                </div>
                <p className="text-[10px] font-serif italic text-blue-700 font-bold leading-tight">
                  Better Learners Brighter Tomorrows
                </p>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Quizzes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Total Quizzes</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{quizzes.length || 4}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +2 this month
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-4 bg-blue-200 rounded-t" />
                <div className="w-1.5 h-6 bg-blue-300 rounded-t" />
                <div className="w-1.5 h-5 bg-blue-400 rounded-t" />
                <div className="w-1.5 h-8 bg-blue-600 rounded-t" />
              </div>
            </div>

            {/* Card 2: Question Bank */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Question Bank</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{totalQuestionsCount || 152}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +18 new questions
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-3 bg-purple-200 rounded-t" />
                <div className="w-1.5 h-5 bg-purple-300 rounded-t" />
                <div className="w-1.5 h-7 bg-purple-400 rounded-t" />
                <div className="w-1.5 h-9 bg-purple-600 rounded-t" />
              </div>
            </div>

            {/* Card 3: Active Assignments */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Active Assignments</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{assignments.length || 6}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +3 this month
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-4 bg-teal-200 rounded-t" />
                <div className="w-1.5 h-6 bg-teal-300 rounded-t" />
                <div className="w-1.5 h-8 bg-teal-500 rounded-t" />
                <div className="w-1.5 h-5 bg-teal-300 rounded-t" />
              </div>
            </div>

            {/* Card 4: Conduct Reports */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Conduct Reports</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{recentConductResults.length || 12}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +5 this month
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-5 bg-amber-200 rounded-t" />
                <div className="w-1.5 h-7 bg-amber-300 rounded-t" />
                <div className="w-1.5 h-4 bg-amber-400 rounded-t" />
                <div className="w-1.5 h-8 bg-amber-500 rounded-t" />
              </div>
            </div>

            {/* Card 5: Inspirational Quote Card */}
            <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl shadow-xs flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
              <span className="text-4xl font-serif text-blue-400 font-bold leading-none select-none">
                “
              </span>
              <p className="text-xs font-serif italic text-slate-700 font-medium leading-relaxed">
                Small quizzes create big opportunities.
              </p>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Recent Activity & Need Inspiration) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Recent Activity */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('REPORTS')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Activity Item 1 */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-tight">New quiz created</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Activity 4: Prompt Engineering Challenge
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">2 hours ago</span>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-tight">Imported 25 questions</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">AI Fundamentals</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">5 hours ago</span>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-tight">Assigned quiz</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Activity 3: AI Business Capabilities
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">1 day ago</span>
                  </div>

                  {/* Activity Item 4 */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-tight">Conducted quiz</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Activity 2: AI Technology Detective
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">1 day ago</span>
                  </div>

                  {/* Activity Item 5 */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-tight">Live game completed</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">Activity 1: AI or Not?</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">2 days ago</span>
                  </div>
                </div>
              </div>

              {/* Need some inspiration? */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 p-5 rounded-2xl border border-blue-100/90 shadow-xs flex items-center justify-between">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <h4 className="text-xs font-extrabold text-blue-900">Need some inspiration?</h4>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Explore sample quizzes and question templates.
                  </p>
                </div>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap flex items-center space-x-1"
                >
                  <span>Browse Templates</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Column (Your Quizzes Data Table) */}
            <div className="lg:col-span-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">Your Quizzes</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Create Button */}
                    <button
                      onClick={handleCreateNewQuiz}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Quiz</span>
                    </button>
                  </div>
                </div>

                {/* Table View */}
                {loading ? (
                  <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                ) : filteredQuizzes.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    No quizzes found matching your search criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="pb-3 px-2">Quiz Title</th>
                          <th className="pb-3 px-2">Category</th>
                          <th className="pb-3 px-2">Questions</th>
                          <th className="pb-3 px-2">Last Modified</th>
                          <th className="pb-3 px-2">Status</th>
                          <th className="pb-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedQuizzes.map((quiz) => {
                          const modifiedDate = formatDateSafe(quiz.updatedAt);

                          return (
                            <tr key={quiz._id} className="hover:bg-slate-50/70 transition">
                              {/* Quiz Title with Icon Thumbnail */}
                              <td className="py-3 px-2">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-bold text-slate-900 leading-tight">
                                    {quiz.title}
                                  </span>
                                </div>
                              </td>

                              {/* Category Badge */}
                              <td className="py-3 px-2">
                                <span
                                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadgeClass(
                                    quiz.category
                                  )}`}
                                >
                                  {quiz.category || 'General'}
                                </span>
                              </td>

                              {/* Question Count */}
                              <td className="py-3 px-2 font-bold text-slate-700">
                                {quiz.questionIds?.length || 0}
                              </td>

                              {/* Last Modified */}
                              <td className="py-3 px-2 text-slate-500 font-medium">
                                {modifiedDate}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                                  Ready
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-2 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => handleEditQuiz(quiz)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg transition flex items-center space-x-1"
                                  >
                                    <Edit className="w-3 h-3 text-amber-600" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => setIsAssignOpen(true)}
                                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold rounded-lg transition flex items-center space-x-1"
                                  >
                                    <Send className="w-3 h-3 text-purple-600" />
                                    <span>Assign</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenConductSetup(quiz)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition flex items-center space-x-1 shadow-xs"
                                  >
                                    <ClipboardList className="w-3 h-3" />
                                    <span>Conduct</span>
                                  </button>

                                  <button
                                    onClick={() => handleLaunchLiveSession(quiz._id)}
                                    className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-[11px] font-extrabold rounded-lg transition flex items-center space-x-1 shadow-xs"
                                  >
                                    <Radio className="w-3 h-3" />
                                    <span>Live</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteQuiz(quiz)}
                                    title="Delete Quiz"
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    Showing {Math.min(1, filteredQuizzes.length)} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredQuizzes.length)} of{' '}
                    {filteredQuizzes.length} quizzes
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentPage}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding Bar */}
          <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-3">
              <img src="/QuizArena Icon.png" alt="QuizArena" className="w-6 h-6 object-contain" />
              <div className="flex items-center space-x-1 font-bold text-slate-700">
                <span>QuizArena</span>
                <span className="text-[10px] text-slate-400 font-normal">By</span>
                <img src="/KVJ analytics Logo.png" alt="KVJ Analytics" className="h-4 object-contain ml-1" />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
              <span>Play</span>
              <span>•</span>
              <span>Learn</span>
              <span>•</span>
              <span>Grow</span>
              <span>•</span>
              <span>Together</span>
              <div className="w-8 h-1 bg-amber-400 rounded-full ml-1" />
            </div>
          </footer>
        </div>
      )}

      {/* QUIZZES TAB View matching reference image */}
      {activeTab === 'QUIZZES' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Quizzes</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Create, manage, and deliver engaging quizzes for your learners.
                </p>
              </div>
            </div>

            {/* Right Cursive quote & trophy badge */}
            <div className="hidden lg:flex items-center space-x-3 bg-blue-50/70 border border-blue-200/80 px-4 py-2 rounded-2xl">
              <span className="font-serif italic text-blue-700 font-bold text-sm">
                Small Quizzes Create Big Opportunities
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                <Award className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 5 Metrics Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Total Quizzes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Total Quizzes</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{quizzes.length || 4}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +2 this month
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-4 bg-blue-200 rounded-t" />
                <div className="w-1.5 h-6 bg-blue-300 rounded-t" />
                <div className="w-1.5 h-5 bg-blue-400 rounded-t" />
                <div className="w-1.5 h-8 bg-blue-600 rounded-t" />
              </div>
            </div>

            {/* 2. Conducted Quizzes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Conducted Quizzes</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{recentConductResults.length || 7}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +3 this month
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-3 bg-purple-200 rounded-t" />
                <div className="w-1.5 h-5 bg-purple-300 rounded-t" />
                <div className="w-1.5 h-7 bg-purple-400 rounded-t" />
                <div className="w-1.5 h-9 bg-purple-600 rounded-t" />
              </div>
            </div>

            {/* 3. Total Questions */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Total Questions</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{totalQuestionsCount || 37}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                    ▲ +12 this month
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-4 bg-teal-200 rounded-t" />
                <div className="w-1.5 h-6 bg-teal-300 rounded-t" />
                <div className="w-1.5 h-8 bg-teal-500 rounded-t" />
                <div className="w-1.5 h-5 bg-teal-300 rounded-t" />
              </div>
            </div>

            {/* 4. Assignments */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">Assignments</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">{assignments.length || 0}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center">
                    No change
                  </span>
                </div>
              </div>
              <div className="flex items-end space-x-1 h-9 pt-2">
                <div className="w-1.5 h-5 bg-amber-200 rounded-t" />
                <div className="w-1.5 h-4 bg-amber-300 rounded-t" />
                <div className="w-1.5 h-6 bg-amber-400 rounded-t" />
                <div className="w-1.5 h-3 bg-amber-200 rounded-t" />
              </div>
            </div>

            {/* 5. Quote Card */}
            <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl shadow-xs flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
              <span className="text-4xl font-serif text-blue-400 font-bold leading-none select-none">
                “
              </span>
              <p className="text-xs font-serif italic text-slate-700 font-medium leading-relaxed">
                Assess today for a brighter tomorrow.
              </p>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search quizzes by title, category, or keyword..."
                  value={quizzesTabSearch}
                  onChange={(e) => {
                    setQuizzesTabSearch(e.target.value);
                    setQuizzesTabPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium placeholder-slate-400"
                />
              </div>

              {/* Category Filter */}
              <select
                value={quizzesTabCategory}
                onChange={(e) => {
                  setQuizzesTabCategory(e.target.value);
                  setQuizzesTabPage(1);
                }}
                className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={quizzesTabStatus}
                onChange={(e) => {
                  setQuizzesTabStatus(e.target.value);
                  setQuizzesTabPage(1);
                }}
                className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="READY">Ready</option>
                <option value="DRAFT">Draft</option>
              </select>

              {/* Sort By Filter */}
              <div className="flex items-center space-x-1 text-xs text-slate-500 w-full md:w-auto">
                <span className="font-semibold whitespace-nowrap">Sort by</span>
                <select
                  value={quizzesTabSortBy}
                  onChange={(e) => setQuizzesTabSortBy(e.target.value as any)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="LAST_MODIFIED">Last Modified</option>
                  <option value="TITLE">Title Alphabetical</option>
                  <option value="QUESTIONS">Questions Count</option>
                </select>
              </div>

              {/* Create Quiz Button */}
              <button
                onClick={handleCreateNewQuiz}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center space-x-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quiz</span>
              </button>
            </div>
          </div>

          {/* Quizzes Grid Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h2 className="text-base font-black text-slate-900">
              All Quizzes ({sortedQuizzesTab.length})
            </h2>

            {/* View Switcher */}
            <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center space-x-0.5 self-start sm:self-auto">
              <button
                onClick={() => setQuizzesTabViewMode('GRID')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  quizzesTabViewMode === 'GRID'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setQuizzesTabViewMode('LIST')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  quizzesTabViewMode === 'LIST'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {/* Quizzes Listing */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sortedQuizzesTab.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No quizzes found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No quizzes match your filter criteria. Build a new quiz to get started.
              </p>
            </div>
          ) : quizzesTabViewMode === 'GRID' ? (
            /* Grid View matching reference design */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedQuizzesTab.map((quiz, index) => {
                const modifiedDate = formatDateSafe(quiz.updatedAt);

                return (
                  <div
                    key={quiz._id}
                    className={`bg-white p-5 rounded-2xl border border-slate-200 border-l-4 ${getQuizCardBorderColor(
                      index
                    )} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
                  >
                    <div className="space-y-3">
                      {/* Top Title Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          {renderQuizIcon(index, quiz.category)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                                {quiz.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                            {quiz.status || 'READY'}
                          </span>
                          <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {quiz.description ||
                          'Evaluate learner capabilities across structured assessment modules, core concepts, and practical tasks.'}
                      </p>

                      {/* Category Pill & Metadata */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadgeClass(
                            quiz.category
                          )}`}
                        >
                          {quiz.category || 'General'}
                        </span>

                        <span className="flex items-center space-x-1 text-[11px] text-slate-500 font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          <span>{quiz.questionIds?.length || 5} Questions</span>
                        </span>

                        <span className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Updated {modifiedDate}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setIsAssignOpen(true)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                        >
                          <Send className="w-3.5 h-3.5 text-purple-600" />
                          <span>Assign</span>
                        </button>

                        <button
                          onClick={() => handleOpenConductSetup(quiz)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-xs"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Conduct Quiz</span>
                        </button>

                        <button
                          onClick={() => handleLaunchLiveSession(quiz._id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-xs font-extrabold rounded-xl transition flex items-center space-x-1 shadow-xs"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Live Game</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteQuiz(quiz)}
                        title="Delete Quiz"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 px-2">Quiz Title</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Questions</th>
                    <th className="pb-3 px-2">Last Modified</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedQuizzesTab.map((quiz) => {
                    const modifiedDate = formatDateSafe(quiz.updatedAt);

                    return (
                      <tr key={quiz._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-2 font-bold text-slate-900">{quiz.title}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadgeClass(
                              quiz.category
                            )}`}
                          >
                            {quiz.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-700">
                          {quiz.questionIds?.length || 0}
                        </td>
                        <td className="py-3 px-2 text-slate-500 font-medium">{modifiedDate}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                            Ready
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleEditQuiz(quiz)}
                              className="px-2 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-md"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setIsAssignOpen(true)}
                              className="px-2 py-1 bg-purple-50 text-purple-800 text-[11px] font-bold rounded-md"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => handleOpenConductSetup(quiz)}
                              className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-md"
                            >
                              Conduct
                            </button>
                            <button
                              onClick={() => handleLaunchLiveSession(quiz._id)}
                              className="px-2.5 py-1 bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-md"
                            >
                              Live
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span>
              Showing {Math.min(1, sortedQuizzesTab.length)} -{' '}
              {Math.min(quizzesTabPage * quizzesTabItemsPerPage, sortedQuizzesTab.length)} of{' '}
              {sortedQuizzesTab.length} quizzes
            </span>

            <div className="flex items-center space-x-1">
              <button
                disabled={quizzesTabPage === 1}
                onClick={() => setQuizzesTabPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {quizzesTabPage}
              </span>
              <button
                disabled={quizzesTabPage >= totalQuizzesTabPages}
                onClick={() => setQuizzesTabPage((p) => Math.min(totalQuizzesTabPages, p + 1))}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
                      Assigned to {a.studentEmails?.length || 0} student(s) • Due: {formatDateSafe(a.dueDate)}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                    {a.studentEmails?.length || 0} Assigned
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Conduct Quiz Reports</h2>
          {recentConductResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No conduct reports generated yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentConductResults.map((res) => (
                <div
                  key={res._id || res.quizCode}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-600">CODE: {res.quizCode}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDateSafe(res.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 mt-1 line-clamp-1">{res.quizTitle}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {res.totalParticipants || 0} Trainees • Avg Score: {res.averageScore || 0}
                    </p>
                  </div>

                  <button
                    onClick={() => setViewingConductResultsCode(res.quizCode)}
                    className="w-full py-1.5 bg-white border border-slate-200 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-lg transition text-center shadow-xs"
                  >
                    VIEW REPORT
                  </button>
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
        onClose={() => {
          setIsCreateQuizOpen(false);
          setEditingQuiz(null);
        }}
        initialQuiz={editingQuiz}
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
      <LiveGameSetupModal
        isOpen={isLiveSetupOpen}
        onClose={() => setIsLiveSetupOpen(false)}
        quizzes={quizzes}
        initialQuiz={selectedQuizForLive}
        onLaunchLiveGame={(quizId, settings) => handleLaunchLiveSession(quizId, settings)}
      />
    </div>
  );
};
