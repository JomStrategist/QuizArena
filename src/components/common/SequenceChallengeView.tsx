'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Check,
  Zap,
  Award,
  ListOrdered,
  AlertTriangle,
} from 'lucide-react';
import { IQuestion, ISequenceItem, ISequenceQuestionData } from '@/types';

interface SequenceChallengeViewProps {
  question: Partial<IQuestion>;
  mode?: 'player' | 'trainer' | 'projector';
  questionIndex?: number;
  totalQuestions?: number;
  onNavigateQuestion?: (idx: number) => void;
  onCompleteChallenge?: (result: any) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

// Shuffling helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const SequenceChallengeView: React.FC<SequenceChallengeViewProps> = ({
  question,
  mode = 'player',
  questionIndex = 0,
  totalQuestions = 5,
  onNavigateQuestion,
  onCompleteChallenge,
  disabled = false,
  showCorrectAnswer = false,
}) => {
  const isTrainerOrProjector = mode === 'trainer' || mode === 'projector';
  const questionId = question._id ? question._id.toString() : '';
  const seqData: ISequenceQuestionData = (question.sequenceData || {}) as ISequenceQuestionData;

  // Extract items or fallback to question options
  let initialItems: ISequenceItem[] = seqData.items || [];
  if (!initialItems || initialItems.length === 0) {
    const opts: string[] = question.options || [];
    initialItems = opts.map((optText: string, idx: number) => ({
      id: `seq_${questionId}_${idx + 1}`,
      text: optText,
      correctPosition: idx + 1,
    }));
  }

  // Learner state
  const [itemsSequence, setItemsSequence] = useState<ISequenceItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Timer state
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Initialize & shuffle on question change or answer reveal
  useEffect(() => {
    if (showCorrectAnswer) {
      setItemsSequence(initialItems);
    } else {
      setItemsSequence(isTrainerOrProjector ? initialItems : shuffleArray(initialItems));
    }
    setEvaluationResult(null);
    setEvaluationError(null);
    setSecondsSpent(0);
    setTimerRunning(true);
  }, [questionId, showCorrectAnswer, isTrainerOrProjector]);

  // Timer interval
  useEffect(() => {
    if (!timerRunning || evaluationResult || isTrainerOrProjector) return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, evaluationResult, isTrainerOrProjector]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reordering handlers (Move Up / Move Down)
  const moveItem = (fromIdx: number, delta: number) => {
    if (disabled || evaluationResult || isTrainerOrProjector) return;
    const toIdx = fromIdx + delta;
    if (toIdx < 0 || toIdx >= itemsSequence.length) return;
    const updated = [...itemsSequence];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setItemsSequence(updated);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (disabled || evaluationResult || isTrainerOrProjector) return;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx || isTrainerOrProjector) return;
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx || isTrainerOrProjector) return;
    const updated = [...itemsSequence];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(dropIdx, 0, draggedItem);
    setItemsSequence(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Submit sequence to backend evaluation
  const handleCheckSequence = async () => {
    if (itemsSequence.length === 0 || isTrainerOrProjector) return;

    setIsEvaluating(true);
    setEvaluationError(null);
    setTimerRunning(false);

    const learnerSequenceIds = itemsSequence.map((it) => it.id);

    try {
      const res = await fetch('/api/v1/quizzes/activity4/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          learnerSequenceIds,
          timeSpentSeconds: secondsSpent,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEvaluationResult(json.data);
        if (onCompleteChallenge) {
          onCompleteChallenge(json.data);
        }
      } else {
        setEvaluationError(json.error?.message || 'Sequence evaluation failed.');
        setTimerRunning(true);
      }
    } catch (err: any) {
      setEvaluationError(err.message || 'Network error evaluating sequence.');
      setTimerRunning(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRestart = () => {
    setItemsSequence(shuffleArray(initialItems));
    setEvaluationResult(null);
    setEvaluationError(null);
    setSecondsSpent(0);
    setTimerRunning(true);
  };

  const exerciseTitle = seqData.scenarioTitle || question.questionText || 'Sequence Challenge';
  const exerciseText = seqData.scenarioText || question.explanation || 'Arrange the items into the correct logical sequence.';
  const instruction = seqData.instruction || 'Arrange the steps in the correct order.';

  return (
    <div className="w-full font-sans text-slate-900 space-y-6">
      {/* Exercise Card Container */}
      <div className={`p-6 rounded-3xl border space-y-6 shadow-xl ${
        mode === 'projector'
          ? 'bg-slate-900 text-white border-white/20'
          : mode === 'trainer'
          ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
          : 'bg-slate-900 text-white border-slate-800'
      }`}>
        {/* Header Bar: Badge, Title, Timer */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          mode === 'trainer' ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
                Activity 4 • Exercise {questionIndex + 1} of {totalQuestions}
              </span>
              <span className={`text-xs font-bold ${mode === 'trainer' ? 'text-slate-500' : 'text-slate-400'}`}>
                {question.topic || 'Sequence Ordering'}
              </span>
            </div>
            <h2 className={`text-xl md:text-2xl font-black ${mode === 'trainer' ? 'text-slate-900' : 'text-white'}`}>
              {exerciseTitle}
            </h2>
          </div>

          {!isTrainerOrProjector && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-full font-mono text-xs font-bold text-amber-400 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Time Spent: {formatTimer(secondsSpent)}</span>
            </div>
          )}
        </div>

        {/* Instructions & Scenario Description */}
        <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-1 ${
          mode === 'trainer'
            ? 'bg-purple-50 border-l-4 border-purple-600 text-purple-950'
            : 'bg-slate-800/80 border-l-4 border-purple-500 text-slate-300'
        }`}>
          <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400 block">Scenario & Instruction</span>
          <p className={`font-medium ${mode === 'trainer' ? 'text-slate-800' : 'text-slate-200'}`}>{exerciseText}</p>
          <p className="font-bold text-purple-600 dark:text-purple-300 pt-1">{instruction}</p>
        </div>

        {/* Exercise Progress Tracker Dots */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 pt-1 max-w-full overflow-x-auto no-scrollbar pb-1">
          <span className={`text-[10px] font-black uppercase tracking-wider mr-1 sm:mr-2 ${mode === 'trainer' ? 'text-slate-500' : 'text-slate-400'}`}>Progress:</span>
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isCurrent = questionIndex === idx;
            const isPassed = idx < questionIndex;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className={`h-0.5 w-2 sm:w-4 ${isPassed ? 'bg-purple-500' : mode === 'trainer' ? 'bg-slate-200' : 'bg-slate-800'}`} />
                )}
                <button
                  type="button"
                  onClick={() => onNavigateQuestion?.(idx)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                    isCurrent
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-md'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                      : mode === 'trainer'
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* SEQUENCE BUILDER PANEL */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center space-x-2 ${
              mode === 'trainer' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <ListOrdered className="w-4 h-4 text-purple-500" />
              <span>{showCorrectAnswer ? 'Correct Sequence Order' : 'Sequence Ordering Steps'} ({itemsSequence.length} Steps)</span>
            </h3>
            {!isTrainerOrProjector && (
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Use Pos dropdown or ▲ ▼ buttons to reorder steps
              </span>
            )}
          </div>

          {/* Item Cards */}
          <div className="space-y-2.5">
            {itemsSequence.map((item, idx) => {
              const isDragging = draggedIdx === idx;
              const isOver = dragOverIdx === idx;

              // Evaluation result highlight per position
              const posEval = evaluationResult?.positionResults?.[idx];
              const isEvaluated = !!evaluationResult;

              return (
                <div
                  key={item.id || idx}
                  draggable={!disabled && !isEvaluated && !isTrainerOrProjector}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between text-xs md:text-sm font-bold shadow-md max-w-full overflow-hidden ${
                    isTrainerOrProjector
                      ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-none'
                      : isEvaluated
                      ? posEval?.isCorrectPosition
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500'
                        : 'bg-rose-950/80 border-rose-500 text-rose-100 ring-1 ring-rose-500'
                      : isDragging
                      ? 'opacity-40 bg-slate-800 border-dashed border-purple-400 scale-[0.98]'
                      : isOver
                      ? 'bg-purple-900/50 border-purple-400 ring-2 ring-purple-400'
                      : 'bg-slate-800/90 border-slate-700/80 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3.5 pr-1.5 sm:pr-2 min-w-0 flex-1">
                    {/* Position Badge Number */}
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl font-black flex items-center justify-center text-xs shrink-0 transition ${
                        isEvaluated
                          ? posEval?.isCorrectPosition
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Drag Handle Icon ☰ (Players Only) */}
                    {!isEvaluated && !disabled && !isTrainerOrProjector && (
                      <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-purple-400 transition shrink-0 hidden sm:block" title="Drag to reorder">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}

                    {/* Item Text & Description */}
                    <div className="leading-snug min-w-0 flex-1 break-words">
                      <span className={`font-extrabold ${mode === 'trainer' ? 'text-slate-900' : 'text-white'}`}>{item.text}</span>
                      {item.description && (
                        <p className={`text-[11px] font-normal mt-0.5 ${mode === 'trainer' ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</p>
                      )}
                      {isEvaluated && !posEval?.isCorrectPosition && (
                        <p className="text-[11px] font-bold text-rose-300 mt-1 flex items-center space-x-1">
                          <span>Expected position {idx + 1}:</span>
                          <span className="underline">{posEval?.expectedText}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Reordering Controls (Player) or Status (Trainer) */}
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 ml-1">
                    {isTrainerOrProjector ? (
                      showCorrectAnswer ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-black">
                          Step {idx + 1}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                          Step Item
                        </span>
                      )
                    ) : isEvaluated ? (
                      posEval?.isCorrectPosition ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-black">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✓ Correct Position</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/40 rounded-full text-rose-300 text-xs font-black">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>✕ Incorrect Position</span>
                        </div>
                      )
                    ) : (
                      !disabled && (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {/* Position Picker Dropdown for Mobile 1-Tap Reordering */}
                          <div className="flex items-center space-x-0.5 sm:space-x-1">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400">Pos:</span>
                            <select
                              disabled={disabled}
                              value={idx + 1}
                              onChange={(e) => {
                                const targetPos = parseInt(e.target.value, 10) - 1;
                                if (targetPos < 0 || targetPos >= itemsSequence.length || targetPos === idx) return;
                                const updated = [...itemsSequence];
                                const [moved] = updated.splice(idx, 1);
                                updated.splice(targetPos, 0, moved);
                                setItemsSequence(updated);
                              }}
                              className="p-1 sm:p-1.5 rounded-xl border bg-slate-900 border-slate-700 text-purple-300 font-bold text-xs outline-none cursor-pointer hover:border-purple-500 max-w-[54px] sm:max-w-none"
                            >
                              {itemsSequence.map((_, pIdx) => (
                                <option key={pIdx} value={pIdx + 1}>
                                  {pIdx + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Touch-Friendly Move Up / Down Buttons */}
                          <div className="flex items-center space-x-0.5 sm:space-x-1">
                            <button
                              type="button"
                              onClick={() => moveItem(idx, -1)}
                              disabled={idx === 0}
                              className="p-1.5 sm:p-2 min-w-[30px] sm:min-w-[36px] min-h-[30px] sm:min-h-[36px] flex items-center justify-center rounded-xl bg-slate-700 hover:bg-purple-600 active:bg-purple-700 disabled:opacity-30 text-white font-bold transition shadow-xs"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 1)}
                              disabled={idx === itemsSequence.length - 1}
                              className="p-1.5 sm:p-2 min-w-[30px] sm:min-w-[36px] min-h-[30px] sm:min-h-[36px] flex items-center justify-center rounded-xl bg-slate-700 hover:bg-purple-600 active:bg-purple-700 disabled:opacity-30 text-white font-bold transition shadow-xs"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {evaluationError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-bold">
              {evaluationError}
            </div>
          )}

          {/* CHECK SEQUENCE BUTTON (Pre-evaluation) */}
          {!evaluationResult && (
            <div className="flex justify-end pt-3">
              <button
                type="button"
                disabled={isEvaluating || disabled}
                onClick={handleCheckSequence}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-2xl font-black text-xs transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                {isEvaluating ? (
                  <span>Evaluating Sequence...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>✓ Check Sequence Order</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* EVALUATION RESULTS CARD */}
        {evaluationResult && (
          <div className="p-6 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">Evaluation Result</span>
                <h3 className="text-xl font-black text-white">{evaluationResult.feedbackTitle}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {evaluationResult.correctCount} of {evaluationResult.totalPositions} steps placed in exact position
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-3xl font-black text-white">{evaluationResult.totalScore}</span>
                  <span className="text-sm font-bold text-slate-400"> / {evaluationResult.maxPossibleScore}</span>
                </div>
              </div>
            </div>

            {/* Explanation Rationale Box */}
            <div className="p-4 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <span className="font-black uppercase text-[10px] tracking-wider text-purple-400 block">Logical Sequence Rationale</span>
              <p>{evaluationResult.explanation}</p>
            </div>

            {/* Nav & Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-try Sequence</span>
              </button>

              <div className="flex items-center space-x-2">
                {questionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigateQuestion?.(questionIndex - 1)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
                {questionIndex < totalQuestions - 1 && (
                  <button
                    type="button"
                    onClick={() => onNavigateQuestion?.(questionIndex + 1)}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs flex items-center space-x-2 shadow-md transition"
                  >
                    <span>Next Exercise</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
