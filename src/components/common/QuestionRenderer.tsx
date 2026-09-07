'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  FileCode,
  Check,
} from 'lucide-react';
import { IQuestion } from '@/types';

interface QuestionRendererProps {
  question: Partial<IQuestion> | null;
  mode: 'player' | 'trainer' | 'projector';
  selectedOptionIndex?: number | null;
  onSelectOption?: (index: number) => void;
  onSelectSequence?: (sequence: number[]) => void;
  onSelectCategoryAssignments?: (assignments: Record<string, string>) => void;
  onSelectPromptBlocks?: (blocks: { role?: string; context?: string; task?: string; outputFormat?: string }) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  correctOptionIndex?: number | null;
  userAnswerIndex?: number | null;
  isAnswerSubmitted?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  mode,
  selectedOptionIndex,
  onSelectOption,
  onSelectSequence,
  onSelectCategoryAssignments,
  onSelectPromptBlocks,
  disabled = false,
  showCorrectAnswer = false,
  correctOptionIndex,
  userAnswerIndex,
  isAnswerSubmitted = false,
}) => {
  if (!question) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-semibold text-sm">
        No question data available.
      </div>
    );
  }

  const qType = question.questionType || 'MCQ';

  // State for Sequence Ordering
  const initialSequence = question.options ? question.options.map((_, idx) => idx) : [];
  const [sequence, setSequence] = useState<number[]>(initialSequence);

  // State for Drag & Drop Categorization
  const [categoryAssignments, setCategoryAssignments] = useState<Record<string, string>>({});
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // State for Prompt Builder
  const [promptSelection, setPromptSelection] = useState<{
    role?: string;
    context?: string;
    task?: string;
    outputFormat?: string;
  }>({});

  useEffect(() => {
    if (question.options) {
      setSequence(question.options.map((_, idx) => idx));
    }
  }, [question]);

  const handleMoveStep = (fromIdx: number, toIdx: number) => {
    if (disabled || fromIdx < 0 || toIdx < 0 || toIdx >= sequence.length) return;
    const newSeq = [...sequence];
    const [moved] = newSeq.splice(fromIdx, 1);
    newSeq.splice(toIdx, 0, moved);
    setSequence(newSeq);
    if (onSelectSequence) onSelectSequence(newSeq);
  };

  const handleAssignCategory = (itemIdx: string, catId: string) => {
    if (disabled) return;
    const updated = { ...categoryAssignments, [itemIdx]: catId };
    setCategoryAssignments(updated);
    if (onSelectCategoryAssignments) onSelectCategoryAssignments(updated);
  };

  const handlePromptSelect = (field: 'role' | 'context' | 'task' | 'outputFormat', value: string) => {
    if (disabled) return;
    const updated = { ...promptSelection, [field]: value };
    setPromptSelection(updated);
    if (onSelectPromptBlocks) onSelectPromptBlocks(updated);
  };

  const renderQuestionText = (text?: string) => {
    if (!text) return 'Sample Question';
    const parts = text.split(/(WHO|WHAT|HOW|WHY|WHERE|WHEN)/gi);
    return parts.map((part, idx) => {
      if (['WHO', 'WHAT', 'HOW', 'WHY', 'WHERE', 'WHEN'].includes(part.toUpperCase())) {
        return (
          <span
            key={idx}
            className={
              mode === 'projector'
                ? 'text-amber-400 font-black underline decoration-amber-400 decoration-wavy'
                : 'text-blue-600 font-black underline decoration-blue-400 decoration-wavy'
            }
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Color schemes for option cards
  const optionThemes = [
    { badge: 'bg-emerald-600 text-white', playerBg: 'bg-emerald-50 border-emerald-300 text-emerald-950', playerSelected: 'bg-emerald-600 text-white border-emerald-700 shadow-lg ring-2 ring-emerald-500', projectorBg: 'bg-emerald-600/90 border-emerald-400/40 text-white', letter: 'A' },
    { badge: 'bg-blue-600 text-white', playerBg: 'bg-blue-50 border-blue-300 text-blue-950', playerSelected: 'bg-blue-600 text-white border-blue-700 shadow-lg ring-2 ring-blue-500', projectorBg: 'bg-blue-600/90 border-blue-400/40 text-white', letter: 'B' },
    { badge: 'bg-amber-500 text-white', playerBg: 'bg-amber-50 border-amber-300 text-amber-950', playerSelected: 'bg-amber-500 text-white border-amber-600 shadow-lg ring-2 ring-amber-500', projectorBg: 'bg-amber-500/90 border-amber-300/40 text-slate-950', letter: 'C' },
    { badge: 'bg-purple-600 text-white', playerBg: 'bg-purple-50 border-purple-300 text-purple-950', playerSelected: 'bg-purple-600 text-white border-purple-700 shadow-lg ring-2 ring-purple-500', projectorBg: 'bg-purple-600/90 border-purple-400/40 text-white', letter: 'D' },
  ];

  // -------------------------------------------------------------
  // TYPE 1: CORRECT_SEQUENCE (Re-order Steps)
  // -------------------------------------------------------------
  if (qType === 'CORRECT_SEQUENCE') {
    const options = question.options || [];

    return (
      <div className="space-y-6 w-full font-sans">
        <div className={`p-6 rounded-3xl border shadow-sm ${mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">
            CORRECT THE SEQUENCE
          </span>
          <h2 className="text-xl md:text-2xl font-black">{renderQuestionText(question.questionText)}</h2>
          <p className="text-xs opacity-75 mt-1">Reorder the steps into the correct logical workflow order.</p>
        </div>

        <div className="space-y-3">
          {sequence.map((optIdx, position) => {
            const stepText = options[optIdx] || `Step ${optIdx + 1}`;

            return (
              <div
                key={optIdx}
                className={`p-4 rounded-2xl border flex items-center justify-between transition shadow-sm ${
                  mode === 'projector'
                    ? 'bg-slate-800 border-indigo-400/30 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                    {position + 1}
                  </span>
                  <span className="text-sm font-extrabold">{stepText}</span>
                </div>

                {mode === 'player' && !disabled && (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={position === 0}
                      onClick={() => handleMoveStep(position, position - 1)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl text-slate-700 transition"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={position === sequence.length - 1}
                      onClick={() => handleMoveStep(position, position + 1)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl text-slate-700 transition"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TYPE 2: DRAG_AND_DROP (Categorization / Card Sorting)
  // -------------------------------------------------------------
  if (qType === 'DRAG_AND_DROP') {
    const items = question.options || [];
    const categories = question.categories || [
      { id: 'ml', title: 'Traditional Machine Learning' },
      { id: 'dl', title: 'Deep Learning' },
      { id: 'nlp', title: 'Natural Language Processing' },
      { id: 'cv', title: 'Computer Vision' },
    ];

    return (
      <div className="space-y-6 w-full font-sans">
        <div className={`p-6 rounded-3xl border shadow-sm ${mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">
            DRAG & DROP CATEGORIZATION
          </span>
          <h2 className="text-xl md:text-2xl font-black">{renderQuestionText(question.questionText)}</h2>
          <p className={`text-xs sm:text-sm opacity-85 mt-2 font-medium leading-relaxed ${mode === 'projector' ? 'text-slate-300' : 'text-slate-600'}`}>
            {question.explanation || (
              items.length === 12
                ? "Drag each of the 12 cards into the category that best describes it. You can also click a card, then click a category."
                : items.length === 6
                ? "Now choose the best combination for each real-life case. Some cases use one concept; others combine a problem area with a learning approach."
                : "Assign each card to its correct category."
            )}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl border min-h-[120px] space-y-2 ${
                mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="border-b pb-2 border-slate-200/50">
                <h4 className="text-xs font-black uppercase text-blue-600">{cat.title}</h4>
                {cat.description && <p className="text-[10px] opacity-75">{cat.description}</p>}
              </div>

              <div className="space-y-2 pt-1">
                {items.map((itemText, idx) => {
                  const isAssigned = categoryAssignments[idx.toString()] === cat.id;
                  if (!isAssigned) return null;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold shadow-xs flex items-center justify-between"
                    >
                      <span>{itemText}</span>
                      {mode === 'player' && !disabled && (
                        <button
                          type="button"
                          onClick={() => handleAssignCategory(idx.toString(), '')}
                          className="text-[10px] text-rose-600 font-extrabold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Available Items Cards */}
        {mode === 'player' && !disabled && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500">Unassigned Items</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((itemText, idx) => {
                const currentCat = categoryAssignments[idx.toString()];
                if (currentCat) return null;

                return (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <p className="text-xs font-extrabold text-slate-900">{itemText}</p>
                    <div className="flex flex-wrap gap-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleAssignCategory(idx.toString(), cat.id)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold"
                        >
                          + {cat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // TYPE 3: PROMPT_BUILDER (RCTOF Prompt Assembly)
  // -------------------------------------------------------------
  if (qType === 'PROMPT_BUILDER') {
    const blocks = question.promptBlocks || {
      role: ['Act as an AI Specialist', 'Act as a Customer Support Assistant'],
      context: ['Working in e-commerce platform', 'Working in corporate training'],
      task: ['Generate an answer', 'Draft a structured report'],
      outputFormat: ['Format as JSON', 'Format as bulleted Markdown list'],
    };

    return (
      <div className="space-y-6 w-full font-sans">
        <div className={`p-6 rounded-3xl border shadow-sm ${mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-900 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">
            RCTOF PROMPT BUILDER
          </span>
          <h2 className="text-xl md:text-2xl font-black">{renderQuestionText(question.questionText)}</h2>
        </div>

        {/* Live Assembled Prompt Preview */}
        <div className="p-5 bg-slate-900 text-emerald-400 font-mono rounded-3xl border border-slate-800 text-xs space-y-1 shadow-inner">
          <p className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-widest">Assembled Prompt Preview:</p>
          <p>{promptSelection.role || '[Role]'}</p>
          <p>{promptSelection.context || '[Context]'}</p>
          <p>{promptSelection.task || '[Task]'}</p>
          <p>{promptSelection.outputFormat || '[Output Format]'}</p>
        </div>

        {mode === 'player' && !disabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            {blocks.role && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h4 className="text-xs font-black uppercase text-blue-600">Role / Persona</h4>
                {blocks.role.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePromptSelect('role', r)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition ${
                      promptSelection.role === r ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Task */}
            {blocks.task && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h4 className="text-xs font-black uppercase text-blue-600">Task</h4>
                {blocks.task.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePromptSelect('task', t)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition ${
                      promptSelection.task === t ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEFAULT: MCQ & TRUE_FALSE
  // -------------------------------------------------------------
  const options = question.options && question.options.length > 0
    ? question.options
    : ['Option A', 'Option B', 'Option C', 'Option D'];

  const actualCorrectIndex =
    correctOptionIndex !== undefined && correctOptionIndex !== null
      ? correctOptionIndex
      : question.correctOptionIndex;

  if (mode === 'projector') {
    return (
      <div className="space-y-8 w-full">
        <div className="space-y-3">
          {question.category && (
            <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider">
              {question.category}
            </span>
          )}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {renderQuestionText(question.questionText)}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {options.map((optText, idx) => {
            const theme = optionThemes[idx % 4];
            const isCorrect = showCorrectAnswer && actualCorrectIndex === idx;

            return (
              <div
                key={idx}
                className={`p-6 sm:p-7 rounded-3xl border shadow-xl flex items-center space-x-5 transition-all duration-300 ${
                  isCorrect
                    ? 'bg-emerald-500 border-emerald-300 text-white ring-4 ring-emerald-400 shadow-emerald-500/40'
                    : theme.projectorBg
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 border border-white/30 ${theme.badge}`}>
                  {theme.letter}
                </div>
                <span className="text-lg sm:text-2xl font-extrabold tracking-tight leading-snug">
                  {optText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'trainer') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider">
            {question.category || 'GENERAL QUIZ'}
          </span>
          <span className="text-xs font-extrabold text-slate-500">
            Points: {question.points || 1000}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
          {renderQuestionText(question.questionText)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((optText, idx) => {
            const theme = optionThemes[idx % 4];
            const isCorrect = actualCorrectIndex === idx;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 font-extrabold'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${theme.badge}`}>
                    {theme.letter}
                  </span>
                  <span className="text-xs font-extrabold">{optText}</span>
                </div>

                {isCorrect && (
                  <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CORRECT</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Player Mode MCQ / TRUE_FALSE
  return (
    <div className="space-y-6 w-full">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
            {question.category || 'QUESTION'}
          </span>
          {disabled && (
            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-extrabold">
              {isAnswerSubmitted ? 'SUBMITTED' : 'TIME EXPIRED'}
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
          {renderQuestionText(question.questionText)}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((optText, idx) => {
          const theme = optionThemes[idx % 4];
          const isSelected = selectedOptionIndex === idx;
          const isCorrect = showCorrectAnswer && actualCorrectIndex === idx;
          const isUserWrong =
            showCorrectAnswer && userAnswerIndex === idx && actualCorrectIndex !== idx;

          let btnClass = `${theme.playerBg} border`;
          if (isSelected) {
            btnClass = theme.playerSelected;
          }
          if (showCorrectAnswer) {
            if (isCorrect) {
              btnClass = 'bg-emerald-600 text-white border-emerald-700 shadow-lg ring-2 ring-emerald-500';
            } else if (isUserWrong) {
              btnClass = 'bg-rose-600 text-white border-rose-700 opacity-90';
            } else {
              btnClass = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption && onSelectOption(idx)}
              className={`p-5 rounded-3xl font-extrabold text-left transition-all duration-200 flex items-center justify-between space-x-4 shadow-sm active:scale-[0.98] ${btnClass} ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isSelected || (showCorrectAnswer && (isCorrect || isUserWrong))
                      ? 'bg-white/20 text-white'
                      : theme.badge
                  }`}
                >
                  {theme.letter}
                </span>
                <span className="text-base md:text-lg font-black tracking-tight leading-snug">
                  {optText}
                </span>
              </div>

              {showCorrectAnswer && isCorrect && (
                <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              )}
              {showCorrectAnswer && isUserWrong && (
                <XCircle className="w-6 h-6 text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
