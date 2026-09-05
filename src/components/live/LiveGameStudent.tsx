'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Award, CheckCircle2, XCircle, TrendingUp, Sparkles } from 'lucide-react';
import { IQuestion } from '@/types';
import { calculateQuestionScore } from '@/lib/game/scoringEngine';

interface LiveGameStudentProps {
  question: IQuestion;
  questionNumber: number;
  totalQuestions: number;
  displayName: string;
  onAnswerSubmitted: (selectedOptionIndex: number, scoreEarned: number, responseTimeMs: number) => void;
}

export const LiveGameStudent: React.FC<LiveGameStudentProps> = ({
  question,
  questionNumber,
  totalQuestions,
  displayName,
  onAnswerSubmitted,
}) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 20);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTimeMs] = useState(Date.now());

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isLocked) {
      if (!isLocked && timeLeft <= 0) {
        // Time expired without answer
        handleSelection(-1);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLocked]);

  const handleSelection = (index: number) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedIndex(index);

    const responseTimeMs = Date.now() - startTimeMs;
    const correct = index === question.correctOptionIndex;
    setIsCorrect(correct);

    const pts = calculateQuestionScore({
      isCorrect: correct,
      maxPoints: question.points || 1000,
      timeLimitSeconds: question.timeLimit || 20,
      responseTimeMs,
    });

    setScoreEarned(pts);
    setShowResult(true);

    onAnswerSubmitted(index, pts, responseTimeMs);
  };

  const optionColors = [
    'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-rose-500/20',
    'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-blue-500/20',
    'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/20',
    'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-500/20',
  ];

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">
            Question {questionNumber} of {totalQuestions}
          </span>
          <h3 className="text-sm font-black text-slate-900">{displayName}</h3>
        </div>

        {/* Visual Timer Indicator */}
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono font-black text-lg ${
            timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-4 text-center">
        <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
          {question.questionText}
        </h2>
      </div>

      {/* Touch Answer Buttons Grid */}
      {!showResult ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelection(i)}
              disabled={isLocked}
              className={`p-6 rounded-2xl border-b-4 font-black text-left text-base transition-transform active:scale-95 flex items-center space-x-4 shadow-lg ${
                optionColors[i % optionColors.length]
              }`}
            >
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black">
                {optionLetters[i]}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
            </button>
          ))}
        </div>
      ) : (
        /* Result & Feedback Screen */
        <div
          className={`p-8 rounded-3xl border shadow-2xl text-center space-y-6 animate-in zoom-in duration-200 ${
            isCorrect
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400'
              : 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            {isCorrect ? <CheckCircle2 className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black">{isCorrect ? '✓ CORRECT!' : '✕ WRONG'}</h2>
            <p className="text-sm font-semibold opacity-90">
              {isCorrect ? `+${scoreEarned} POINTS` : '+0 POINTS'}
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 max-w-xs mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Correct Choice</p>
            <p className="text-base font-black mt-1">
              {optionLetters[question.correctOptionIndex]}. {question.options[question.correctOptionIndex]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
