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
  BookOpen,
  Clock,
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
  selectedOptionIndices?: number[];
  onSelectOption?: (index: number) => void;
  onSelectMultipleOptions?: (indices: number[]) => void;
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
  selectedOptionIndices,
  onSelectOption,
  onSelectMultipleOptions,
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

  // State for Multiple Select Questions
  const [localMultiSelected, setLocalMultiSelected] = useState<number[]>(selectedOptionIndices || []);

  const questionId = question?._id ? String(question._id) : (question as any)?.id ? String((question as any).id) : question?.questionText || '';

  // Shuffled options list per question instance (ensures random order in each game session)
  const displayItems = React.useMemo(() => {
    if (!question?.options || question.options.length === 0) return [];
    const list = question.options.map((text, originalIndex) => ({ text, originalIndex }));
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [questionId, question?.options?.length, qType]);

  useEffect(() => {
    if (question?.options) {
      setSequence(question.options.map((_, idx) => idx));
    }
    setSelectedPromptPieces([]);
    setScenarioSubAnswers({});
    setActiveSubQIdx(0);
    
    // Pre-shuffle subSeqMap for CORRECT_SEQUENCE sub-questions
    const initialSubSeq: Record<number, number[]> = {};
    const subQs = question?.scenarioQuestionsData?.subQuestions || (question as any)?.subQuestions || [];
    subQs.forEach((sq: any, sIdx: number) => {
      if (sq.questionType === 'CORRECT_SEQUENCE' && sq.options && sq.options.length > 1) {
        const indices = sq.options.map((_: any, i: number) => i);
        let shuffled = [...indices];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        let isSame = true;
        for (let k = 0; k < shuffled.length; k++) {
          if (shuffled[k] !== indices[k]) { isSame = false; break; }
        }
        if (isSame && shuffled.length > 1) {
          [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
        initialSubSeq[sIdx] = shuffled;
      }
    });
    setSubSeqMap(initialSubSeq);
    setLocalMultiSelected(selectedOptionIndices || []);
  }, [questionId, selectedOptionIndices]);

  const toggleMultiOption = (idx: number) => {
    if (disabled) return;
    setLocalMultiSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

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

      // Parse inline formatting: **bold** and _italic_
      const parseInline = (str: string): React.ReactNode[] => {
        const tokens: React.ReactNode[] = [];
        let remaining = str;
        let key = 0;
        while (remaining.length > 0) {
          // Bold
          const boldIdx = remaining.indexOf('**');
          const italicIdx = remaining.indexOf('_');

          const nextIdx = Math.min(
            boldIdx >= 0 ? boldIdx : Infinity,
            italicIdx >= 0 ? italicIdx : Infinity
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
    { badge: 'bg-rose-600 text-white', playerBg: 'bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100/80', playerSelected: 'bg-rose-600 text-white border-rose-700 shadow-lg ring-2 ring-rose-500', trainerBg: 'bg-rose-50/90 border-rose-200 text-rose-950 font-extrabold', projectorBg: 'bg-rose-600/90 border-rose-400/40 text-white', letter: 'A' },
    { badge: 'bg-blue-600 text-white', playerBg: 'bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100/80', playerSelected: 'bg-blue-600 text-white border-blue-700 shadow-lg ring-2 ring-blue-500', trainerBg: 'bg-blue-50/90 border-blue-200 text-blue-950 font-extrabold', projectorBg: 'bg-blue-600/90 border-blue-400/40 text-white', letter: 'B' },
    { badge: 'bg-amber-500 text-white', playerBg: 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100/80', playerSelected: 'bg-amber-500 text-white border-amber-600 shadow-lg ring-2 ring-amber-500', trainerBg: 'bg-amber-50/90 border-amber-200 text-amber-950 font-extrabold', projectorBg: 'bg-amber-500/90 border-amber-300/40 text-slate-950', letter: 'C' },
    { badge: 'bg-purple-600 text-white', playerBg: 'bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100/80', playerSelected: 'bg-purple-600 text-white border-purple-700 shadow-lg ring-2 ring-purple-500', trainerBg: 'bg-purple-50/90 border-purple-200 text-purple-950 font-extrabold', projectorBg: 'bg-purple-600/90 border-purple-400/40 text-white', letter: 'D' },
  ];

  const renderScenarioDetailsBanner = () => {
    const sc = question.scenarioQuestionsData || (question as any).scenarioData || (question as any).scenarioQuestions || {};
    const scenarioTitle = sc.scenarioTitle || (question as any).scenarioTitle || (question as any).parentScenarioTitle || (question as any).topic || '';
    const scenarioText = sc.scenarioText || (question as any).scenarioText || (question as any).scenario || (question as any).parentScenarioText || '';
    const instructions = sc.instructions || (question as any).instructions || (question as any).scenarioInstructions || '';
    const backgroundContext = sc.backgroundContext || (question as any).backgroundContext || (question as any).keyContext || (question as any).context || '';

    if (!scenarioTitle && !scenarioText && !backgroundContext) return null;

    const subIdx = (question as any).subQuestionIndex ?? (question as any).subIdx ?? (question as any).subQuestionIdx;
    const totalSub = (question as any).totalSubQuestions ?? (question as any).totalSub ?? (question as any).totalSubQuestionsCount;

    return (
      <div className={`p-5 sm:p-7 rounded-3xl border space-y-3 mb-4 transition-all shadow-sm ${
        mode === 'projector'
          ? 'bg-purple-950/90 border-purple-500/40 text-purple-100'
          : 'bg-purple-50/90 border-purple-200 text-purple-950'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black uppercase tracking-wider text-purple-900">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-800 shrink-0" />
            <span>
              SCENARIO CASE STUDY
              {subIdx !== undefined && totalSub !== undefined ? ` • SUB-QUESTION ${Number(subIdx) + 1} OF ${totalSub}` : ''}
            </span>
          </div>
          {scenarioTitle && (
            <span className="bg-purple-200 text-purple-950 px-3 py-1 rounded-xl text-xs font-black">
              {scenarioTitle}
            </span>
          )}
        </div>
        {scenarioText && (
          <p className={`text-xl md:text-2xl lg:text-3xl font-black leading-tight tracking-tight whitespace-pre-wrap py-2 ${mode === 'projector' ? 'text-slate-100' : 'text-purple-950'}`}>
            {scenarioText}
          </p>
        )}
        {instructions && (
          <p className="text-xs font-bold text-amber-950 bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-200 mt-1 inline-block">
            💡 {instructions}
          </p>
        )}
        {backgroundContext && (
          <p className="text-xs md:text-sm font-semibold text-slate-800 pt-1">
            <strong className="font-extrabold text-slate-950">Key Context:</strong> {backgroundContext}
          </p>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // TYPE 1: CORRECT_SEQUENCE (Re-order Steps)
  // -------------------------------------------------------------
  if (qType === 'CORRECT_SEQUENCE') {
    return (
      <div className="space-y-6 w-full font-sans">
        {renderScenarioDetailsBanner()}
        <SequenceChallengeView
          question={question}
          mode={mode}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          onNavigateQuestion={onNavigateQuestion}
          onSelectSequence={onSelectSequence}
          disabled={disabled || isAnswerSubmitted}
          isAnswerSubmitted={isAnswerSubmitted}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // TYPE 2: DRAG_AND_DROP / CATEGORIZATION
  // -------------------------------------------------------------
  if (qType === 'DRAG_AND_DROP') {
    const items = question.options || [];
    const categories = (question.categories && question.categories.length > 0)
      ? question.categories
      : [
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

    // Helper to get target correct category for item original index
    const getCorrectCategory = (originalIdx: number) => {
      const idxStr = originalIdx.toString();
      const catId = question.categoryAssignments?.[idxStr];
      if (catId) {
        const found = categories.find((c) => c.id === catId);
        if (found) return found;
      }
      const itemsPerCat = Math.max(1, Math.ceil(items.length / categories.length));
      const catIdx = Math.floor(originalIdx / itemsPerCat);
      return categories[catIdx] || categories[0] || { id: 'unknown', title: 'Default Category' };
    };

    // Determine if we should display the Grouped By Category Answer Key (only when answers are explicitly revealed)
    const isShowingAnswerGrouped = Boolean(showCorrectAnswer);

    return (
      <div className="space-y-6 w-full font-sans">
        {renderScenarioDetailsBanner()}
        <div className={`p-6 rounded-3xl border shadow-sm ${mode === 'projector' ? 'bg-slate-900 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">
            {isDropdownCases ? 'AI COMBINATION CHALLENGE' : 'SOLUTION CATEGORIZATION'}
          </span>
          <h2 className="text-xl md:text-2xl font-black">{renderQuestionText(question.questionText)}</h2>
          <p className={`text-xs sm:text-sm opacity-85 mt-2 font-medium leading-relaxed ${mode === 'projector' ? 'text-slate-300' : 'text-slate-600'}`}>
            {isShowingAnswerGrouped
              ? `Correct Answer Key — Solutions grouped by target category (${categories.length} categories).`
              : (question.explanation || (
                  items.length === 12
                    ? "Categorize each of the 12 solutions into the category that best describes it. Select a category directly on each card item."
                    : items.length === 6
                    ? "Choose the best combination for each real-life case."
                    : "Assign each card to its correct category."
                ))
            }
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW A: SHOW ANSWER / RESULTS — GROUPED BY CATEGORY           */}
        {/* ------------------------------------------------------------- */}
        {isShowingAnswerGrouped ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h3 className="text-sm font-black uppercase text-purple-700 tracking-wider">
                  Correct Answer Key — By Category
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  All {items.length} solution items classified under their correct target categories.
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-xl text-xs font-black">
                {categories.length} Categories
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                // Find all items whose target correct category is cat.id
                const correctItems = items
                  .map((text, originalIndex) => ({ text, originalIndex }))
                  .filter(({ originalIndex }) => getCorrectCategory(originalIndex).id === cat.id);

                return (
                  <div
                    key={cat.id}
                    className={`p-5 rounded-3xl border space-y-3 shadow-sm ${
                      mode === 'projector'
                        ? 'bg-slate-900 border-white/20 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase text-purple-700">
                          {cat.title}
                        </h4>
                        {cat.description && (
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{cat.description}</p>
                        )}
                      </div>
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-lg text-[10px] font-black">
                        {correctItems.length} {correctItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Solutions List */}
                    <div className="space-y-2.5 pt-1">
                      {correctItems.length === 0 ? (
                        <p className="text-xs text-slate-400 italic font-medium">No items assigned to this category.</p>
                      ) : (
                        correctItems.map(({ text, originalIndex }) => {
                          const idxStr = originalIndex.toString();
                          const { title: itemTitle, desc: itemDesc } = parseItem(text);
                          const userAssignedCatId = categoryAssignments[idxStr];
                          const userAssignedCat = categories.find((c) => c.id === userAssignedCatId);
                          const isUserCorrect = userAssignedCatId === cat.id;

                          return (
                            <div
                              key={originalIndex}
                              className={`p-3.5 rounded-2xl border transition space-y-1.5 ${
                                mode === 'projector'
                                  ? 'bg-slate-800/80 border-slate-700 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <p className="text-xs font-medium">
                                    <strong className="font-bold">• Title:</strong> {itemTitle}
                                  </p>
                                  {itemDesc && (
                                    <p className="text-xs font-medium opacity-85 leading-relaxed pl-3">
                                      <strong className="font-bold">Description:</strong> {itemDesc}
                                    </p>
                                  )}
                                </div>
                                
                                {mode === 'player' && showCorrectAnswer && (
                                  <div className="shrink-0">
                                    {isUserCorrect ? (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-black flex items-center space-x-1">
                                        <span>✓</span> <span>Correct</span>
                                      </span>
                                    ) : userAssignedCat ? (
                                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-[10px] font-black flex items-center space-x-1">
                                        <span>✗</span> <span>You chose: {userAssignedCat.title}</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-black">
                                        Unassigned
                                      </span>
                                    )}
                                  </div>
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
          </div>
        ) : isDropdownCases ? (
          /* ------------------------------------------------------------- */
          /* VIEW B: ACTIVE PLAY — DROPDOWN CASES (SHUFFLED OPTIONS)       */
          /* ------------------------------------------------------------- */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayItems.map(({ text: itemText, originalIndex }, displayIdx) => {
                const idxStr = originalIndex.toString();
                const selectedCat = categoryAssignments[idxStr] || '';
                const caseTitle = `Case ${displayIdx + 1}`;
                const cleanText = itemText.replace(/^Case \d+:\s*/i, '');

                return (
                  <div
                    key={originalIndex}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm transition ${
                      (mode as string) === 'projector'
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
                        onChange={(e) => handleAssignCategory(idxStr, e.target.value)}
                        className={`w-full p-3 rounded-xl border text-xs md:text-sm font-bold transition focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${
                          (mode as string) === 'projector'
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
            {mode === 'player' && !disabled && !isAnswerSubmitted && onSelectCategoryAssignments && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectCategoryAssignments(categoryAssignments)}
                  disabled={Object.keys(categoryAssignments).length === 0}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg ${
                    Object.keys(categoryAssignments).length > 0
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-[0.98] cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Submit Categorization Answer ✓ ({Object.keys(categoryAssignments).length} of {items.length} Assigned)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW C: ACTIVE PLAY — SOLUTION CARDS (SHUFFLED OPTIONS)      */
          /* ------------------------------------------------------------- */
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-md">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-black text-amber-300 text-sm shrink-0">
                  {items.length - unassignedCount}/{items.length}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-200 tracking-wider">Categorization Progress</h4>
                  <p className="text-xs text-purple-300 font-medium">
                    {unassignedCount === 0
                      ? '🎉 All items categorized!'
                      : `${unassignedCount} item${unassignedCount > 1 ? 's' : ''} remaining`}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-48 bg-slate-800/80 h-3 rounded-full overflow-hidden border border-purple-400/30">
                <div
                  className="bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(((items.length - unassignedCount) / items.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cards List with Integrated Category Selectors (Shuffled Order) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayItems.map(({ text: itemText, originalIndex }, displayIdx) => {
                const idxStr = originalIndex.toString();
                const assignedCatId = categoryAssignments[idxStr] || '';
                const assignedCat = categories.find((c) => c.id === assignedCatId);
                const { title: itemTitle, desc: itemDesc } = parseItem(itemText);

                return (
                  <div
                    key={originalIndex}
                    className={`p-5 rounded-2xl border transition space-y-4 shadow-md ${
                      assignedCat
                        ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-purple-400/60 ring-2 ring-purple-500/40 text-white'
                        : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/80 text-white hover:border-purple-400/40'
                    }`}
                  >
                    {/* Item Header & Status Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-400">
                        Item {displayIdx + 1}
                      </span>
                      {assignedCat ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold flex items-center space-x-1">
                          <span>✓</span>
                          <span>{assignedCat.title}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-xl text-[11px] font-bold">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Item Title & Desc */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-black leading-snug text-white">{itemTitle}</h4>
                      {itemDesc && (
                        <p className="text-xs font-medium leading-relaxed text-slate-300">{itemDesc}</p>
                      )}
                    </div>

                    {/* Direct Category Controls */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-800">
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        Select Category
                      </label>

                      {/* Dropdown Selector */}
                      <select
                        disabled={disabled}
                        value={assignedCatId}
                        onChange={(e) => handleAssignCategory(idxStr, e.target.value)}
                        className="w-full p-3 rounded-xl border text-xs sm:text-sm font-bold transition focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer bg-slate-800 border-slate-700 text-white hover:border-purple-500"
                      >
                        <option value="">Choose Category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.title}
                          </option>
                        ))}
                      </select>

                      {/* Quick-Select Category Pill Buttons */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {categories.map((cat) => {
                          const isSelected = assignedCatId === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleAssignCategory(idxStr, isSelected ? '' : cat.id)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ${
                                isSelected
                                  ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {isSelected && <span>✓</span>}
                              <span>{cat.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button for Drag & Drop Categorization */}
            {mode === 'player' && !disabled && !isAnswerSubmitted && onSelectCategoryAssignments && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectCategoryAssignments(categoryAssignments)}
                  disabled={Object.keys(categoryAssignments).length === 0}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg ${
                    Object.keys(categoryAssignments).length > 0
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-600/30 active:scale-[0.98] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Submit Categorization Answer ✓ ({Object.keys(categoryAssignments).length} of {items.length} Assigned)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // TYPE 3: SOLUTION_CHALLENGE (5-Step AI Solution Builder)
  // -------------------------------------------------------------
  if (qType === 'SOLUTION_CHALLENGE') {
    return (
      <div className="space-y-6 w-full font-sans">
        {renderScenarioDetailsBanner()}
        <Activity3ChallengeView
          question={question}
          mode={mode}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          onNavigateQuestion={onNavigateQuestion}
          disabled={disabled}
        />
      </div>
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
    const isInteractive = mode === 'player' && !disabled && !isAnswerSubmitted;
    const correctPiecesInOrder = pieces.filter((p) => p.isCorrect);

    return (
      <div className="space-y-6 w-full font-sans text-slate-900">
        {renderScenarioDetailsBanner()}
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
                    disabled={!isInteractive}
                    onClick={() => togglePromptPiece(piece.text)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-blue-100 shadow-md ring-1 ring-blue-500'
                        : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    } ${!isInteractive ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
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

                      {isInteractive && (
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
              {isInteractive && selectedPromptPieces.length > 0 && onSelectSequence && (
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

        {/* Evaluation Feedback & Target Correct Prompt Reveal */}
        {showCorrectAnswer && (
          <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Correct Target Prompt Answer Key</span>
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  All {correctPiecesInOrder.length} required prompt pieces assembled in exact logical sequence.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-black">
                {correctPiecesInOrder.length} Pieces
              </span>
            </div>

            {/* List all 5 correct options in full text in order */}
            <div className="space-y-2.5">
              {correctPiecesInOrder.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-850 border border-emerald-500/30 rounded-2xl flex items-start space-x-3 text-xs font-semibold text-emerald-100 shadow-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed flex-1">{p.text}</span>
                </div>
              ))}
            </div>

            {/* Combined Target Prompt Box */}
            <div className="pt-2">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Complete Assembled Target Prompt</p>
              <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-mono leading-relaxed whitespace-pre-wrap shadow-inner">
                {correctPiecesInOrder.map((p) => p.text).join('\n\n')}
              </div>
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
    const shouldShowAll = showCorrectAnswer;

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
      const isSubCorrect = showCorrectAnswer && (
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
          {/* Sub-Question Header Badge */}
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Question {subIdx + 1} of {totalSubQs}
              {sqType === 'CORRECT_SEQUENCE' && ' • Sequence'}
              {sqType === 'MULTIPLE_SELECT' && ' • Multiple Select'}
              {sqType === 'TRUE_FALSE' && ' • True / False'}
              {sqType === 'DRAG_AND_DROP' && ' • Drag & Drop'}
              {sqType === 'PROMPT_BUILDER' && ' • Prompt Builder'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                {subQ.timeLimit !== undefined ? subQ.timeLimit : 20}s timer
              </span>
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

          {/* Embedded Scenario Details Header at Each Sub-Question */}
          {scData.scenarioTitle && (
            <div className="p-3.5 bg-purple-50/90 border border-purple-200/90 rounded-2xl space-y-1 text-purple-950">
              <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700">
                <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>SCENARIO DETAILS: {scData.scenarioTitle}</span>
              </div>
              {scData.scenarioText && (
                <p className="text-xs font-semibold text-purple-900 leading-relaxed">
                  {scData.scenarioText}
                </p>
              )}
              {scData.instructions && (
                <p className="text-[11px] font-bold text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/60 mt-1">
                  💡 {scData.instructions}
                </p>
              )}
              {scData.backgroundContext && (
                <p className="text-[11px] font-medium text-slate-700 pt-0.5">
                  <strong className="font-bold text-slate-900">Key Context:</strong> {scData.backgroundContext}
                </p>
              )}
            </div>
          )}

          {/* Question Text */}
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
              {(shouldShowAll ? (subQ.correctOrder && subQ.correctOrder.length > 0 ? subQ.correctOrder : subQ.options.map((_: any, i: number) => i)) : selectedSeq).map((optIdx: number, pos: number) => {
                const stepText = subQ.options[optIdx] || `Step ${optIdx + 1}`;
                const targetOrder = subQ.correctOrder && subQ.correctOrder.length > 0 ? subQ.correctOrder : subQ.options.map((_: any, i: number) => i);
                const isCorrectPos = shouldShowAll || (selectedSeq[pos] === targetOrder[pos]);
                return (
                  <div key={optIdx} className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                    shouldShowAll
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                      : isSubAnswered
                      ? isCorrectPos ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                        shouldShowAll ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {pos + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{stepText}</span>
                    </div>

                    {shouldShowAll ? (
                      <span className="px-3 py-1 bg-emerald-600 text-white border border-emerald-500 rounded-xl text-xs font-black shrink-0">
                        Step {pos + 1}
                      </span>
                    ) : mode === 'player' && !disabled && !shouldShowAll && (
                      <div className="flex items-center space-x-2">
                        {/* Position Picker Dropdown for Mobile 1-Tap Reordering */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-black uppercase text-slate-400">Pos:</span>
                          <select
                            disabled={disabled}
                            value={pos + 1}
                            onChange={(e) => {
                              const targetPos = parseInt(e.target.value, 10) - 1;
                              if (targetPos < 0 || targetPos >= selectedSeq.length || targetPos === pos) return;
                              const newSeq = [...selectedSeq];
                              const [moved] = newSeq.splice(pos, 1);
                              newSeq.splice(targetPos, 0, moved);
                              handleSubSeqChange(subIdx, newSeq);
                            }}
                            className="p-1.5 rounded-xl border bg-slate-50 border-slate-300 text-blue-700 font-extrabold text-xs outline-none cursor-pointer hover:border-blue-500"
                          >
                            {selectedSeq.map((_: any, pIdx: number) => (
                              <option key={pIdx} value={pIdx + 1}>
                                {pIdx + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Touch-Friendly Move Up / Down Buttons */}
                        <div className="flex items-center space-x-1">
                          <button type="button" disabled={pos === 0}
                            onClick={() => {
                              const newSeq = [...selectedSeq];
                              [newSeq[pos], newSeq[pos - 1]] = [newSeq[pos - 1], newSeq[pos]];
                              handleSubSeqChange(subIdx, newSeq);
                            }}
                            className="p-2 min-w-[34px] min-h-[34px] flex items-center justify-center bg-slate-100 hover:bg-blue-600 hover:text-white disabled:opacity-30 rounded-xl text-slate-700 transition">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button type="button" disabled={pos === selectedSeq.length - 1}
                            onClick={() => {
                              const newSeq = [...selectedSeq];
                              [newSeq[pos], newSeq[pos + 1]] = [newSeq[pos + 1], newSeq[pos]];
                              handleSubSeqChange(subIdx, newSeq);
                            }}
                            className="p-2 min-w-[34px] min-h-[34px] flex items-center justify-center bg-slate-100 hover:bg-blue-600 hover:text-white disabled:opacity-30 rounded-xl text-slate-700 transition">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DRAG_AND_DROP inside Sub-Question */}
          {sqType === 'DRAG_AND_DROP' && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-500 font-bold">Assign each card to its matching category:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(subQ.categories || [
                  { id: 'cat1', title: 'Category 1' },
                  { id: 'cat2', title: 'Category 2' }
                ]).map((cat: any) => (
                  <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-black uppercase text-blue-600">{cat.title}</span>
                    <select
                      disabled={disabled || shouldShowAll}
                      value={scenarioSubAnswers[subIdx]?.categoryAssignments?.[cat.id] || ''}
                      onChange={(e) => {
                        const current = scenarioSubAnswers[subIdx]?.categoryAssignments || {};
                        const updated = { ...current, [cat.id]: e.target.value };
                        setScenarioSubAnswers({
                          ...scenarioSubAnswers,
                          [subIdx]: { ...scenarioSubAnswers[subIdx], categoryAssignments: updated }
                        });
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="">Choose item...</option>
                      {(subQ.options || []).map((optText: string, oIdx: number) => (
                        <option key={oIdx} value={optText}>{optText.split('||')[0]}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROMPT_BUILDER inside Sub-Question */}
          {sqType === 'PROMPT_BUILDER' && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-500 font-bold">Select the useful prompt pieces:</p>
              <div className="space-y-2">
                {(subQ.options || subQ.pieces || []).map((opt: any, optIdx: number) => {
                  const pieceText = typeof opt === 'string' ? opt : opt.text;
                  const selectedPieces = scenarioSubAnswers[subIdx]?.selectedPromptPieces || [];
                  const isChecked = selectedPieces.includes(pieceText);
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={disabled || shouldShowAll}
                      onClick={() => {
                        const updated = isChecked
                          ? selectedPieces.filter((p: string) => p !== pieceText)
                          : [...selectedPieces, pieceText];
                        setScenarioSubAnswers({
                          ...scenarioSubAnswers,
                          [subIdx]: { ...scenarioSubAnswers[subIdx], selectedPromptPieces: updated }
                        });
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                        isChecked ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 bg-white'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{pieceText}</span>
                    </button>
                  );
                })}
              </div>
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
  // DEFAULT: MCQ, MULTIPLE_SELECT & TRUE_FALSE
  // -------------------------------------------------------------
  const options = question.options && question.options.length > 0
    ? question.options
    : ['Option A', 'Option B', 'Option C', 'Option D'];

  const actualCorrectIndex =
    correctOptionIndex !== undefined && correctOptionIndex !== null
      ? correctOptionIndex
      : question.correctOptionIndex;

  const correctIndicesList = Array.isArray(question.correctOptionIndices) && question.correctOptionIndices.length > 0
    ? question.correctOptionIndices
    : (actualCorrectIndex !== undefined && actualCorrectIndex !== null ? [actualCorrectIndex] : []);

  // Helper to parse "Title||Description" for standard options
  const parseOpt = (text: string): { title: string; desc: string } => {
    const sep = text.indexOf('||');
    if (sep === -1) return { title: text, desc: '' };
    return { title: text.slice(0, sep).trim(), desc: text.slice(sep + 2).trim() };
  };

  if (mode === 'projector') {
    return (
      <div className="space-y-8 w-full">
        {renderScenarioDetailsBanner()}
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
            const isCorrect = showCorrectAnswer && correctIndicesList.includes(idx);
            const { title: optTitle, desc: optDesc } = parseOpt(optText);

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
                <div className="flex-1 space-y-1">
                  <span className="text-lg sm:text-2xl font-extrabold tracking-tight leading-snug block">
                    {optTitle}
                  </span>
                  {optDesc && (
                    <span className="text-sm font-medium opacity-85 leading-snug block">
                      {optDesc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'trainer') {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {renderScenarioDetailsBanner()}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider">
            {question.category || 'GENERAL QUIZ'}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-500">
            Points: {question.points || 1000}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight py-2">
          {renderQuestionText(question.questionText)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {options.map((optText, idx) => {
            const theme = optionThemes[idx % 4];
            const isCorrect = showCorrectAnswer && correctIndicesList.includes(idx);
            const { title: optTitle, desc: optDesc } = parseOpt(optText);

            return (
              <div
                key={idx}
                className={`p-5 sm:p-6 rounded-2xl border flex items-center justify-between transition shadow-xs ${
                  isCorrect
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black shadow-md ring-2 ring-emerald-500'
                    : theme.trainerBg
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0 pr-2">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${theme.badge}`}>
                    {theme.letter}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-base md:text-lg font-black text-slate-900 leading-snug block">{optTitle}</span>
                    {optDesc && <span className="text-xs font-medium text-slate-500 block leading-snug">{optDesc}</span>}
                  </div>
                </div>

                {isCorrect && (
                  <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
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

  // -------------------------------------------------------------
  // PLAYER MODE: MULTIPLE_SELECT
  // -------------------------------------------------------------
  if (qType === 'MULTIPLE_SELECT' && mode === 'player') {
    return (
      <div className="space-y-6 w-full">
        {renderScenarioDetailsBanner()}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
              MULTIPLE SELECT (CHECKBOXES)
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
          <p className="text-xs font-bold text-amber-800">
            💡 Select all correct options that apply, then click Submit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {options.map((optText, idx) => {
            const isSelected = localMultiSelected.includes(idx);
            const isCorrect = showCorrectAnswer && correctIndicesList.includes(idx);
            const isUserWrong = showCorrectAnswer && isSelected && !isCorrect;
            const { title: optTitle, desc: optDesc } = parseOpt(optText);

            let cardStyle = "bg-white border-slate-200 text-slate-800 hover:border-amber-400";
            if (isSelected) {
              cardStyle = "bg-amber-50/90 border-2 border-amber-500 text-amber-950 shadow-md";
            }
            if (showCorrectAnswer) {
              if (isCorrect) {
                cardStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black";
              } else if (isUserWrong) {
                cardStyle = "bg-rose-50 border-2 border-rose-400 text-rose-950";
              } else {
                cardStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || showCorrectAnswer}
                onClick={() => toggleMultiOption(idx)}
                className={`p-5 rounded-2xl font-extrabold text-left transition-all flex items-center justify-between space-x-4 shadow-xs ${cardStyle} ${
                  disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-black shrink-0 transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-base font-black tracking-tight leading-snug block">
                      {optTitle}
                    </span>
                    {optDesc && (
                      <span className="text-xs font-semibold opacity-85 leading-snug block">
                        {optDesc}
                      </span>
                    )}
                  </div>
                </div>

                {showCorrectAnswer && isCorrect && (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black flex items-center space-x-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CORRECT</span>
                  </span>
                )}
                {showCorrectAnswer && isUserWrong && (
                  <span className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-black flex items-center space-x-1 shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>WRONG</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!disabled && !isAnswerSubmitted && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSelectMultipleOptions && onSelectMultipleOptions(localMultiSelected)}
              disabled={localMultiSelected.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg ${
                localMultiSelected.length > 0
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/25 active:scale-[0.98] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-amber-200" />
              <span>Submit Multiple Answers ({localMultiSelected.length} Selected) ✓</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Player Mode MCQ / TRUE_FALSE
  return (
    <div className="space-y-6 w-full">
      {renderScenarioDetailsBanner()}
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
          const isCorrect = showCorrectAnswer && correctIndicesList.includes(idx);
          const isUserWrong =
            showCorrectAnswer && userAnswerIndex === idx && !isCorrect;

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

          const { title: optTitle, desc: optDesc } = parseOpt(optText);

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
              <div className="flex items-start space-x-3.5 min-w-0 pr-2">
                <span
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isSelected || (showCorrectAnswer && (isCorrect || isUserWrong))
                      ? 'bg-white/20 text-white'
                      : theme.badge
                  }`}
                >
                  {theme.letter}
                </span>
                <div className="space-y-1">
                  <span className="text-base md:text-lg font-black tracking-tight leading-snug block">
                    {optTitle}
                  </span>
                  {optDesc && (
                    <span className="text-xs font-semibold opacity-85 leading-snug block">
                      {optDesc}
                    </span>
                  )}
                </div>
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
