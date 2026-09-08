'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
  Edit,
  Clock,
  Award,
  X,
  BookOpen,
  Lightbulb,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  FolderKanban,
  Sparkles,
  BarChart3,
  User,
  Calendar,
  Download,
  Check,
  Tag,
  CheckSquare,
} from 'lucide-react';
import { IQuestion } from '@/types';
import { useToast } from '../ui/ToastNotification';
import { ImportWizard } from './ImportWizard';

export const QuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [sortBy, setSortBy] = useState<'RECENT' | 'OLDEST' | 'CATEGORY' | 'DIFFICULTY'>('RECENT');
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');

  // Multi-selection & Pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<IQuestion | null>(null);

  // Question Form State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newCategory, setNewCategory] = useState('Prompt Engineering');
  const [newDifficulty, setNewDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [newTimeLimit, setNewTimeLimit] = useState(20);
  const [newPoints, setNewPoints] = useState(1000);
  const [newExplanation, setNewExplanation] = useState('');

  const { showToast } = useToast();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/questions');
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data || []);
      }
    } catch (err) {
      showToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedDifficulty('');
    setSelectedCreator('');
    setSortBy('RECENT');
    setCurrentPage(1);
    showToast('Filters reset', 'info');
  };

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewCorrectIndex(0);
    setNewCategory('Prompt Engineering');
    setNewDifficulty('MEDIUM');
    setNewTimeLimit(20);
    setNewPoints(1000);
    setNewExplanation('');
    setIsCreateOpen(true);
  };

  const handleOpenEditModal = (q: IQuestion) => {
    setEditingQuestion(q);
    setNewQuestionText(q.questionText);
    setNewOptions(q.options ? [...q.options] : ['', '', '', '']);
    setNewCorrectIndex(q.correctOptionIndex || 0);
    setNewCategory(q.category || 'Prompt Engineering');
    setNewDifficulty((q.difficulty as any) || 'MEDIUM');
    setNewTimeLimit(q.timeLimit || 20);
    setNewPoints(q.points || 1000);
    setNewExplanation(q.explanation || '');
    setIsCreateOpen(true);
  };

  const handleDeleteQuestion = async (q: IQuestion) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/v1/questions?id=${q._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Question deleted successfully', 'info');
        fetchQuestions();
      } else {
        showToast(json.error?.message || 'Failed to delete question', 'error');
      }
    } catch (err) {
      showToast('Error deleting question', 'error');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some((o) => !o.trim())) {
      showToast('Please fill in question text and all options.', 'warning');
      return;
    }

    try {
      const payload = {
        questionText: newQuestionText,
        options: newOptions,
        correctOptionIndex: newCorrectIndex,
        category: newCategory,
        difficulty: newDifficulty,
        timeLimit: newTimeLimit,
        points: newPoints,
        explanation: newExplanation,
      };

      let res;
      if (editingQuestion) {
        res = await fetch(`/api/v1/questions?id=${editingQuestion._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/v1/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(
          editingQuestion ? 'Question updated successfully!' : 'Question created successfully!',
          'success'
        );
        setIsCreateOpen(false);
        fetchQuestions();
      } else {
        showToast(json.error?.message || 'Failed to save question', 'error');
      }
    } catch (err) {
      showToast('Failed to save question', 'error');
    }
  };

  // Download Templates
  const handleDownloadExcelTemplate = () => {
    const csvContent =
      'QuestionText,OptionA,OptionB,OptionC,OptionD,CorrectOptionIndex,Category,TimeLimit,Points\n' +
      '"Which prompt is most structured for API responses?","Act as backend...","Give me JSON","Write code","Can you format",0,"Prompt Engineering",20,1000\n' +
      '"Why is Chain of Thought prompting effective?","Forces step-by-step logic","Makes AI faster","Bypasses limits","Auto-translates",0,"Prompt Engineering",20,1000\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'QuizArena_Question_Bank_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Excel/CSV template downloaded!', 'success');
  };

  const handleDownloadWordTemplate = () => {
    const docContent =
      'QUIZARENA QUESTION BANK IMPORT TEMPLATE\n========================================\n\n' +
      'Format each question as below:\n\n' +
      'Q: Which prompt is most structured for API responses?\n' +
      'A) Act as backend engineer\n' +
      'B) Give me JSON data\n' +
      'C) Write code\n' +
      'D) Format response\n' +
      'Correct: A\n' +
      'Category: Prompt Engineering\n\n';

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'QuizArena_Question_Word_Template.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Word template downloaded!', 'success');
  };

  // Unique lists for filter dropdowns
  const categoriesList = Array.from(new Set((questions || []).map((q) => q?.category).filter(Boolean)));

  // Client-side Filter & Search Logic
  const filteredQuestions = (questions || []).filter((q) => {
    if (!q) return false;
    const searchTerm = (search || '').toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (q.questionText || '').toLowerCase().includes(searchTerm) ||
      (q.category || '').toLowerCase().includes(searchTerm) ||
      (Array.isArray(q.options) && q.options.some((opt) => (opt || '').toLowerCase().includes(searchTerm)));

    const matchesCategory = !selectedCategory || q.category === selectedCategory;
    const matchesType = !selectedType || (q.questionType || 'MCQ') === selectedType;
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

  // Sorting logic
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'OLDEST') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    if (sortBy === 'CATEGORY') return (a.category || '').localeCompare(b.category || '');
    if (sortBy === 'DIFFICULTY') return (a.difficulty || '').localeCompare(b.difficulty || '');
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / itemsPerPage));
  const paginatedQuestions = sortedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedQuestions.map((q) => q._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Card Left Border Accent Color Mapping
  const getCardBorderColor = (index: number) => {
    const colors = [
      'border-l-blue-500',
      'border-l-purple-500',
      'border-l-teal-500',
      'border-l-amber-500',
      'border-l-pink-500',
    ];
    return colors[index % colors.length];
  };

  // Category Badge Colors Mapping
  const getCategoryBadgeClass = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('prompt')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (cat.includes('business') || cat.includes('ai')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (cat.includes('ml') || cat.includes('tech')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Question Bank</h1>
            <p className="text-xs text-slate-500 font-medium">
              Create, manage, and organize reusable assessment questions for your quizzes.
            </p>
          </div>
        </div>

        {/* Cursive quote & lightbulb graphic */}
        <div className="hidden lg:flex items-center space-x-3 bg-amber-50/70 border border-amber-200/80 px-4 py-2 rounded-2xl">
          <span className="font-serif italic text-blue-700 font-bold text-sm">
            Better Questions Brighter Learners
          </span>
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs animate-pulse">
            <Lightbulb className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>

      {/* 2. Top Stats & Action Buttons Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 4 Stat Summary Cards (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Questions */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight">
                {questions.length || 152}
              </p>
              <p className="text-[10px] text-slate-500 font-bold">Total Questions</p>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm">
                ▲ +18 this month
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight">
                {categoriesList.length || 8}
              </p>
              <p className="text-[10px] text-slate-500 font-bold">Categories</p>
            </div>
          </div>

          {/* Question Types */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight">4</p>
              <p className="text-[10px] text-slate-500 font-bold">Question Types</p>
            </div>
          </div>

          {/* Recently Added */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight">
                {Math.min(5, questions.length)}
              </p>
              <p className="text-[10px] text-slate-500 font-bold">Recently Added</p>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm">
                ▲ +5 this week
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          {/* Row 1 Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Question</span>
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel</span>
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Import Word</span>
            </button>
          </div>

          {/* Row 2 Downloads */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadExcelTemplate}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3 text-blue-600" />
              <span>Download Excel Template</span>
            </button>
            <button
              onClick={handleDownloadWordTemplate}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3 text-blue-600" />
              <span>Download Word Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search questions by text, keyword, or tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium placeholder-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Reset Filters Button */}
          <button
            onClick={handleResetFilters}
            className="w-full md:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1 border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. Questions Header Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <h2 className="text-base font-black text-slate-900">
          Questions ({sortedQuestions.length})
        </h2>

        <div className="flex items-center space-x-3">
          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <span className="font-semibold">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none shadow-xs"
            >
              <option value="RECENT">Recently Added</option>
              <option value="OLDEST">Oldest First</option>
              <option value="CATEGORY">Category</option>
              <option value="DIFFICULTY">Difficulty</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center space-x-0.5">
            <button
              onClick={() => setViewMode('CARD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'CARD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'TABLE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Question Items (Card View or Table View) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No questions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or create/import new questions.
          </p>
        </div>
      ) : viewMode === 'CARD' ? (
        /* Card View Listing matching reference design with high-quality UI/UX */
        <div className="space-y-4">
          {paginatedQuestions.map((q, index) => {
            const questionCode = `Q${String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, '0')}`;
            let modifiedDate = '05 Sept 2026';
            if (q.updatedAt) {
              try {
                const d = new Date(q.updatedAt);
                if (!isNaN(d.getTime())) {
                  modifiedDate = d.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                }
              } catch (e) {}
            }

            return (
              <div
                key={q._id}
                className={`bg-white p-5 md:p-6 rounded-3xl border border-slate-200 border-l-4 ${getCardBorderColor(
                  index
                )} shadow-xs hover:shadow-md transition-all duration-200 space-y-4 relative`}
              >
                {/* Header Row: Checkbox, Code, Question Statement & MCQ Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q._id)}
                      onChange={() => toggleSelectOne(q._id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />

                    {/* Code Badge */}
                    <span className="px-2.5 py-1 text-xs font-black font-mono text-blue-700 bg-blue-50/90 rounded-xl border border-blue-200/70 shrink-0 shadow-xs">
                      {questionCode}
                    </span>

                    {/* Question Statement */}
                    <h3 className="text-sm md:text-base font-black text-slate-900 leading-snug tracking-tight">
                      {q.questionText}
                    </h3>
                  </div>

                  {/* Top Right Type Badge */}
                  <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                    <span className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-100/90 text-emerald-800 rounded-full border border-emerald-200/60">
                      {q.questionType || 'MCQ'}
                    </span>
                  </div>
                </div>

                {/* 4 Options Grid (2 columns on tablet/desktop for max readability) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 sm:pl-10">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctOptionIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl text-xs leading-relaxed transition-all flex items-center justify-between border ${
                          isCorrect
                            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-xs'
                            : 'bg-slate-50/80 border-slate-200/80 text-slate-700 font-medium hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-start space-x-2 min-w-0 pr-2">
                          <span className={`font-black shrink-0 ${isCorrect ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="break-words">{opt}</span>
                        </div>

                        {isCorrect && (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0 ml-2">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Metadata & Action Buttons Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-100 sm:pl-10 text-xs">
                  {/* Category & Tags Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 text-[11px] font-extrabold rounded-full border shadow-xs ${getCategoryBadgeClass(
                        q.category
                      )}`}
                    >
                      {q.category || 'Prompt Engineering'}
                    </span>

                    <span className="flex items-center space-x-1 text-[11px] text-slate-500 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{q.timeLimit || 20} sec</span>
                    </span>

                    <span className="flex items-center space-x-1 text-[11px] text-slate-500 font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{q.points || 1000} pts</span>
                    </span>

                    <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg shadow-xs">
                      📊 {q.difficulty || 'MEDIUM'}
                    </span>

                    <span className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Admin</span>
                    </span>

                    <span className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{modifiedDate}</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 justify-end">
                    <button
                      onClick={() => setPreviewQuestion(q)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Listing */
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 px-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedQuestions.length && paginatedQuestions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded-md border-slate-300"
                  />
                </th>
                <th className="pb-3 px-2">Code</th>
                <th className="pb-3 px-2">Question Statement</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">Difficulty</th>
                <th className="pb-3 px-2">Time</th>
                <th className="pb-3 px-2">Points</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuestions.map((q, index) => {
                const questionCode = `Q${String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, '0')}`;
                return (
                  <tr key={q._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(q._id)}
                        onChange={() => toggleSelectOne(q._id)}
                        className="w-4 h-4 text-blue-600 rounded-md border-slate-300"
                      />
                    </td>
                    <td className="py-3 px-2 font-black text-blue-700">{questionCode}</td>
                    <td className="py-3 px-2 font-bold text-slate-900 max-w-md truncate">
                      {q.questionText}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-800 rounded-full">
                        {q.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-700">
                      {q.difficulty || 'Medium'}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-600">{q.timeLimit || 20}s</td>
                    <td className="py-3 px-2 font-bold text-amber-600">{q.points || 1000}</td>
                    <td className="py-3 px-2 text-right space-x-1">
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-2 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        className="px-2 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <span>
          Showing {Math.min(1, sortedQuestions.length)} -{' '}
          {Math.min(currentPage * itemsPerPage, sortedQuestions.length)} of {sortedQuestions.length}{' '}
          questions
        </span>

        <div className="flex items-center space-x-3">
          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs transition ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Items Per Page Select */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Import Wizard Modal */}
      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchQuestions()}
      />

      {/* Question Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Question Preview ({previewQuestion.category || 'General'})
              </span>
              <button onClick={() => setPreviewQuestion(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">{previewQuestion.questionText}</h3>

              <div className="space-y-2">
                {previewQuestion.options?.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-sm font-medium ${
                      idx === previewQuestion.correctOptionIndex
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>
                      <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong>
                      {opt}
                    </span>
                    {idx === previewQuestion.correctOptionIndex && (
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {previewQuestion.explanation && (
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                  <p className="font-bold text-blue-950">Explanation:</p>
                  <p>{previewQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Question Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Statement</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter the question statement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Answer Choices (Select Correct Choice)
                </label>
                <div className="space-y-2">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={newCorrectIndex === i}
                        onChange={() => setNewCorrectIndex(i)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="font-bold text-slate-500 w-4">{String.fromCharCode(65 + i)}:</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const copy = [...newOptions];
                          copy[i] = e.target.value;
                          setNewOptions(copy);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time (Sec)</label>
                  <input
                    type="number"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Optional Explanation</label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explanation shown after answer reveal..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20"
              >
                {editingQuestion ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
