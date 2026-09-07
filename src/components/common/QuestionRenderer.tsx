'use client';

import React from 'react';
import { CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { IQuestion } from '@/types';

interface QuestionRendererProps {
  question: Partial<IQuestion> | null;
  mode: 'player' | 'trainer' | 'projector';
  selectedOptionIndex?: number | null;
  onSelectOption?: (index: number) => void;
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

  const options =
    question.options && question.options.length > 0
      ? question.options
      : ['Option A', 'Option B', 'Option C', 'Option D'];

  const actualCorrectIndex =
    correctOptionIndex !== undefined && correctOptionIndex !== null
      ? correctOptionIndex
      : question.correctOptionIndex;

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
    {
      badge: 'bg-emerald-600 text-white',
      badgeBorder: 'border-emerald-700',
      playerBg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950',
      playerSelected: 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-500',
      projectorBg: 'bg-emerald-600/90 border-emerald-400/40 text-white',
      letter: 'A',
    },
    {
      badge: 'bg-blue-600 text-white',
      badgeBorder: 'border-blue-700',
      playerBg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-300 text-blue-950',
      playerSelected: 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-600/25 ring-2 ring-blue-500',
      projectorBg: 'bg-blue-600/90 border-blue-400/40 text-white',
      letter: 'B',
    },
    {
      badge: 'bg-amber-500 text-white',
      badgeBorder: 'border-amber-600',
      playerBg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-950',
      playerSelected: 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/25 ring-2 ring-amber-500',
      projectorBg: 'bg-amber-500/90 border-amber-300/40 text-slate-950',
      letter: 'C',
    },
    {
      badge: 'bg-purple-600 text-white',
      badgeBorder: 'border-purple-700',
      playerBg: 'bg-purple-50 hover:bg-purple-100/80 border-purple-300 text-purple-950',
      playerSelected: 'bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-600/25 ring-2 ring-purple-500',
      projectorBg: 'bg-purple-600/90 border-purple-400/40 text-white',
      letter: 'D',
    },
  ];

  // 1. PROJECTOR MODE
  if (mode === 'projector') {
    return (
      <div className="space-y-8 w-full">
        {/* Question Text Header */}
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

        {/* Media snippet if present */}
        {question.mediaUrl && (
          <div className="max-h-60 overflow-hidden rounded-2xl border border-white/20">
            <img src={question.mediaUrl} alt="Question Media" className="w-full object-cover" />
          </div>
        )}

        {/* Option Cards */}
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
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 border border-white/30 ${theme.badge}`}
                >
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

  // 2. TRAINER MONITORING MODE
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

        {question.mediaUrl && (
          <div className="max-h-48 overflow-hidden rounded-2xl border border-slate-200">
            <img src={question.mediaUrl} alt="Question Media" className="w-full object-cover" />
          </div>
        )}

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

        {question.explanation && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold">Trainer Notes: </span>
              {question.explanation}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. PLAYER INTERACTIVE MODE
  return (
    <div className="space-y-6 w-full">
      {/* Question Header Card */}
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

      {/* Answer Choice Buttons Grid */}
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
