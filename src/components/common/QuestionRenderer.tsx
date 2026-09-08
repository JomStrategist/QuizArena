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
import { Activity3ChallengeView } from './Activity3ChallengeView';
import { SequenceChallengeView } from './SequenceChallengeView';

interface QuestionRendererProps {
  question: Partial<IQuestion> | null;
  mode: 'player' | 'trainer' | 'projector';
  questionIndex?: number;
  totalQuestions?: number;
  onNavigateQuestion?: (idx: number) => void;
  selectedOptionIndex?: number | null;
  onSelectOption?: (index: number) => void;
  onSelectSequence?: (sequence: number[]) => void;
  onSelectCategoryAssignments?: (assignments: Record<string, string>) => void;
  onSelectPromptBlocks?: (blocks: { role?: string; context?: string; task?: string; outputFormat?: string }) => void;
  onSubAnswersComplete?: (answers: Record<number, any>) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  correctOptionIndex?: number | null;
  userAnswerIndex?: number | null;
  isAnswerSubmitted?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  mode,
  questionIndex = 0,
  totalQuestions = 5,
  onNavigateQuestion,
  selectedOptionIndex,
  onSelectOption,
  onSelectSequence,
  onSelectCategoryAssignments,
  onSelectPromptBlocks,
  onSubAnswersComplete,
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
  const [selectedPromptPieces, setSelectedPromptPieces] = useState<string[]>([]);

  // State for Solution Challenge
  const [solStep, setSolStep] = useState<number>(1);
  const [solApproach, setSolApproach] = useState<string | null>(null);
  const [solCaps, setSolCaps] = useState<Set<number>>(new Set());
  const [solWorkflow, setSolWorkflow] = useState<number[]>([]);
  const [solAutonomy, setSolAutonomy] = useState<number | null>(null);
  const [solEvaluated, setSolEvaluated] = useState<boolean>(false);

  // State for Scenario Questions
  const [scenarioSubAnswers, setScenarioSubAnswers] = useState<Record<number, any>>({});
  const [activeSubQIdx, setActiveSubQIdx] = useState<number>(0);
  // Per-sub-question sequence ordering (for CORRECT_SEQUENCE sub-Qs)
  const [subSeqMap, setSubSeqMap] = useState<Record<number, number[]>>({});

  const questionId = question?._id ? String(question._id) : (question as any)?.id ? String((question as any).id) : question?.questionText || '';

  useEffect(() => {
    if (question?.options) {
      setSequence(question.options.map((_, idx) => idx));
    }
    setSelectedPromptPieces([]);
    setScenarioSubAnswers({});
    setActiveSubQIdx(0);
    setSubSeqMap({});
  }, [questionId]);

  const handleSubQuestionSelect = (subIdx: number, optIdx: number) => {
    if (disabled) return;
    const updated = { ...scenarioSubAnswers, [subIdx]: { selectedOptionIndex: optIdx } };
    setScenarioSubAnswers(updated);
  };

  const handleSubQuestionMultiSelect = (subIdx: number, optIdx: number) => {
    if (disabled) return;
    const current = scenarioSubAnswers[subIdx]?.selectedOptionIndices || [];
    const updatedIndices = current.includes(optIdx)
      ? current.filter((i: number) => i !== optIdx)
      : [...current, optIdx];
    const updated = { ...scenarioSubAnswers, [subIdx]: { selectedOptionIndices: updatedIndices } };
    setScenarioSubAnswers(updated);
  };

  const handleSubSeqChange = (subIdx: number, newSeq: number[]) => {
    if (disabled) return;
    setSubSeqMap((prev) => ({ ...prev, [subIdx]: newSeq }));
    const updated = { ...scenarioSubAnswers, [subIdx]: { selectedSequence: newSeq } };
    setScenarioSubAnswers(updated);
  };

  const advanceSubQ = (subQCount: number) => {
    if (activeSubQIdx < subQCount - 1) {
      setActiveSubQIdx((prev) => prev + 1);
    } else {
      // All sub-Qs answered — fire onSubAnswersComplete
      if (onSubAnswersComplete) onSubAnswersComplete(scenarioSubAnswers);
    }
  };

