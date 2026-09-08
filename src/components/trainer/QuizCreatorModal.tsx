'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bold,
  Italic,
  Type,
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
  const [draggedQIdx, setDraggedQIdx] = useState<number | null>(null);
  const [dragOverQIdx, setDragOverQIdx] = useState<number | null>(null);

  const moveQuestion = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= quizQuestions.length || toIdx >= quizQuestions.length || fromIdx === toIdx) return;
    const updated = [...quizQuestions];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setQuizQuestions(updated);
    setActiveQuestionIndex(toIdx);
  };

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
        points: 100,
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
        points: 100,
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
        points: 100,
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
              questionType: 'MCQ',
              questionText: 'Which business function should be prioritized first?',
              options: ['Customer Support Chat', 'Warehouse Inventory Automation', 'Executive Payroll'],
              correctOptionIndex: 0,
              points: 100,
              explanation: 'Customer support provides immediate ROI and low operational friction.',
            },
          ],
        },
        timeLimit: 30,
        points: 100,
        category: category || 'Scenario Analysis',
        difficulty: 'MEDIUM',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (type === 'MULTIPLE_SELECT') {
      newQ = {
        _id: `temp-${Date.now()}`,
        trainerId: 'trainer-1',
        questionText: 'Select all statements that apply',
        questionType: 'MULTIPLE_SELECT',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndices: [0, 1],
        timeLimit: 25,
        points: 100,
        category: category || 'General',
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
        points: 100,
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
          correctOptionIndices: q.correctOptionIndices,
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
            body: JSON.stringify({
              ...payload,
              solutionChallengeData: q.solutionChallengeData,
              promptBuilderData: q.promptBuilderData,
              scenarioQuestionsData: q.scenarioQuestionsData,
            }),
          });
          const qJson = await qRes.json();
          if (qJson.success) {
            questionIds.push(qJson.data._id);
          }
        } else {
          await fetch(`/api/v1/questions?id=${q._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              solutionChallengeData: q.solutionChallengeData,
              promptBuilderData: q.promptBuilderData,
              scenarioQuestionsData: q.scenarioQuestionsData,
            }),
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
                  
                  {/* Add Question Button */}
                  <button
                    type="button"
                    onClick={() => handleAddNewBlankQuestion('MCQ')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {quizQuestions.map((q, idx) => {
                    const isActive = idx === activeQuestionIndex;
                    const isDragging = draggedQIdx === idx;
                    const isOver = dragOverQIdx === idx;

                    return (
                      <div
                        key={q._id || idx}
                        draggable={true}
                        onDragStart={(e) => {
                          setDraggedQIdx(idx);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedQIdx !== null && draggedQIdx !== idx) setDragOverQIdx(idx);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedQIdx !== null) moveQuestion(draggedQIdx, idx);
                          setDraggedQIdx(null);
                          setDragOverQIdx(null);
                        }}
                        onDragEnd={() => {
                          setDraggedQIdx(null);
                          setDragOverQIdx(null);
                        }}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                          isDragging
                            ? 'opacity-40 bg-blue-50 border-dashed border-blue-400 scale-[0.98]'
                            : isOver
                            ? 'bg-blue-100/70 border-blue-500 ring-2 ring-blue-400'
                            : isActive
                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          {/* Drag Grip Handle ☰ */}
                          <div
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 transition shrink-0"
                            title="Drag to reorder question"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Index Number Badge */}
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>

                          {/* Title & Type */}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {q.questionText || 'Untitled Question'}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              {q.questionType}
                            </span>
                          </div>
                        </div>

                        {/* Right Controls: Reorder Up/Down & Delete */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <div className="flex items-center space-x-0.5 opacity-70 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(idx, idx - 1);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100/60 disabled:opacity-20 rounded-lg transition"
                              title="Move Question Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === quizQuestions.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(idx, idx + 1);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100/60 disabled:opacity-20 rounded-lg transition"
                              title="Move Question Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCurrentQuestion(idx);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Question Editor (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {currentQuestion ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                  
                  {/* Header: Question Index & Type Selector */}
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
                        <option value="MULTIPLE_SELECT">Multiple Select Answers</option>
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

                    {/* Rich Text Toolbar */}
                    <div className="flex items-center gap-1 mb-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-xl flex-wrap">
                      {[
                        { label: 'B', title: 'Bold', prefix: '**', suffix: '**', icon: <Bold className="w-3 h-3" /> },
                        { label: 'I', title: 'Italic', prefix: '_', suffix: '_', icon: <Italic className="w-3 h-3" /> },
                      ].map((fmt) => (
                        <button
                          key={fmt.label}
                          type="button"
                          title={fmt.title}
                          onClick={() => {
                            const el = document.getElementById('question-text-area') as HTMLTextAreaElement;
                            if (!el) return;
                            const start = el.selectionStart;
                            const end = el.selectionEnd;
                            const selected = el.value.slice(start, end) || fmt.title;
                            const newVal = el.value.slice(0, start) + fmt.prefix + selected + fmt.suffix + el.value.slice(end);
                            updateCurrentQuestion({ questionText: newVal });
                            setTimeout(() => { el.focus(); el.setSelectionRange(start + fmt.prefix.length, end + fmt.prefix.length); }, 0);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-1"
                        >
                          {fmt.icon}
                        </button>
                      ))}
                      <div className="w-px h-5 bg-slate-300 mx-0.5" />
                      {[
                        { label: 'H1', title: 'Heading 1', marker: '# ' },
                        { label: 'H2', title: 'Heading 2', marker: '## ' },
                        { label: 'Aa', title: 'Normal text', marker: '' },
                      ].map((h) => (
                        <button
                          key={h.label}
                          type="button"
                          title={h.title}
                          onClick={() => {
                            const el = document.getElementById('question-text-area') as HTMLTextAreaElement;
                            if (!el) return;
                            const lines = el.value.split('\n');
                            const pos = el.selectionStart;
                            let charCount = 0;
                            let lineIdx = 0;
                            for (let i = 0; i < lines.length; i++) {
                              if (charCount + lines[i].length >= pos) { lineIdx = i; break; }
                              charCount += lines[i].length + 1;
                            }
                            lines[lineIdx] = lines[lineIdx].replace(/^#{1,2}\s*/, '');
                            if (h.marker) lines[lineIdx] = h.marker + lines[lineIdx];
                            updateCurrentQuestion({ questionText: lines.join('\n') });
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition"
                        >
                          {h.label}
                        </button>
                      ))}
                      <span className="ml-auto text-[10px] text-slate-400 font-medium">**bold** _italic_ # H1 ## H2</span>
                    </div>

                    <textarea
                      id="question-text-area"
                      rows={3}
                      required
                      value={currentQuestion.questionText}
                      onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })}
                      placeholder="Enter question statement... Use **bold**, _italic_, # H1, ## H2 for formatting"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>

                  {/* DYNAMIC EDITOR PER QUESTION TYPE */}
                  
                  {/* 1. MCQ, MULTIPLE_SELECT & TRUE_FALSE */}
                  {(currentQuestion.questionType === 'MCQ' || currentQuestion.questionType === 'TRUE_FALSE' || currentQuestion.questionType === 'MULTIPLE_SELECT') && (
                    <div className="space-y-3">
                      <label className="block text-xs font-extrabold text-slate-700">
                        {currentQuestion.questionType === 'MULTIPLE_SELECT'
                          ? 'Options (Mark checkboxes for all Correct Answers)'
                          : 'Options (Mark radio button for Correct Answer)'}
                      </label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, optIdx) => {
                          const isMultiple = currentQuestion.questionType === 'MULTIPLE_SELECT';
                          const multiIndices: number[] = currentQuestion.correctOptionIndices || [];
                          const isCorrect = isMultiple
                            ? multiIndices.includes(optIdx)
                            : currentQuestion.correctOptionIndex === optIdx;

                          const toggleCorrect = () => {
                            if (isMultiple) {
                              const updated = isCorrect
                                ? multiIndices.filter((i) => i !== optIdx)
                                : [...multiIndices, optIdx];
                              updateCurrentQuestion({ correctOptionIndices: updated });
                            } else {
                              updateCurrentQuestion({ correctOptionIndex: optIdx });
                            }
                          };

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
                                onClick={toggleCorrect}
                                className={`w-6 h-6 border flex items-center justify-center shrink-0 transition ${
                                  isMultiple ? 'rounded-lg' : 'rounded-full'
                                } ${
                                  isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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

                      {(currentQuestion.questionType === 'MCQ' || currentQuestion.questionType === 'MULTIPLE_SELECT') && (
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
                  {currentQuestion.questionType === 'DRAG_AND_DROP' && (() => {
                    const categories = (currentQuestion.categories && currentQuestion.categories.length > 0)
                      ? currentQuestion.categories
                      : [
                          { id: 'ml', title: 'Traditional Machine Learning' },
                          { id: 'dl', title: 'Deep Learning' },
                          { id: 'nlp', title: 'Natural Language Processing' },
                          { id: 'cv', title: 'Computer Vision' },
                        ];

                    const handleAddCategory = () => {
                      const newCatId = `cat_${Date.now()}`;
                      const newCat = { id: newCatId, title: `Category ${categories.length + 1}` };
                      updateCurrentQuestion({ categories: [...categories, newCat] });
                    };

                    const handleUpdateCategory = (catIdx: number, newTitle: string) => {
                      const updated = categories.map((cat, i) =>
                        i === catIdx ? { ...cat, title: newTitle } : cat
                      );
                      updateCurrentQuestion({ categories: updated });
                    };

                    const handleRemoveCategory = (catIdx: number) => {
                      if (categories.length <= 1) {
                        alert('At least one category is required.');
                        return;
                      }
                      const removedId = categories[catIdx].id;
                      const updated = categories.filter((_, i) => i !== catIdx);
                      const fallbackId = updated[0].id;

                      const currentAssignments = { ...(currentQuestion.categoryAssignments || {}) };
                      const updatedAssignments: Record<string, string> = {};
                      Object.entries(currentAssignments).forEach(([optIdxStr, catId]) => {
                        updatedAssignments[optIdxStr] = catId === removedId ? fallbackId : (catId as string);
                      });

                      updateCurrentQuestion({
                        categories: updated,
                        categoryAssignments: updatedAssignments,
                      });
                    };

                    return (
                      <div className="space-y-4 p-4 bg-purple-50/60 border border-purple-200 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-purple-900">
                            Drag & Drop Question Categories & Card Assignments
                          </h4>
                        </div>

                        {/* Question Categories Management Box */}
                        <div className="p-3.5 bg-white border border-purple-200 rounded-xl space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-purple-900 tracking-wider">
                              Question Categories ({categories.length})
                            </span>
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Category</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {categories.map((cat, catIdx) => (
                              <div key={cat.id || catIdx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                <span className="text-[10px] font-black uppercase text-purple-600 shrink-0 w-5 text-center">
                                  {catIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={cat.title}
                                  onChange={(e) => handleUpdateCategory(catIdx, e.target.value)}
                                  placeholder="Category name..."
                                  className="flex-1 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategory(catIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                                  title="Remove Category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Items & Category Assignments */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-purple-900 tracking-wider">
                              Card Items ({currentQuestion.options.length})
                            </span>
                          </div>

                          {currentQuestion.options.map((opt, optIdx) => {
                            const assignments = currentQuestion.categoryAssignments || {};
                            const currentCat = assignments[optIdx.toString()] || categories[0]?.id || 'ml';
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
                                      className="px-2.5 py-1.5 bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-400 max-w-[160px] truncate"
                                    >
                                      {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                          {cat.title}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(optIdx)}
                                      className="p-1 text-rose-500 hover:text-rose-700 transition"
                                      title="Remove Card Item"
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
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Card Item</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* 4. SCENARIO_QUESTIONS */}
                  {currentQuestion.questionType === 'SCENARIO_QUESTIONS' && (() => {
                    const sData = currentQuestion.scenarioQuestionsData || {
                      scenarioTitle: '',
                      scenarioText: '',
                      backgroundContext: '',
                      instructions: '',
                      subQuestions: [] as any[],
                    };
                    const updateScenario = (patch: Partial<typeof sData>) => {
                      const updatedScenario = { ...sData, ...patch };
                      const totalTime = (updatedScenario.subQuestions || []).reduce(
                        (sum: number, sq: any) => sum + (sq.timeLimit !== undefined ? sq.timeLimit : 20),
                        0
                      );
                      updateCurrentQuestion({
                        scenarioQuestionsData: updatedScenario,
                        timeLimit: totalTime > 0 ? totalTime : 20,
                      });
                    };
                    const updateSubQ = (sqIdx: number, patch: any) => {
                      const copy = [...sData.subQuestions];
                      copy[sqIdx] = { ...copy[sqIdx], ...patch };
                      updateScenario({ subQuestions: copy });
                    };
                    const addSubQ = () => {
                      updateScenario({
                        subQuestions: [...sData.subQuestions, {
                          id: `sq${Date.now()}`,
                          questionType: 'MCQ',
                          questionText: '',
                          options: ['Option A', 'Option B', 'Option C', 'Option D'],
                          correctOptionIndex: 0,
                          correctOrder: [0, 1, 2, 3],
                          points: 250,
                          timeLimit: 20,
                          explanation: '',
                        }],
                      });
                    };
                    const removeSubQ = (sqIdx: number) => {
                      updateScenario({ subQuestions: sData.subQuestions.filter((_: any, i: number) => i !== sqIdx) });
                    };
                    const moveSubQ = (sqIdx: number, dir: -1 | 1) => {
                      const copy = [...sData.subQuestions];
                      const to = sqIdx + dir;
                      if (to < 0 || to >= copy.length) return;
                      [copy[sqIdx], copy[to]] = [copy[to], copy[sqIdx]];
                      updateScenario({ subQuestions: copy });
                    };
                    const updateOpt = (sqIdx: number, optIdx: number, val: string) => {
                      const copy = [...sData.subQuestions[sqIdx].options];
                      copy[optIdx] = val;
                      updateSubQ(sqIdx, { options: copy });
                    };
                    const addOpt = (sqIdx: number) => {
                      const sq = sData.subQuestions[sqIdx];
                      updateSubQ(sqIdx, { options: [...sq.options, `Option ${String.fromCharCode(65 + sq.options.length)}`] });
                    };
                    const removeOpt = (sqIdx: number, optIdx: number) => {
                      const sq = sData.subQuestions[sqIdx];
                      if (sq.options.length <= 2) return;
                      const copy = sq.options.filter((_: any, i: number) => i !== optIdx);
                      const correct = sq.correctOptionIndex;
                      updateSubQ(sqIdx, {
                        options: copy,
                        correctOptionIndex: optIdx === correct ? 0 : optIdx < correct ? correct - 1 : correct,
                      });
                    };

                    return (
                      <div className="space-y-4 p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl">
                        <h4 className="text-xs font-black uppercase text-indigo-900">Scenario & Sub-Questions</h4>

                        {/* Scenario-level fields */}
                        <div className="space-y-3 p-3 bg-white border border-indigo-200 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Scenario Details</p>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Scenario Title</label>
                            <input type="text" value={sData.scenarioTitle}
                              onChange={(e) => updateScenario({ scenarioTitle: e.target.value })}
                              placeholder="e.g. Executive AI Strategy Case Study"
                              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Scenario / Business Challenge</label>
                            <textarea rows={4} value={sData.scenarioText}
                              onChange={(e) => updateScenario({ scenarioText: e.target.value })}
                              placeholder="Describe the full scenario or business challenge here..."
                              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Instructions (Optional)</label>
                            <textarea rows={2} value={sData.instructions || ''}
                              onChange={(e) => updateScenario({ instructions: e.target.value })}
                              placeholder="e.g. Read carefully and answer each question based on the scenario above."
                              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Background Context (Optional)</label>
                            <textarea rows={2} value={sData.backgroundContext || ''}
                              onChange={(e) => updateScenario({ backgroundContext: e.target.value })}
                              placeholder="Additional context, constraints, or background..."
                              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />
                          </div>
                        </div>

                        {/* Sub-Questions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                              Sub-Questions ({sData.subQuestions.length})
                            </p>
                            <button type="button" onClick={addSubQ}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition">
                              <Plus className="w-3.5 h-3.5" /> Add Sub-Question
                            </button>
                          </div>

                          {sData.subQuestions.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic text-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
                              No sub-questions yet — click &quot;Add Sub-Question&quot; above
                            </p>
                          )}

                          {sData.subQuestions.map((sq: any, sqIdx: number) => {
                            const sqType = sq.questionType || 'MCQ';
                            return (
                              <div key={sq.id || sqIdx} className="p-4 bg-white border border-indigo-200 rounded-xl space-y-3">

                                {/* Sub-Q Header: badge, type selector, points, reorder, delete */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-lg text-[10px] font-black shrink-0">Q{sqIdx + 1}</span>

                                  <select value={sqType}
                                    onChange={(e) => updateSubQ(sqIdx, { questionType: e.target.value })}
                                    className="flex-1 min-w-[140px] px-2 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-[10px] font-black focus:outline-none focus:ring-1 focus:ring-indigo-400">
                                    <option value="MCQ">Multiple Choice (MCQ)</option>
                                    <option value="MULTIPLE_SELECT">Multiple Select (Checkboxes)</option>
                                    <option value="TRUE_FALSE">True / False</option>
                                    <option value="CORRECT_SEQUENCE">Correct Sequence / Ordering</option>
                                    <option value="DRAG_AND_DROP">Drag & Drop Categorization</option>
                                    <option value="PROMPT_BUILDER">RCTOF Prompt Builder</option>
                                  </select>

                                  <div className="flex items-center gap-1 shrink-0 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] font-black text-amber-700 uppercase">Pts:</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={50}
                                      value={sq.points !== undefined ? sq.points : 250}
                                      onChange={(e) => updateSubQ(sqIdx, { points: Number(e.target.value) || 0 })}
                                      className="w-14 p-0.5 bg-white border border-amber-300 rounded text-center text-[10px] font-black text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] font-black text-blue-700 uppercase">Timer:</span>
                                    <input
                                      type="number"
                                      min={5}
                                      step={5}
                                      value={sq.timeLimit !== undefined ? sq.timeLimit : 20}
                                      onChange={(e) => updateSubQ(sqIdx, { timeLimit: Number(e.target.value) || 20 })}
                                      className="w-12 p-0.5 bg-white border border-blue-300 rounded text-center text-[10px] font-black text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <span className="text-[9px] font-extrabold text-blue-700">s</span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button type="button" onClick={() => moveSubQ(sqIdx, -1)} disabled={sqIdx === 0}
                                      className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 bg-slate-100 rounded-lg transition">
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => moveSubQ(sqIdx, 1)} disabled={sqIdx === sData.subQuestions.length - 1}
                                      className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 bg-slate-100 rounded-lg transition">
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" onClick={() => removeSubQ(sqIdx)}
                                      className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-lg transition">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Question Text */}
                                <textarea rows={2} value={sq.questionText}
                                  onChange={(e) => updateSubQ(sqIdx, { questionText: e.target.value })}
                                  placeholder={`Sub-question ${sqIdx + 1} — what should students answer?`}
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />

                                {/* TRUE_FALSE quick toggle */}
                                {sqType === 'TRUE_FALSE' && (
                                  <div className="flex gap-2">
                                    {['True', 'False'].map((label, optIdx) => (
                                      <button key={label} type="button"
                                        onClick={() => {
                                          updateSubQ(sqIdx, {
                                            options: ['True', 'False'],
                                            correctOptionIndex: optIdx,
                                          });
                                        }}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                                          sq.correctOptionIndex === optIdx
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400'
                                        }`}>
                                        {label} {sq.correctOptionIndex === optIdx ? '✓' : ''}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* MCQ Options */}
                                {sqType === 'MCQ' && (
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Options — click ● to mark correct</p>
                                    {sq.options.map((opt: string, optIdx: number) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        <button type="button"
                                          onClick={() => updateSubQ(sqIdx, { correctOptionIndex: optIdx })}
                                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                                            sq.correctOptionIndex === optIdx
                                              ? 'bg-emerald-500 border-emerald-500 text-white'
                                              : 'border-slate-300 bg-white hover:border-emerald-400'
                                          }`}>
                                          {sq.correctOptionIndex === optIdx && <Check className="w-3 h-3" />}
                                        </button>
                                        <input type="text" value={opt}
                                          onChange={(e) => updateOpt(sqIdx, optIdx, e.target.value)}
                                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                        {sq.options.length > 2 && (
                                          <button type="button" onClick={() => removeOpt(sqIdx, optIdx)}
                                            className="p-1 text-slate-400 hover:text-rose-500 transition">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addOpt(sqIdx)}
                                      className="text-[10px] text-indigo-600 font-black hover:underline flex items-center gap-1 mt-1">
                                      <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                  </div>
                                )}

                                {/* MULTIPLE_SELECT Options */}
                                {sqType === 'MULTIPLE_SELECT' && (
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Options — click checkboxes to mark all correct answers</p>
                                    {sq.options.map((opt: string, optIdx: number) => {
                                      const indices: number[] = sq.correctOptionIndices || [];
                                      const isChecked = indices.includes(optIdx);
                                      return (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          <button type="button"
                                            onClick={() => {
                                              const updated = isChecked
                                                ? indices.filter((i: number) => i !== optIdx)
                                                : [...indices, optIdx];
                                              updateSubQ(sqIdx, { correctOptionIndices: updated });
                                            }}
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                              isChecked
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-slate-300 bg-white hover:border-emerald-400'
                                            }`}>
                                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>
                                          <input type="text" value={opt}
                                            onChange={(e) => updateOpt(sqIdx, optIdx, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                          {sq.options.length > 2 && (
                                            <button type="button" onClick={() => removeOpt(sqIdx, optIdx)}
                                              className="p-1 text-slate-400 hover:text-rose-500 transition">
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                    <button type="button" onClick={() => addOpt(sqIdx)}
                                      className="text-[10px] text-indigo-600 font-black hover:underline flex items-center gap-1 mt-1">
                                      <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                  </div>
                                )}

                                {/* CORRECT_SEQUENCE options (order = correct order) */}
                                {sqType === 'CORRECT_SEQUENCE' && (
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Steps — order below IS the correct sequence</p>
                                    {sq.options.map((opt: string, optIdx: number) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">{optIdx + 1}</span>
                                        <input type="text" value={opt}
                                          onChange={(e) => {
                                            const copy = [...sq.options];
                                            copy[optIdx] = e.target.value;
                                            updateSubQ(sqIdx, { options: copy, correctOrder: copy.map((_: any, i: number) => i) });
                                          }}
                                          placeholder={`Step ${optIdx + 1}`}
                                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                        {sq.options.length > 2 && (
                                          <button type="button" onClick={() => removeOpt(sqIdx, optIdx)}
                                            className="p-1 text-slate-400 hover:text-rose-500 transition">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addOpt(sqIdx)}
                                      className="text-[10px] text-indigo-600 font-black hover:underline flex items-center gap-1 mt-1">
                                      <Plus className="w-3 h-3" /> Add Step
                                    </button>
                                  </div>
                                )}

                                {/* Points + Explanation row */}
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                  <div className="flex items-center gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Points</label>
                                    <input type="number" min={0} value={sq.points ?? 250}
                                      onChange={(e) => updateSubQ(sqIdx, { points: Number(e.target.value) })}
                                      className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                  </div>
                                  <textarea rows={1} value={sq.explanation || ''}
                                    onChange={(e) => updateSubQ(sqIdx, { explanation: e.target.value })}
                                    placeholder="Explanation shown after answer..."
                                    className="flex-1 p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-slate-700 focus:outline-none resize-none" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}


                  {/* Controls Row: Time Limit, Points, Category */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">Time Limit</label>
                      {currentQuestion.questionType === 'SCENARIO_QUESTIONS' ? (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-[11px] font-bold text-blue-900 flex items-center justify-between">
                          <span className="text-[10px] text-blue-700 uppercase">Sum of Sub-Qs:</span>
                          <span className="text-xs font-black text-blue-800">{currentQuestion.timeLimit || 20}s</span>
                        </div>
                      ) : (
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
                      )}
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
