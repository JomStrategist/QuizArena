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
  onSelectSequence?: (sequence: number[]) => void;
  disabled?: boolean;
  isAnswerSubmitted?: boolean;
  showCorrectAnswer?: boolean;
}

// Shuffling helper
function shuffleArray<T>(array: T[]): T[] {
  if (array.length <= 1) return [...array];
  const arr = [...array];
  let attempts = 0;
  while (attempts < 10) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    let isDifferent = false;
    for (let k = 0; k < arr.length; k++) {
      if (arr[k] !== array[k]) {
        isDifferent = true;
        break;
      }
    }
    if (isDifferent) break;
    attempts++;
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
  onSelectSequence,
  disabled = false,
  isAnswerSubmitted = false,
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
      const sortedByCorrect = [...initialItems].sort(
        (a, b) => (a.correctPosition || 0) - (b.correctPosition || 0)
      );
      setItemsSequence(sortedByCorrect);
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
    if (!timerRunning || evaluationResult || isTrainerOrProjector || isAnswerSubmitted) return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, evaluationResult, isTrainerOrProjector, isAnswerSubmitted]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reordering handlers (Move Up / Move Down)
  const moveItem = (fromIdx: number, direction: number) => {
    if (disabled || isAnswerSubmitted || isTrainerOrProjector) return;
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= itemsSequence.length) return;
    const updated = [...itemsSequence];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setItemsSequence(updated);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (disabled || isAnswerSubmitted || isTrainerOrProjector) return;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx || disabled || isAnswerSubmitted || isTrainerOrProjector) return;

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

  // Submit sequence order
  const handleCheckSequence = async () => {
    if (itemsSequence.length === 0 || isTrainerOrProjector || disabled || isAnswerSubmitted) return;

    const originalOptions: string[] = question.options || [];
    const submittedIndices: number[] = itemsSequence.map((item) => {
      const idx = originalOptions.indexOf(item.text);
      if (idx !== -1) return idx;
      const parts = item.id ? item.id.split('_') : [];
      const lastNum = parseInt(parts[parts.length - 1], 10);
      return !isNaN(lastNum) ? lastNum - 1 : 0;
    });

    if (onSelectSequence) {
      onSelectSequence(submittedIndices);
      return;
    }

    setIsEvaluating(true);
    setEvaluationError(null);
    setTimerRunning(false);

    try {
      const res = await fetch('/api/v1/quizzes/activity4/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          learnerSequenceIds: itemsSequence.map((it) => it.id),
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

  const exerciseTitle = question.questionText || (seqData as any).title || `Exercise ${questionIndex + 1}: Sequence Ordering`;
  const exerciseText = seqData.scenarioText || question.explanation || 'Arrange the items into the correct logical sequence.';
  const instruction = seqData.instruction || 'Arrange the steps in the correct order.';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
        isTrainerOrProjector ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest">
            <span className={`px-2.5 py-0.5 rounded-full border font-black ${
              isTrainerOrProjector
                ? 'bg-purple-900/60 text-purple-200 border-purple-500/40'
                : 'bg-purple-100 text-purple-950 border-purple-300'
            }`}>
              Activity 4 • Exercise {questionIndex + 1} of {totalQuestions}
            </span>
            <span className={isTrainerOrProjector ? 'text-purple-300 font-extrabold' : 'text-purple-950 font-black'}>
              Sequence Ordering
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isTrainerOrProjector ? 'text-white' : 'text-slate-950'}`}>
            {exerciseTitle}
          </h2>
        </div>

        {/* Timer Badge */}
        {!isTrainerOrProjector && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-amber-100 border border-amber-300 rounded-xl text-amber-950 font-mono text-xs font-bold shrink-0 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-800" />
            <span>Time Spent: {formatTimer(secondsSpent)}</span>
          </div>
        )}
      </div>

      {/* Scenario Instruction Box */}
      <div className="space-y-4">
        <div className={`p-4 rounded-2xl border space-y-1.5 text-xs sm:text-sm ${
          isTrainerOrProjector
            ? 'bg-slate-900/90 border-slate-700/80 text-slate-100'
            : 'bg-purple-50/90 border-purple-200 text-slate-900'
        }`}>
          <span className={`text-[10px] uppercase font-black tracking-wider block ${
            isTrainerOrProjector ? 'text-purple-300' : 'text-purple-900'
          }`}>
            Scenario & Instruction
          </span>
          <p className={`font-bold ${isTrainerOrProjector ? 'text-slate-200' : 'text-slate-800'}`}>{exerciseText}</p>
          <p className={`font-extrabold pt-1 ${isTrainerOrProjector ? 'text-purple-200' : 'text-purple-950'}`}>{instruction}</p>
        </div>

        {/* SEQUENCE BUILDER PANEL */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center space-x-2 ${
              isTrainerOrProjector ? 'text-slate-100' : 'text-slate-950'
            }`}>
              <ListOrdered className={`w-4 h-4 ${isTrainerOrProjector ? 'text-purple-400' : 'text-purple-700'}`} />
              <span>{showCorrectAnswer ? 'Correct Sequence Order' : 'Sequence Ordering Steps'} ({itemsSequence.length} Steps)</span>
            </h3>
            {!isTrainerOrProjector && !disabled && !isAnswerSubmitted && (
              <span className="text-xs text-slate-700 font-semibold hidden sm:inline">
                Use Pos dropdown or ▲ ▼ buttons to reorder steps
              </span>
            )}
          </div>

          {/* Item Cards */}
          <div className="space-y-2.5">
            {itemsSequence.map((item, idx) => {
              const isDragging = draggedIdx === idx;
              const isOver = dragOverIdx === idx;

              const posEval = evaluationResult?.positionResults?.[idx];
              const isEvaluated = !!evaluationResult;

              return (
                <div
                  key={item.id || idx}
                  draggable={!disabled && !isAnswerSubmitted && !isEvaluated && !isTrainerOrProjector}
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
                    {!isEvaluated && !disabled && !isAnswerSubmitted && !isTrainerOrProjector && (
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
                    </div>
                  </div>

                  {/* Right Side: Reordering Controls (Player) or Status (Trainer) */}
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 ml-1">
                    {showCorrectAnswer ? (
                      <span className="px-3 py-1 bg-emerald-600 text-white border border-emerald-500 rounded-xl text-xs font-black shadow-xs">
                        Step {idx + 1}
                      </span>
                    ) : isTrainerOrProjector ? (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                        Step Item
                      </span>
                    ) : (
                      !disabled && !isAnswerSubmitted && (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {/* Position Picker Dropdown */}
                          <div className="flex items-center space-x-0.5 sm:space-x-1">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400">Pos:</span>
                            <select
                              disabled={disabled || isAnswerSubmitted}
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
                              disabled={idx === 0 || disabled || isAnswerSubmitted}
                              className="p-1.5 sm:p-2 min-w-[30px] sm:min-w-[36px] min-h-[30px] sm:min-h-[36px] flex items-center justify-center rounded-xl bg-slate-700 hover:bg-purple-600 active:bg-purple-700 disabled:opacity-30 text-white font-bold transition shadow-xs"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 1)}
                              disabled={idx === itemsSequence.length - 1 || disabled || isAnswerSubmitted}
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

          {/* SUBMIT SEQUENCE ORDER BUTTON */}
          {!isTrainerOrProjector && (
            <div className="flex justify-end pt-3">
              <button
                type="button"
                disabled={isEvaluating || disabled || isAnswerSubmitted}
                onClick={handleCheckSequence}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-2xl font-black text-xs transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                {isAnswerSubmitted ? (
                  <span>✓ Sequence Answer Submitted</span>
                ) : isEvaluating ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>✓ Submit Sequence Order</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