  const togglePromptPiece = (pieceText: string) => {
    if (disabled) return;
    let updated: string[];
    if (selectedPromptPieces.includes(pieceText)) {
      updated = selectedPromptPieces.filter((p) => p !== pieceText);
    } else {
      updated = [...selectedPromptPieces, pieceText];
    }
    setSelectedPromptPieces(updated);
  };

  const movePromptPiece = (fromIdx: number, delta: number) => {
    if (disabled) return;
    const toIdx = fromIdx + delta;
    if (toIdx < 0 || toIdx >= selectedPromptPieces.length) return;
    const updated = [...selectedPromptPieces];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setSelectedPromptPieces(updated);
  };

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

    // Split by lines to handle headings
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Detect heading level
      const h1Match = line.match(/^#\s+(.*)/);
      const h2Match = line.match(/^##\s+(.*)/);
      const content = h1Match ? h1Match[1] : h2Match ? h2Match[1] : line;

      // Parse inline formatting: **bold**, _italic_, and WHO/WHAT/HOW keywords
      const parseInline = (str: string): React.ReactNode[] => {
        const tokens: React.ReactNode[] = [];
        let remaining = str;
        let key = 0;
        while (remaining.length > 0) {
          // Bold
          const boldIdx = remaining.indexOf('**');
          const italicIdx = remaining.indexOf('_');
          const kwMatch = remaining.match(/\b(WHO|WHAT|HOW|WHY|WHERE|WHEN)\b/i);
          const kwIdx = kwMatch ? remaining.indexOf(kwMatch[0]) : Infinity;

          const nextIdx = Math.min(
            boldIdx >= 0 ? boldIdx : Infinity,
            italicIdx >= 0 ? italicIdx : Infinity,
            kwIdx
          );

          if (nextIdx === Infinity) { tokens.push(remaining); break; }

          // Text before marker
          if (nextIdx > 0) tokens.push(remaining.slice(0, nextIdx));
          remaining = remaining.slice(nextIdx);

          if (boldIdx >= 0 && nextIdx === boldIdx) {
            const end = remaining.indexOf('**', 2);
            if (end === -1) { tokens.push(remaining); break; }
            tokens.push(<strong key={key++} className="font-black">{remaining.slice(2, end)}</strong>);
            remaining = remaining.slice(end + 2);
          } else if (italicIdx >= 0 && nextIdx === italicIdx) {
            const end = remaining.indexOf('_', 1);
            if (end === -1) { tokens.push(remaining); break; }
            tokens.push(<em key={key++} className="italic">{remaining.slice(1, end)}</em>);
            remaining = remaining.slice(end + 1);
          } else if (kwMatch && nextIdx === kwIdx) {
            tokens.push(
              <span key={key++} className={mode === 'projector' ? 'text-amber-400 font-black underline decoration-amber-400 decoration-wavy' : 'text-blue-600 font-black underline decoration-blue-400 decoration-wavy'}>
                {kwMatch[0]}
              </span>
            );
            remaining = remaining.slice(kwMatch[0].length);
          }
        }
        return tokens;
      };

      const inlineContent = parseInline(content);

      if (h1Match) {
        return <p key={lineIdx} className={`text-2xl md:text-3xl font-black leading-tight ${lineIdx > 0 ? 'mt-2' : ''}`}>{inlineContent}</p>;
      } else if (h2Match) {
        return <p key={lineIdx} className={`text-lg md:text-xl font-black leading-snug ${lineIdx > 0 ? 'mt-1.5' : ''}`}>{inlineContent}</p>;
      } else {
        return <span key={lineIdx}>{inlineContent}{lineIdx < lines.length - 1 && line !== '' && <br />}</span>;
      }
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
    return (
      <SequenceChallengeView
        question={question}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        onNavigateQuestion={onNavigateQuestion}
        disabled={disabled}
      />
    );
  }

  // -------------------------------------------------------------
  // TYPE 2: DRAG_AND_DROP / CATEGORIZATION
  // -------------------------------------------------------------
  if (qType === 'DRAG_AND_DROP') {
    const items = question.options || [];
    const categories = question.categories || [
      { id: 'ml', title: 'Traditional Machine Learning' },
      { id: 'dl', title: 'Deep Learning' },
      { id: 'nlp', title: 'Natural Language Processing' },
      { id: 'cv', title: 'Computer Vision' },
    ];

    // Parse "Title||Description" format — falls back to full text as title if no separator
    const parseItem = (text: string): { title: string; desc: string } => {
      const sep = text.indexOf('||');
      if (sep === -1) return { title: text, desc: '' };
      return { title: text.slice(0, sep).trim(), desc: text.slice(sep + 2).trim() };
    };

    const isDropdownCases = items.some((it) => /^Case \d+:/i.test(it)) || question.questionText?.includes('Choose the AI Combination');
    const unassignedCount = items.filter((_, idx) => !categoryAssignments[idx.toString()]).length;

    return (
      <div className="space-y-6 w-full font-sans">
        <div className={`p-6 rounded-3xl border shadow-sm ${mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">
            {isDropdownCases ? 'AI COMBINATION CHALLENGE' : 'SOLUTION CATEGORIZATION'}
          </span>
          <h2 className="text-xl md:text-2xl font-black">{renderQuestionText(question.questionText)}</h2>
          <p className={`text-xs sm:text-sm opacity-85 mt-2 font-medium leading-relaxed ${mode === 'projector' ? 'text-slate-300' : 'text-slate-600'}`}>
            {question.explanation || (
              items.length === 12
                ? "Categorize each of the 12 solutions into the category that best describes it. Click a card to select it, or use the + Category buttons on each card."
                : items.length === 6
                ? "Now choose the best combination for each real-life case. Some cases use one concept; others combine a problem area with a learning approach."
                : "Assign each card to its correct category."
            )}
          </p>
        </div>

        {/* If question items are Cases with Dropdowns (Activity 2) */}
        {isDropdownCases ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((itemText, idx) => {
              const selectedCat = categoryAssignments[idx.toString()] || '';
              const caseTitle = `Case ${idx + 1}`;
              const cleanText = itemText.replace(/^Case \d+:\s*/i, '');

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm transition ${
                    mode === 'projector'
                      ? 'bg-slate-900 border-white/20 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-blue-600 tracking-wider">
                      {caseTitle}
                    </h3>
                    <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-90">
                      {cleanText}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-200/60">
                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Select the best combination
                    </label>
                    <select
                      disabled={disabled}
                      value={selectedCat}
                      onChange={(e) => handleAssignCategory(idx.toString(), e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs md:text-sm font-bold transition focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${
                        mode === 'projector'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-900 hover:border-blue-400'
                      }`}
                    >
                      <option value="">Choose...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard Solution Categorization Categories Grid (Activity 1) */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const assignedIndices = items
                  .map((_, i) => i.toString())
                  .filter((idxStr) => categoryAssignments[idxStr] === cat.id);

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (activeItem !== null && mode === 'player' && !disabled) {
                        handleAssignCategory(activeItem, cat.id);
                        setActiveItem(null);
                      }
                    }}
                    className={`p-4 rounded-2xl border min-h-[140px] space-y-3 transition ${
                      activeItem !== null
                        ? 'cursor-pointer ring-2 ring-blue-500/50 bg-blue-50/40 border-blue-400 hover:bg-blue-100/50'
                        : mode === 'projector'
                        ? 'bg-slate-900 border-white/20 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="border-b pb-2 border-slate-200/50 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-blue-600">{cat.title}</h4>
                        {cat.description && <p className="text-[10px] opacity-75">{cat.description}</p>}
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black">
                        {assignedIndices.length} items
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {assignedIndices.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic font-medium pt-1">
                          {activeItem !== null ? 'Click here to place selected card' : 'No items assigned yet'}
                        </p>
                      ) : (
                        assignedIndices.map((idxStr) => {
                          const idx = parseInt(idxStr, 10);
                          const { title: itemTitle, desc: itemDesc } = parseItem(items[idx]);
                          return (
                            <div
                              key={idxStr}
                              className="p-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <p className="font-black leading-snug text-slate-900">{itemTitle}</p>
                                  {itemDesc && <p className="text-[10px] text-slate-500 font-medium leading-snug">{itemDesc}</p>}
                                </div>
                                {mode === 'player' && !disabled && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignCategory(idxStr, '');
                                    }}
                                    className="text-[10px] text-rose-600 font-extrabold hover:underline shrink-0 mt-0.5"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Items Cards Pool */}
            {mode === 'player' && !disabled && (
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Unassigned Solutions ({unassignedCount} Remaining)
                  </h4>
                  {activeItem !== null && (
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                      1 card selected — Click a category box above to place
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((itemText, idx) => {
                    const idxStr = idx.toString();
                    const currentCat = categoryAssignments[idxStr];
                    if (currentCat) return null;
                    const isSelected = activeItem === idxStr;
                    const { title: itemTitle, desc: itemDesc } = parseItem(itemText);

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveItem(isSelected ? null : idxStr)}
                        className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500 shadow-md'
                            : 'bg-slate-900 border-slate-700 text-white hover:border-blue-500'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className={`text-sm font-black leading-snug ${
                            isSelected ? 'text-blue-900' : 'text-white'
                          }`}>
                            {itemTitle}
                          </p>
                          {itemDesc && (
                            <p className={`text-xs font-medium leading-relaxed ${
                              isSelected ? 'text-blue-700' : 'text-slate-300'
                            }`}>
                              {itemDesc}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignCategory(idxStr, cat.id);
                                if (activeItem === idxStr) setActiveItem(null);
                              }}
                              className="px-2.5 py-1.5 bg-white/10 hover:bg-blue-600 hover:text-white text-slate-200 border border-white/20 rounded-xl text-[10px] font-black transition shadow-xs flex items-center space-x-1"
                            >
                              <span>+</span>
                              <span>{cat.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // TYPE 3: SOLUTION_CHALLENGE (5-Step AI Solution Builder)
  // -------------------------------------------------------------
  if (qType === 'SOLUTION_CHALLENGE') {
    return (
      <Activity3ChallengeView
        question={question}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        onNavigateQuestion={onNavigateQuestion}
        disabled={disabled}
      />
    );
  }

  // -------------------------------------------------------------
  // TYPE 4: PROMPT_BUILDER (Interactive 2-Column Prompt Assembly)
  // -------------------------------------------------------------
  if (qType === 'PROMPT_BUILDER') {
    const pbData = question.promptBuilderData;
    const scenarioTitle = pbData?.scenarioTitle || question.questionText || 'Build an Effective Prompt';
    const scenarioText = pbData?.scenarioText || question.explanation || '';
    const pieces: { text: string; isCorrect: boolean }[] = pbData?.pieces || (question.options || []).map((opt) => ({ text: opt, isCorrect: true }));

    return (
      <div className="space-y-6 w-full font-sans text-slate-900 dark:text-slate-100">
        {/* Header Section */}
        <div className={`p-6 rounded-3xl border shadow-sm ${mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest">
              SECTION 2 — PROMPT ENGINEERING CHALLENGE
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white mb-3">{scenarioTitle}</h2>

          {scenarioText && (
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-slate-300 text-sm leading-relaxed mb-4">
              {scenarioText.split('\n\n').map((para, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                  {para.startsWith('Weak prompt:') || para.startsWith('Business requirement:') ? (
                    <span>
                      <strong className="text-white">{para.split(':')[0]}:</strong>
                      {para.substring(para.indexOf(':') + 1)}
                    </span>
                  ) : (
                    para
                  )}
                </p>
              ))}
            </div>
          )}

          <p className="text-sm font-bold text-blue-400">
            Select the useful pieces, arrange them, and review the prompt you created.
          </p>
        </div>

        {/* 2-Column Grid matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Select the useful pieces */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h3 className="text-lg font-black text-white">Select the useful pieces</h3>
              <p className="text-xs text-slate-400 mt-1">
                The options are shuffled. Select the five pieces needed for a strong prompt. Selection and arrangement order do not affect marks.
              </p>
            </div>

            <div className="space-y-2.5">
              {pieces.map((piece, idx) => {
                const isSelected = selectedPromptPieces.includes(piece.text);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => togglePromptPiece(piece.text)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-blue-100 shadow-md ring-1 ring-blue-500'
                        : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isSelected
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'border-slate-600 bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{piece.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Your prompt & Prompt created preview */}
          <div className="space-y-6">
            {/* Your prompt list with Up/Down arrows */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <div>
                <h3 className="text-lg font-black text-white">Your prompt</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Arrange the selected pieces to see the prompt you created.
                </p>
              </div>

              {selectedPromptPieces.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-medium">
                  Select pieces on the left to start building your prompt.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedPromptPieces.map((pieceText, pos) => (
                    <div
                      key={pos}
                      className="p-3 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between text-xs font-medium text-slate-200 shadow-sm"
                    >
                      <div className="flex items-start space-x-2 pr-2">
                        <span className="font-bold text-blue-400 shrink-0">{pos + 1}.</span>
                        <span className="leading-snug">{pieceText}</span>
                      </div>

                      {!disabled && (
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => movePromptPiece(pos, -1)}
                            disabled={pos === 0}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-slate-200 transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePromptPiece(pos, 1)}
                            disabled={pos === selectedPromptPieces.length - 1}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-slate-200 transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Prompt Created Preview Box */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Prompt created</h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-xs font-sans leading-relaxed min-h-[120px] whitespace-pre-wrap shadow-inner">
                {selectedPromptPieces.length > 0
                  ? selectedPromptPieces.join('\n\n')
                  : 'Select and arrange pieces to preview your prompt here.'}
              </div>
              {mode === 'player' && !disabled && !isAnswerSubmitted && selectedPromptPieces.length > 0 && onSelectSequence && (
                <button
                  type="button"
                  onClick={() => {
                    if (question.options) {
                      const idxs = selectedPromptPieces.map((text) => question.options!.indexOf(text)).filter((i) => i !== -1);
                      onSelectSequence(idxs);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 mt-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Prompt ✓</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Feedback if submitted or showing answers */}
        {showCorrectAnswer && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Exercise Result</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pieces.map((p, i) => {
                const isSelected = selectedPromptPieces.includes(p.text);
                if (!isSelected && !p.isCorrect) return null;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                      p.isCorrect
                        ? isSelected
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                    }`}
                  >
                    <span className="truncate mr-2">{p.text}</span>
                    {p.isCorrect ? (
                      isSelected ? (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 rounded font-black text-emerald-400 shrink-0">Correct (+3)</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 rounded font-black text-amber-400 shrink-0">Missed</span>
                      )
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 rounded font-black text-rose-400 shrink-0">Distractor (+0)</span>
                    )}
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
  // TYPE 5: SCENARIO_QUESTIONS (Scenario & Sub-Questions Challenge)
  // -------------------------------------------------------------
  if (qType === 'SCENARIO_QUESTIONS') {
    const rawScData = question.scenarioQuestionsData || (question as any).scenarioData || {};
    const scData = {
      scenarioTitle: rawScData.scenarioTitle || (question as any).scenarioTitle || question.questionText || 'Executive Business Scenario',
      scenarioText: rawScData.scenarioText || (question as any).scenarioText || question.explanation || 'Review the business scenario details carefully before answering.',
      backgroundContext: rawScData.backgroundContext || (question as any).backgroundContext || '',
      instructions: rawScData.instructions || (question as any).instructions || '',
      subQuestions: (rawScData.subQuestions && rawScData.subQuestions.length > 0)
        ? rawScData.subQuestions
        : ((question as any).subQuestions || []),
    };

    const subQuestions = scData.subQuestions;
    const totalSubQs = subQuestions.length;
    const answeredCount = Object.keys(scenarioSubAnswers).length;
    const shouldShowAll = showCorrectAnswer || mode === 'trainer' || mode === 'projector';

    const renderSubQuestion = (subQ: any, subIdx: number) => {
      const sqType = subQ.questionType || 'MCQ';
      const currentAnswer = scenarioSubAnswers[subIdx];
      const selectedOpt = currentAnswer?.selectedOptionIndex;
      const selectedIndices: number[] = currentAnswer?.selectedOptionIndices || [];
      const selectedSeq = currentAnswer?.selectedSequence || subSeqMap[subIdx] || (subQ.options ? subQ.options.map((_: any, i: number) => i) : []);
      const isSubAnswered = currentAnswer !== undefined && (
        sqType === 'MULTIPLE_SELECT'
          ? Array.isArray(selectedIndices) && selectedIndices.length > 0
          : true
      );
      const isSubCorrect = (showCorrectAnswer || mode === 'trainer' || mode === 'projector') && (
        sqType === 'CORRECT_SEQUENCE'
          ? Array.isArray(selectedSeq) && Array.isArray(subQ.correctOrder) &&
            selectedSeq.length === subQ.correctOrder.length &&
            selectedSeq.every((v: number, i: number) => v === subQ.correctOrder[i])
          : sqType === 'MULTIPLE_SELECT'
          ? Array.isArray(selectedIndices) && Array.isArray(subQ.correctOptionIndices) &&
            selectedIndices.length === subQ.correctOptionIndices.length &&
            selectedIndices.every((v: number) => subQ.correctOptionIndices.includes(v))
          : selectedOpt === subQ.correctOptionIndex
      );

      return (
        <div key={subQ.id || subIdx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Question {subIdx + 1} of {totalSubQs}
              {sqType === 'CORRECT_SEQUENCE' && ' • Sequence'}
              {sqType === 'MULTIPLE_SELECT' && ' • Multiple Select'}
              {sqType === 'TRUE_FALSE' && ' • True / False'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                {subQ.points !== undefined ? subQ.points : 250} pts
              </span>
              {isSubAnswered && !shouldShowAll && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Answered</span>
              )}
              {shouldShowAll && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  isSubCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {isSubCorrect ? `✓ Correct (+${subQ.points !== undefined ? subQ.points : 250} pts)` : '✗ Incorrect (+0 pts)'}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug">
            {subQ.questionText}
          </h3>

          {/* TRUE_FALSE */}
          {sqType === 'TRUE_FALSE' && (
            <div className="grid grid-cols-2 gap-3">
              {['True', 'False'].map((label, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrectOpt = shouldShowAll && subQ.correctOptionIndex === optIdx;
                const isWrongOpt = shouldShowAll && selectedOpt === optIdx && !isCorrectOpt;
                return (
                  <button key={label} type="button" disabled={disabled || shouldShowAll}
                    onClick={() => handleSubQuestionSelect(subIdx, optIdx)}
                    className={`py-4 rounded-2xl font-black text-sm border-2 transition ${
                      isCorrectOpt ? 'bg-emerald-500 text-white border-emerald-500' :
                      isWrongOpt ? 'bg-rose-500 text-white border-rose-500' :
                      isSelected ? 'bg-blue-600 text-white border-blue-600' :
                      'bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-400'
                    }`}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* MULTIPLE_SELECT */}
          {sqType === 'MULTIPLE_SELECT' && subQ.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {subQ.options.map((optText: string, optIdx: number) => {
                const isSelected = selectedIndices.includes(optIdx);
                const correctIndices: number[] = subQ.correctOptionIndices || [];
                const isCorrectOpt = shouldShowAll && correctIndices.includes(optIdx);
                const isWrongOpt = shouldShowAll && isSelected && !isCorrectOpt;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button key={optIdx} type="button" disabled={disabled || shouldShowAll}
                    onClick={() => handleSubQuestionMultiSelect(subIdx, optIdx)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition flex items-start space-x-3 ${
                      isCorrectOpt ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' :
                      isWrongOpt ? 'bg-rose-500 text-white border-rose-600 shadow-md' :
                      isSelected ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500' :
                      'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    }`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                      isSelected || isCorrectOpt || isWrongOpt ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>{letter}</span>
                    <span className="leading-snug pt-0.5">{optText}</span>
                    {isCorrectOpt && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-white" />}
                    {isWrongOpt && <XCircle className="w-4 h-4 ml-auto shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* MCQ */}
          {(sqType === 'MCQ' || (!sqType)) && subQ.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {subQ.options.map((optText: string, optIdx: number) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrectOpt = shouldShowAll && subQ.correctOptionIndex === optIdx;
                const isWrongOpt = shouldShowAll && selectedOpt === optIdx && !isCorrectOpt;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button key={optIdx} type="button" disabled={disabled || shouldShowAll}
                    onClick={() => handleSubQuestionSelect(subIdx, optIdx)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition flex items-start space-x-3 ${
                      isCorrectOpt ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' :
                      isWrongOpt ? 'bg-rose-500 text-white border-rose-600 shadow-md' :
                      isSelected ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500' :
                      'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    }`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                      isSelected || isCorrectOpt || isWrongOpt ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>{letter}</span>
                    <span className="leading-snug pt-0.5">{optText}</span>
                    {isCorrectOpt && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-white" />}
                    {isWrongOpt && <XCircle className="w-4 h-4 ml-auto shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* CORRECT_SEQUENCE */}
          {sqType === 'CORRECT_SEQUENCE' && subQ.options && (
            <div className="space-y-2">
              {selectedSeq.map((optIdx: number, pos: number) => {
                const stepText = subQ.options[optIdx] || `Step ${optIdx + 1}`;
                const correctPos = shouldShowAll ? subQ.correctOrder?.indexOf(optIdx) : null;
                return (
                  <div key={optIdx} className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    shouldShowAll
                      ? pos === correctPos ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">{pos + 1}</span>
                      <span className="text-sm font-bold text-slate-900">{stepText}</span>
                    </div>
                    {mode === 'player' && !disabled && !shouldShowAll && (
                      <div className="flex items-center space-x-1">
                        <button type="button" disabled={pos === 0}
                          onClick={() => {
                            const newSeq = [...selectedSeq];
                            [newSeq[pos], newSeq[pos - 1]] = [newSeq[pos - 1], newSeq[pos]];
                            handleSubSeqChange(subIdx, newSeq);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl text-slate-700 transition">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" disabled={pos === selectedSeq.length - 1}
                          onClick={() => {
                            const newSeq = [...selectedSeq];
                            [newSeq[pos], newSeq[pos + 1]] = [newSeq[pos + 1], newSeq[pos]];
                            handleSubSeqChange(subIdx, newSeq);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl text-slate-700 transition">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation feedback */}
          {shouldShowAll && subQ.explanation && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed">
              <span className="font-black text-slate-900 block mb-1">Explanation</span>
              {subQ.explanation}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6 w-full font-sans text-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Scenario Case Study */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl sticky top-4">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
                SCENARIO-BASED CHALLENGE
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">{scData.scenarioTitle}</h2>
            </div>

            <div className="p-4 bg-slate-800/90 border-l-4 border-purple-500 rounded-2xl text-xs md:text-sm leading-relaxed">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-400 block mb-2">Scenario</span>
              <div className="text-slate-200 whitespace-pre-wrap">{scData.scenarioText}</div>
            </div>

            {scData.instructions && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 space-y-1">
                <span className="font-black block uppercase text-[10px] tracking-wider text-amber-400">Instructions</span>
                <p className="leading-relaxed">{scData.instructions}</p>
              </div>
            )}

            {scData.backgroundContext && (
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl text-xs text-slate-300">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider mb-1">Key Context</span>
                <p className="leading-relaxed">{scData.backgroundContext}</p>
              </div>
            )}

            {/* Progress dots / sub-question switcher */}
            {totalSubQs > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
                  <span>Sub-Questions Navigation</span>
                  <span>{answeredCount} / {totalSubQs} answered</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {subQuestions.map((_: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveSubQIdx(i)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition ${
                        i === activeSubQIdx
                          ? 'bg-purple-500 border-purple-400 text-white shadow-md ring-2 ring-purple-400/30'
                          : scenarioSubAnswers[i] !== undefined
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-400'
                      }`}
                      title={`Go to Sub-Question ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 space-y-5">
            {shouldShowAll ? (
              // Trainer, Projector, or Review mode: show all sub-Qs
              subQuestions.map((subQ: any, subIdx: number) => renderSubQuestion(subQ, subIdx))
            ) : (
              // Student Play mode: show current active sub-Q
              <>
                {totalSubQs > 0 && renderSubQuestion(subQuestions[activeSubQIdx], activeSubQIdx)}

                {/* Next / Finish button */}
                {mode === 'player' && !disabled && (
                  <button type="button"
                    onClick={() => advanceSubQ(totalSubQs)}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition ${
                      scenarioSubAnswers[activeSubQIdx] !== undefined
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={scenarioSubAnswers[activeSubQIdx] === undefined}
                  >
                    {activeSubQIdx < totalSubQs - 1 ? `Next Sub-Question (${activeSubQIdx + 2} of ${totalSubQs}) →` : 'Finish & Submit Scenario ✓'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
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
