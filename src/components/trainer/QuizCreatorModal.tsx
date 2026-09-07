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
  Layers,
  ArrowUp,
  ArrowDown,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import { IQuestion, IQuiz, QuestionType } from '@/types';
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

  // Questions List in this Quiz (Full Question objects for direct editing)
  const [quizQuestions, setQuizQuestions] = useState<IQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialQuiz) {
        setTitle(initialQuiz.title || '');
        setDescription(initialQuiz.description || '');
        setCategory(initialQuiz.category || 'Prompt Engineering');

        if (initialQuiz.questions && Array.isArray(initialQuiz.questions) && initialQuiz.questions.length > 0) {
          setQuizQuestions(initialQuiz.questions.map((q) => ({ ...q })));
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

  const fetchQuizQuestionsByIds = async (ids: string[]) => {
    try {
      const res = await fetch('/api/v1/questions');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const matched = json.data.filter((q: IQuestion) => ids.includes(q._id));
        setQuizQuestions(matched);
      }
    } catch (err) {
      showToast('Failed to load quiz questions', 'error');
    }
  };

  const currentQuestion = quizQuestions[activeQuestionIndex] || null;

  // Add new blank question
  const handleAddNewBlankQuestion = (type: QuestionType = 'MCQ') => {
    let newQ: IQuestion;

    if (type === 'CORRECT_SEQUENCE') {
      newQ = {
        _id: `temp-${Date.now()}`,
        trainerId: 'trainer-1',
        questionText: 'Arrange the steps in the correct logical sequence',
        questionType: 'CORRECT_SEQUENCE',
        options: ['Step A: Problem Definition', 'Step B: Data Preprocessing', 'Step C: Model Training', 'Step D: Deployment'],
        correctOrder: [0, 1, 2, 3],
        timeLimit: 30,
        points: 1000,
        category: category || 'AI Workflows',
        difficulty: 'MEDIUM',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (type === 'DRAG_AND_DROP') {
      newQ = {
        _id: `temp-${Date.now()}`,
        trainerId: 'trainer-1',
        questionText: 'Sort each solution card into its matching AI category',
        questionType: 'DRAG_AND_DROP',
        options: [
          'Language translation||A company automatically translates customer messages from English into Hindi.',
          'Customer churn prediction||A telecom company predicts which customers may leave using plan type, monthly usage, payment history and contract length.',
          'Customer email classification||A support system reads incoming emails and identifies whether each message is a complaint, question, refund request or compliment.',
          'Factory defect detection||A factory camera checks products and identifies scratches, cracks or missing parts.',
          'House price prediction||A property company predicts a home\'s price using location, size, number of rooms and previous sale prices.',
          'Traffic camera vehicle counting||A traffic camera counts how many cars pass through an intersection during the day.',
          'Next month\'s sales forecast||A retailer predicts next month\'s sales using historical sales, price, promotions, season and store information.',
          'Reading a barcode from a camera||A supermarket camera identifies the barcode printed on a product package.',
          'Speech recognition||A voice assistant uses a neural network trained on large amounts of recorded speech to recognize spoken words.',
          'Complex medical image learning||A neural network learns subtle patterns from a very large collection of medical images to support doctors in identifying abnormalities.',
          'Handwritten digit recognition||A system learns from thousands of examples of handwritten numbers and recognizes whether a new image contains 0, 1, 2, 3 and so on.',
          'Meeting summary||An AI reads a meeting transcript and produces a short summary of the key decisions and discussion points.',
        ],
        categories: [
          { id: 'ml', title: 'Traditional Machine Learning' },
          { id: 'dl', title: 'Deep Learning' },
          { id: 'nlp', title: 'Natural Language Processing' },
          { id: 'cv', title: 'Computer Vision' },
        ],
        categoryAssignments: {
          '0': 'nlp', '1': 'ml', '2': 'nlp', '3': 'cv',
          '4': 'ml', '5': 'cv', '6': 'ml', '7': 'cv',
          '8': 'dl', '9': 'dl', '10': 'dl', '11': 'nlp',
        },
        timeLimit: 30,
        points: 1000,
        category: category || 'AI Classification',
        difficulty: 'MEDIUM',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (type === 'PROMPT_BUILDER') {
      newQ = {
        _id: `temp-${Date.now()}`,
        trainerId: 'trainer-1',
        questionText: 'Assemble an Effective RCTOF Prompt',
        questionType: 'PROMPT_BUILDER',
        options: ['Role', 'Context', 'Task', 'Output Format'],
        promptBlocks: {
          role: ['Act as a Senior AI Engineer', 'Act as a General Assistant'],
          context: ['Working in e-commerce platform', 'Working in customer support'],
          task: ['Generate an API response', 'Write a short summary'],
          outputFormat: ['Format as valid JSON', 'Format as Markdown list'],
        },
        timeLimit: 30,
        points: 1000,
        category: category || 'Prompt Engineering',
        difficulty: 'MEDIUM',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (type === 'SCENARIO_QUESTIONS') {
      newQ = {
        _id: `temp-${Date.now()}`,
        trainerId: 'trainer-1',
        questionText: 'Executive Scenario & Analysis Questions',
        questionType: 'SCENARIO_QUESTIONS',
        options: ['Option A', 'Option B'],
        scenarioQuestionsData: {
          scenarioTitle: 'Executive Scenario Case Study',
          scenarioText: 'A high-growth organization is deciding how to integrate AI automation across customer support and warehouse operations.',
          backgroundContext: 'Evaluate strategic impact, cost trade-offs, and operational risks.',
          subQuestions: [
            {
              id: 'sq1',
              questionText: 'Which business function should be prioritized first?',
              options: ['Customer Support Chat', 'Warehouse Inventory Automation', 'Executive Payroll'],
              correctOptionIndex: 0,
              explanation: 'Customer support provides immediate ROI and low operational friction.',
            },
          ],
        },
        timeLimit: 30,
        points: 1000,
        category: category || 'Scenario Analysis',
        difficulty: 'MEDIUM',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      newQ = {
        _id: `temp-${Date.now()}`,
        trainerId: 'trainer-1',
        questionText: `New Question ${quizQuestions.length + 1}`,
        questionType: type,
        options: type === 'TRUE_FALSE' ? ['AI', 'Not AI'] : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
        timeLimit: 20,
        points: 1000,
        category: category || 'General',
        difficulty: 'MEDIUM',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const updated = [...quizQuestions, newQ];
    setQuizQuestions(updated);
    setActiveQuestionIndex(updated.length - 1);
  };

  const handleAddOption = () => {
    if (!currentQuestion) return;
    const updatedOpts = [...currentQuestion.options, `Option ${String.fromCharCode(65 + currentQuestion.options.length)}`];
    updateCurrentQuestion({ options: updatedOpts });
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (!currentQuestion) return;
    if (currentQuestion.options.length <= 2) {
      showToast('At least 2 options required.', 'warning');
      return;
    }
    const updatedOpts = currentQuestion.options.filter((_, idx) => idx !== indexToRemove);
    let newCorrect = currentQuestion.correctOptionIndex ?? 0;
    if (indexToRemove === newCorrect) {
      newCorrect = 0;
    } else if (indexToRemove < newCorrect) {
      newCorrect = Math.max(0, newCorrect - 1);
    }
    updateCurrentQuestion({ options: updatedOpts, correctOptionIndex: newCorrect });
  };

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

  const updateCurrentQuestion = (fields: Partial<IQuestion>) => {
    setQuizQuestions((prev) => {
      const copy = [...prev];
      if (copy[activeQuestionIndex]) {
        copy[activeQuestionIndex] = { ...copy[activeQuestionIndex], ...fields };
      }
      return copy;
    });
  };

  const totalPoints = quizQuestions.reduce((acc, q) => acc + (q.points || 1000), 0);
  const totalTimeSeconds = quizQuestions.reduce((acc, q) => acc + (q.timeLimit || 20), 0);
  const totalTimeMinutes = Math.max(1, Math.round(totalTimeSeconds / 60));

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
      const questionIds: string[] = [];
      for (const q of quizQuestions) {
        const payload = {
          questionText: q.questionText,
          questionType: q.questionType || 'MCQ',
          options: q.options || [],
          correctOptionIndex: q.correctOptionIndex,
          correctOrder: q.correctOrder,
          categories: q.categories,
          categoryAssignments: q.categoryAssignments,
          promptBlocks: q.promptBlocks,
          timeLimit: q.timeLimit || 20,
          points: q.points || 1000,
          explanation: q.explanation,
          category: q.category || category,
          difficulty: q.difficulty || 'MEDIUM',
        };

        if (q._id.startsWith('temp-')) {
          const qRes = await fetch('/api/v1/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const qJson = await qRes.json();
          if (qJson.success) {
            questionIds.push(qJson.data._id);
          }
        } else {
          await fetch(`/api/v1/questions?id=${q._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          questionIds.push(q._id);
        }
      }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-slate-50/95 rounded-3xl border border-slate-200 w-full max-w-6xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              type="button"
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
                <h1 className="text-xl font-black text-slate-900">
                  {initialQuiz ? 'Edit Quiz' : 'Create Quiz'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Support for MCQ, True/False, Drag & Drop Categorization, Correct Sequence & Prompt Builder
                </p>
              </div>
            </div>
          </div>

          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Quiz Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
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
                    <option value="AI Classification">AI Classification</option>
                    <option value="AI Workflows">AI Workflows</option>
                    <option value="AI Foundations">AI Foundations</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Master prompt design principles including Role definition, Context setting, Task instructions, Constraints, and Output formatting."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Metric Stat Pills */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100 text-center space-y-0.5">
                  <BookOpen className="w-4 h-4 text-purple-600 mx-auto" />
                  <p className="text-lg font-black text-purple-950">{quizQuestions.length}</p>
                  <p className="text-[9px] font-bold text-purple-700">Questions</p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100 text-center space-y-0.5">
                  <Award className="w-4 h-4 text-amber-500 mx-auto" />
                  <p className="text-lg font-black text-amber-950">{totalPoints.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-amber-700">Points</p>
                </div>
                <div className="bg-teal-50 p-2.5 rounded-2xl border border-teal-100 text-center space-y-0.5">
                  <Clock className="w-4 h-4 text-teal-600 mx-auto" />
                  <p className="text-lg font-black text-teal-950">{totalTimeMinutes} min</p>
                  <p className="text-[9px] font-bold text-teal-700">Duration</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] font-bold text-blue-900">
                Supports MCQ, True/False, Drag & Drop, Sequence & Prompt Builder
              </div>
            </div>
          </div>

          {/* Section 2: Questions Navigator + Question Type Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Questions List (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900">Questions ({quizQuestions.length})</h3>
                  
                  {/* Add Question Menu */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddNewBlankQuestion('MCQ')}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      + MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddNewBlankQuestion('DRAG_AND_DROP')}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      + Drag & Drop
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddNewBlankQuestion('CORRECT_SEQUENCE')}
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      + Sequence
                    </button>
                  </div>
                </div>

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
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {q.questionText || `Question ${idx + 1}`}
                            </p>
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                              {q.questionType || 'MCQ'}
                            </span>
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
            </div>

            {/* RIGHT COLUMN: Question Type Specific Editor (8 Cols) */}
            <div className="lg:col-span-8">
              {currentQuestion ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  
                  {/* Editor Header & Question Type Dropdown */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-black text-slate-900">
                        Edit Question {activeQuestionIndex + 1}
                      </h3>
                    </div>

                    {/* Question Type Selector */}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-bold text-slate-600">Question Type:</label>
                      <select
                        value={currentQuestion.questionType || 'MCQ'}
                        onChange={(e) => updateCurrentQuestion({ questionType: e.target.value as QuestionType })}
                        className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 focus:outline-none"
                      >
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="TRUE_FALSE">True / False (Binary)</option>
                        <option value="DRAG_AND_DROP">Drag & Drop Categorization</option>
                        <option value="CORRECT_SEQUENCE">Correct the Sequence / Ordering</option>
                        <option value="PROMPT_BUILDER">RCTOF Prompt Builder</option>
                        <option value="SOLUTION_CHALLENGE">5-Step AI Solution Builder</option>
                        <option value="SCENARIO_QUESTIONS">Scenario & Sub-Questions</option>
                      </select>
                    </div>
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
                      placeholder="Enter question statement..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* DYNAMIC EDITOR PER QUESTION TYPE */}
                  
                  {/* 1. MCQ & TRUE_FALSE */}
                  {(currentQuestion.questionType === 'MCQ' || currentQuestion.questionType === 'TRUE_FALSE') && (
                    <div className="space-y-3">
                      <label className="block text-xs font-extrabold text-slate-700">
                        Options (Mark radio button for Correct Answer)
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
                              <button
                                type="button"
                                onClick={() => updateCurrentQuestion({ correctOptionIndex: optIdx })}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                                  isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isCorrect && <Check className="w-3.5 h-3.5" />}
                              </button>
                              {currentQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(optIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {currentQuestion.questionType === 'MCQ' && (
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* 2. CORRECT_SEQUENCE */}
                  {currentQuestion.questionType === 'CORRECT_SEQUENCE' && (
                    <div className="space-y-3 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase text-amber-900">
                          Workflow Step Items (Order below defines Correct Sequence)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg"
                        >
                          + Add Step
                        </button>
                      </div>

                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-amber-200">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                              {optIdx + 1}
                            </span>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => {
                                const copy = [...currentQuestion.options];
                                copy[optIdx] = e.target.value;
                                updateCurrentQuestion({ options: copy, correctOrder: copy.map((_, i) => i) });
                              }}
                              className="flex-1 text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(optIdx)}
                              className="p-1 text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. DRAG_AND_DROP */}
                  {currentQuestion.questionType === 'DRAG_AND_DROP' && (
                    <div className="space-y-4 p-4 bg-purple-50/60 border border-purple-200 rounded-2xl">
                      <h4 className="text-xs font-black uppercase text-purple-900">
                        Drag & Drop Items & Category Assignments
                      </h4>

                      <div className="space-y-3">
                        {currentQuestion.options.map((opt, optIdx) => {
                          const assignments = currentQuestion.categoryAssignments || {};
                          const currentCat = assignments[optIdx.toString()] || 'ml';
                          const sepIdx = opt.indexOf('||');
                          const itemTitle = sepIdx === -1 ? opt : opt.slice(0, sepIdx);
                          const itemDesc = sepIdx === -1 ? '' : opt.slice(sepIdx + 2);

                          const updateItem = (newTitle: string, newDesc: string) => {
                            const copy = [...currentQuestion.options];
                            copy[optIdx] = newDesc ? `${newTitle}||${newDesc}` : newTitle;
                            updateCurrentQuestion({ options: copy });
                          };

                          return (
                            <div key={optIdx} className="p-3 bg-white border border-purple-200 rounded-xl space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider w-16 shrink-0">Title</span>
                                    <input
                                      type="text"
                                      value={itemTitle}
                                      onChange={(e) => updateItem(e.target.value, itemDesc)}
                                      placeholder="e.g. Customer churn prediction"
                                      className="flex-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider w-16 shrink-0 mt-1.5">Desc</span>
                                    <textarea
                                      value={itemDesc}
                                      onChange={(e) => updateItem(itemTitle, e.target.value)}
                                      placeholder="e.g. A telecom company predicts which customers may leave..."
                                      rows={2}
                                      className="flex-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none leading-relaxed"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 shrink-0">
                                  <select
                                    value={currentCat}
                                    onChange={(e) => {
                                      const updatedMap = { ...assignments, [optIdx.toString()]: e.target.value };
                                      updateCurrentQuestion({ categoryAssignments: updatedMap });
                                    }}
                                    className="px-2 py-1.5 bg-purple-100 text-purple-900 rounded-lg text-[10px] font-bold"
                                  >
                                    <option value="ml">Traditional ML</option>
                                    <option value="dl">Deep Learning</option>
                                    <option value="nlp">NLP</option>
                                    <option value="cv">Computer Vision</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(optIdx)}
                                    className="p-1 text-rose-500 hover:text-rose-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg"
                      >
                        + Add Card Item
                      </button>
                    </div>
                  )}

                  {/* Controls Row: Time Limit, Points, Category */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">Time Limit</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={5}
                          value={currentQuestion.timeLimit || 20}
                          onChange={(e) => updateCurrentQuestion({ timeLimit: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <span className="text-xs font-bold text-slate-500 shrink-0">sec</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">Points</label>
                      <input
                        type="number"
                        value={currentQuestion.points || 1000}
                        onChange={(e) => updateCurrentQuestion({ points: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">Category</label>
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
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Explanation (Optional)</label>
                    <textarea
                      rows={2}
                      value={currentQuestion.explanation || ''}
                      onChange={(e) => updateCurrentQuestion({ explanation: e.target.value })}
                      placeholder="Add an explanation for students..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 font-bold">
                  Select or add a question to edit.
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              {submitting ? 'Saving Quiz...' : 'Save Quiz & Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
