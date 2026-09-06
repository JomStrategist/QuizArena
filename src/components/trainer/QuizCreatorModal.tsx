'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  BookOpen,
  Edit,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Clock,
  Award,
  Sparkles,
  Image as ImageIcon,
  Rocket,
  HelpCircle,
  FolderKanban,
  MoreVertical,
  GripVertical,
  CheckCircle2,
} from 'lucide-react';
import { IQuestion, IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface QuizCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuiz?: IQuiz | null;
  onQuizCreated: (quiz: IQuiz) => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({
  isOpen,
  onClose,
  initialQuiz,
  onQuizCreated,
}) => {
  // Quiz Details State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Prompt Engineering');
  const [coverUrl, setCoverUrl] = useState('');

  // Questions List in this Quiz (Full Question objects for direct editing)
  const [quizQuestions, setQuizQuestions] = useState<IQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Available Bank Questions for picking/adding
  const [availableBankQuestions, setAvailableBankQuestions] = useState<IQuestion[]>([]);
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);

  // Question Preview modal state
  const [previewingQuestion, setPreviewingQuestion] = useState<IQuestion | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchBankQuestions();
      if (initialQuiz) {
        setTitle(initialQuiz.title || '');
        setDescription(initialQuiz.description || '');
        setCategory(initialQuiz.category || 'Prompt Engineering');

        // Extract populated questions if available
        if (initialQuiz.questions && Array.isArray(initialQuiz.questions) && initialQuiz.questions.length > 0) {
          setQuizQuestions(initialQuiz.questions.map(q => ({ ...q })));
        } else if (initialQuiz.questionIds && Array.isArray(initialQuiz.questionIds)) {
          fetchQuizQuestionsByIds(
            initialQuiz.questionIds.map((item: any) => (typeof item === 'string' ? item : item._id))
          );
        } else {
          setQuizQuestions([]);
        }
      } else {
        setTitle('Activity 4: Prompt Engineering Challenge');
        setDescription('Master prompt design principles including Role definition, Context setting, Task instructions, Constraints, and Output formatting.');
        setCategory('Prompt Engineering');
        // Initial sample question matching design if blank
        setQuizQuestions([
          {
            _id: 'temp-1',
            trainerId: 'trainer-1',
            questionText: 'Which prompt is the most structured and effective for generating a JSON API response?',
            questionType: 'MCQ',
            options: [
              'Act as a backend engineer. Convert the requirements to an API and provide the JSON.',
              'Give me JSON data for a user.',
              'Write some code for an API.',
              'Can you format a user nicely?',
            ],
            correctOptionIndex: 0,
            timeLimit: 20,
            points: 1000,
            category: 'Prompt Engineering',
            difficulty: 'MEDIUM',
            tags: [],
            explanation: 'This is the most structured prompt as it defines a role, task, and expected output format clearly.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      setActiveQuestionIndex(0);
    }
  }, [isOpen, initialQuiz]);

  const fetchBankQuestions = async () => {
    try {
      const res = await fetch('/api/v1/questions');
      const json = await res.json();
      if (json.success) {
        setAvailableBankQuestions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load question bank', err);
    }
  };

  const fetchQuizQuestionsByIds = async (ids: string[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/questions');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const matched = json.data.filter((q: IQuestion) => ids.includes(q._id));
        setQuizQuestions(matched);
      }
    } catch (err) {
      showToast('Failed to load quiz questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Active question being edited right now
  const currentQuestion = quizQuestions[activeQuestionIndex] || null;

  // Add new blank question
  const handleAddNewBlankQuestion = () => {
    const newQ: IQuestion = {
      _id: `temp-${Date.now()}`,
      trainerId: 'trainer-1',
      questionText: `New Question ${quizQuestions.length + 1}`,
      questionType: 'MCQ',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      timeLimit: 20,
      points: 1000,
      category: category || 'Prompt Engineering',
      difficulty: 'MEDIUM',
      tags: [],
      explanation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...quizQuestions, newQ];
    setQuizQuestions(updated);
    setActiveQuestionIndex(updated.length - 1);
  };

  // Add option to current active question
  const handleAddOption = () => {
    if (!currentQuestion) return;
    if (currentQuestion.options.length >= 6) {
      showToast('Maximum 6 options allowed.', 'warning');
      return;
    }
    const updatedOpts = [...currentQuestion.options, `Option ${String.fromCharCode(65 + currentQuestion.options.length)}`];
    updateCurrentQuestion({ options: updatedOpts });
  };

  // Remove option from current active question
  const handleRemoveOption = (indexToRemove: number) => {
    if (!currentQuestion) return;
    if (currentQuestion.options.length <= 2) {
      showToast('At least 2 options required.', 'warning');
      return;
    }
    const updatedOpts = currentQuestion.options.filter((_, idx) => idx !== indexToRemove);
    let newCorrect = currentQuestion.correctOptionIndex;
    if (indexToRemove === newCorrect) {
      newCorrect = 0;
    } else if (indexToRemove < newCorrect) {
      newCorrect = newCorrect - 1;
    }
    updateCurrentQuestion({ options: updatedOpts, correctOptionIndex: newCorrect });
  };

  // Delete current question
  const handleDeleteCurrentQuestion = (indexToDelete: number) => {
    if (quizQuestions.length <= 1) {
      showToast('A quiz must have at least 1 question.', 'warning');
      return;
    }
    const updated = quizQuestions.filter((_, i) => i !== indexToDelete);
    setQuizQuestions(updated);
    setActiveQuestionIndex(Math.max(0, indexToDelete - 1));
    showToast('Question removed from quiz.', 'info');
  };

  // Helper to update current question object in state
  const updateCurrentQuestion = (fields: Partial<IQuestion>) => {
    setQuizQuestions((prev) => {
      const copy = [...prev];
      if (copy[activeQuestionIndex]) {
        copy[activeQuestionIndex] = { ...copy[activeQuestionIndex], ...fields };
      }
      return copy;
    });
  };

  // Calculate totals
  const totalPoints = quizQuestions.reduce((acc, q) => acc + (q.points || 1000), 0);
  const totalTimeSeconds = quizQuestions.reduce((acc, q) => acc + (q.timeLimit || 20), 0);
  const totalTimeMinutes = Math.max(1, Math.round(totalTimeSeconds / 60));

  // Submit Quiz & save questions to DB
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a quiz title.', 'warning');
      return;
    }
    if (quizQuestions.length === 0) {
      showToast('Please add at least 1 question.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save/Update individual questions into Question DB
      const questionIds: string[] = [];
      for (const q of quizQuestions) {
        if (q._id.startsWith('temp-')) {
          // Create new question in DB
          const qRes = await fetch('/api/v1/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              timeLimit: q.timeLimit,
              points: q.points,
              explanation: q.explanation,
              category: q.category || category,
              difficulty: q.difficulty || 'MEDIUM',
            }),
          });
          const qJson = await qRes.json();
          if (qJson.success) {
            questionIds.push(qJson.data._id);
          }
        } else {
          // Update existing question in DB
          await fetch(`/api/v1/questions?id=${q._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              timeLimit: q.timeLimit,
              points: q.points,
              explanation: q.explanation,
              category: q.category || category,
              difficulty: q.difficulty || 'MEDIUM',
            }),
          });
          questionIds.push(q._id);
        }
      }

      // 2. Create or Update Quiz object
      const method = initialQuiz ? 'PUT' : 'POST';
      const bodyPayload = initialQuiz
        ? {
            id: initialQuiz._id,
            title: title.trim(),
            description,
            category,
            questionIds,
            status: 'READY',
          }
        : {
            title: title.trim(),
            description,
            category,
            questionIds,
            status: 'READY',
          };

      const res = await fetch('/api/v1/quizzes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `Failed to save quiz.`);
      }

      showToast(`Quiz "${title}" saved successfully!`, 'success');
      onQuizCreated(json.data);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error saving quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!initialQuiz;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-slate-50/95 rounded-3xl border border-slate-200 w-full max-w-6xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-bold rounded-xl transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Quizzes</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center shadow-xs">
                <Edit className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black text-slate-900">
                    {isEditing ? 'Edit Quiz' : 'Create Quiz'}
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                    READY
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Update quiz details, manage questions, and customize settings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-slate-400 font-bold">Last updated</p>
              <p className="text-xs font-bold text-slate-700">06 Sep 2026, 10:30 AM</p>
              <p className="text-[10px] text-slate-400 font-medium">by Admin</p>
            </div>

            {/* Banner Cursive Slogan */}
            <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3.5 py-1.5 rounded-2xl border border-blue-100">
              <span className="font-serif italic text-blue-700 font-bold text-xs">
                Create Engaging Quizzes for Brighter Minds
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Quiz Details Bar & Stat Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            {/* Title, Category & Description (8 Cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Quiz Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Activity 4: Prompt Engineering Challenge"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Prompt Engineering">Prompt Engineering</option>
                    <option value="AI Business Applications">AI Business Applications</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="AI Fundamentals">AI Fundamentals</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-extrabold text-slate-700">Description</label>
                  <span className="text-[10px] text-slate-400 font-semibold">{description.length}/500</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Master prompt design principles including Role definition, Context setting, Task instructions, Constraints, and Output formatting."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>

            {/* Metric Stat Pills & Cover Image (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Questions Count */}
                <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100 text-center space-y-0.5">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center mx-auto">
                    <BookOpen className="w-3 h-3" />
                  </div>
                  <p className="text-lg font-black text-purple-950 leading-tight">{quizQuestions.length}</p>
                  <p className="text-[9px] font-bold text-purple-700">Questions</p>
                </div>

                {/* 2. Total Points */}
                <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100 text-center space-y-0.5">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto">
                    <Award className="w-3 h-3" />
                  </div>
                  <p className="text-lg font-black text-amber-950 leading-tight">{totalPoints.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-amber-700">Total Points</p>
                </div>

                {/* 3. Total Time */}
                <div className="bg-teal-50 p-2.5 rounded-2xl border border-teal-100 text-center space-y-0.5">
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto">
                    <Clock className="w-3 h-3" />
                  </div>
                  <p className="text-lg font-black text-teal-950 leading-tight">{totalTimeMinutes} min</p>
                  <p className="text-[9px] font-bold text-teal-700">Total Time</p>
                </div>
              </div>

              {/* Cover Image Upload Box */}
              <div className="bg-blue-50/60 border border-dashed border-blue-200 p-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer hover:bg-blue-100/50 transition">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold text-blue-700">Change Cover</span>
              </div>
            </div>
          </div>

          {/* Section 2: 2-Column Layout (Left Questions List & Right Question Editor) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Questions Navigator List (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      Questions ({quizQuestions.length})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewBlankQuestion}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Questions</span>
                  </button>
                </div>

                {/* Questions Sidebar List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {quizQuestions.map((q, idx) => {
                    const isActive = idx === activeQuestionIndex;
                    return (
                      <div
                        key={q._id || idx}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-blue-50/90 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {q.questionText || `Question ${idx + 1}`}
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                              <span>⏱ {q.timeLimit || 20} sec</span>
                              <span>⭐ {q.points || 1000} pts</span>
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                {q.questionType || 'MCQ'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCurrentQuestion(idx);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips for a Great Quiz Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/80 p-4 rounded-3xl border border-blue-100 shadow-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-blue-950">Tips for a Great Quiz</h4>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Use clear and concise questions.</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Set appropriate time limits.</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Provide balanced options.</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Check your quiz using Preview.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: Question Form Editor (8 Cols) */}
            <div className="lg:col-span-8">
              {currentQuestion ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                        <Edit className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">
                        Edit Question {activeQuestionIndex + 1}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                        {currentQuestion.questionType || 'MCQ'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewingQuestion(currentQuestion)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>

                  {/* Question Statement */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Question Text <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={currentQuestion.questionText}
                      onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })}
                      placeholder="Which prompt is the most structured and effective for generating a JSON API response?"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Options List */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-2">
                      Options <span className="text-rose-500">*</span> (Select radio for Correct Answer)
                    </label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((opt, optIdx) => {
                        const isCorrect = currentQuestion.correctOptionIndex === optIdx;
                        return (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => {
                                const copy = [...currentQuestion.options];
                                copy[optIdx] = e.target.value;
                                updateCurrentQuestion({ options: copy });
                              }}
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                            />
                            {/* Correct answer toggle radio */}
                            <button
                              type="button"
                              onClick={() => updateCurrentQuestion({ correctOptionIndex: optIdx })}
                              title={isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 hover:border-emerald-400 bg-white'
                              }`}
                            >
                              {isCorrect && <Check className="w-3.5 h-3.5" />}
                            </button>
                            {/* Delete option */}
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(optIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  {/* Controls Row: Correct Answer, Time Limit, Points, Category */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Correct Answer Selection */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Correct Answer <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={currentQuestion.correctOptionIndex}
                        onChange={(e) => updateCurrentQuestion({ correctOptionIndex: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        {currentQuestion.options.map((_, idx) => (
                          <option key={idx} value={idx}>
                            {String.fromCharCode(65 + idx)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Limit */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Time Limit <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={currentQuestion.timeLimit || 20}
                        onChange={(e) => updateCurrentQuestion({ timeLimit: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value={10}>10 seconds</option>
                        <option value={15}>15 seconds</option>
                        <option value={20}>20 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                      </select>
                    </div>

                    {/* Points */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Points <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentQuestion.points || 1000}
                        onChange={(e) => updateCurrentQuestion({ points: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentQuestion.category || category}
                        onChange={(e) => updateCurrentQuestion({ category: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-extrabold text-slate-700">Explanation (Optional)</label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {(currentQuestion.explanation || '').length}/500
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={currentQuestion.explanation || ''}
                      onChange={(e) => updateCurrentQuestion({ explanation: e.target.value })}
                      placeholder="This is the most structured prompt as it defines a role, task, and expected output format clearly."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Question Bottom Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrentQuestion(activeQuestionIndex)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Question</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Question</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                  Select a question from the left sidebar to edit details.
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Preview Question Modal */}
      {previewingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Question Preview ({previewingQuestion.category || 'General'})
              </span>
              <button onClick={() => setPreviewingQuestion(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {previewingQuestion.questionText}
              </h3>

              <div className="space-y-2">
                {previewingQuestion.options.map((opt, idx) => {
                  const isCorrect = idx === previewingQuestion.correctOptionIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>
                        <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong>
                        {opt}
                      </span>
                      {isCorrect && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {previewingQuestion.explanation && (
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                  <p className="font-bold text-blue-950">Explanation:</p>
                  <p>{previewingQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewingQuestion(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
