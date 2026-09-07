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
  questionIndex?: number;
  totalQuestions?: number;
  onNavigateQuestion?: (idx: number) => void;
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
  questionIndex = 0,
  totalQuestions = 5,
  onNavigateQuestion,
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
  const [selectedPromptPieces, setSelectedPromptPieces] = useState<string[]>([]);

  // State for Solution Challenge
  const [solStep, setSolStep] = useState<number>(1);
  const [solApproach, setSolApproach] = useState<string | null>(null);
  const [solCaps, setSolCaps] = useState<Set<number>>(new Set());
  const [solWorkflow, setSolWorkflow] = useState<number[]>([]);
  const [solAutonomy, setSolAutonomy] = useState<number | null>(null);
  const [solEvaluated, setSolEvaluated] = useState<boolean>(false);

  // State for Scenario Questions
  const [scenarioSubAnswers, setScenarioSubAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (question.options) {
      setSequence(question.options.map((_, idx) => idx));
    }
    setSelectedPromptPieces([]);
    setScenarioSubAnswers({});
  }, [question]);

  const handleSubQuestionSelect = (subIdx: number, optIdx: number) => {
    if (disabled) return;
    const updated = { ...scenarioSubAnswers, [subIdx]: optIdx };
    setScenarioSubAnswers(updated);
    if (onSelectOption) {
      onSelectOption(optIdx);
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
    if (onSelectSequence && question.options) {
      const opts = question.options;
      const idxs = updated.map((text) => opts.indexOf(text)).filter((i) => i !== -1);
      onSelectSequence(idxs);
    }
  };

  const movePromptPiece = (fromIdx: number, delta: number) => {
    if (disabled) return;
    const toIdx = fromIdx + delta;
    if (toIdx < 0 || toIdx >= selectedPromptPieces.length) return;
    const updated = [...selectedPromptPieces];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setSelectedPromptPieces(updated);
    if (onSelectSequence && question.options) {
      const opts = question.options;
      const idxs = updated.map((text) => opts.indexOf(text)).filter((i) => i !== -1);
      onSelectSequence(idxs);
    }
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
    const data = question.solutionChallengeData || {
      icon: '📈',
      dept: question.topic || 'Customer Analytics',
      answer: 'Machine Learning',
      capabilities: [
        { text: 'Historical customer data', isCorrect: true },
        { text: 'Relevant customer features', isCorrect: true },
        { text: 'Train a prediction model', isCorrect: true },
        { text: 'Test model accuracy', isCorrect: true },
        { text: 'New customer data for prediction', isCorrect: true },
        { text: 'Generate social media posts', isCorrect: false },
        { text: 'Write marketing emails', isCorrect: false },
      ],
      workflow: [
        { text: 'Collect historical customer data', isCorrect: true },
        { text: 'Prepare and clean data', isCorrect: true },
        { text: 'Train ML model', isCorrect: true },
        { text: 'Test model accuracy', isCorrect: true },
        { text: 'Use new data to predict churn', isCorrect: true },
        { text: 'Review prediction results', isCorrect: true },
        { text: 'Generate marketing content', isCorrect: false },
      ],
      autonomy: [
        { title: 'Human reviews predictions before taking action', isCorrect: true, description: 'The model predicts; a person decides how to act.' },
        { title: 'AI automatically contacts every predicted customer', isCorrect: false, description: 'The prediction should support the sales team\'s decision.' },
        { title: 'AI automatically cancels predicted customers', isCorrect: false, description: 'A prediction should not directly trigger cancellation.' },
      ],
      controlTitle: 'Step 4: Decide how the prediction should be used',
      why: 'Machine Learning learns patterns from historical data and uses them to predict which customers may cancel.',
    };

    const scenarioTitle = question.questionText || 'Customer Churn Prediction';
    const problemText = question.options?.[0] || 'A company has 3 years of customer data and wants to predict churn.';

    const approachesList = [
      { name: 'Machine Learning', icon: '📈', desc: 'Learns from data to make predictions.' },
      { name: 'AI Copilot', icon: '🤝', desc: 'Assists a person with their work.' },
      { name: 'AI Agent', icon: '⚙️', desc: 'Performs multi-step tasks using tools.' },
      { name: 'Generative AI', icon: '✨', desc: 'Creates new content.' },
      { name: 'Automation', icon: '🔄', desc: 'Follows predefined rules and steps.' },
    ];

    const toggleCap = (idx: number) => {
      if (disabled || solEvaluated) return;
      const next = new Set(solCaps);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      setSolCaps(next);
    };

    const toggleWf = (idx: number) => {
      if (disabled || solEvaluated) return;
      if (solWorkflow.includes(idx)) {
        setSolWorkflow(solWorkflow.filter((i) => i !== idx));
      } else {
        setSolWorkflow([...solWorkflow, idx]);
      }
    };

    const evalScore = () => {
      const approachOk = solApproach === data.answer;
      const appScore = approachOk ? 20 : 0;

      const correctCapsIndices: number[] = data.capabilities.map((c: any, i: number) => (c.isCorrect ? i : null)).filter((x: any): x is number => x !== null);
      const selCapsArr = Array.from(solCaps);
      const capOk = selCapsArr.filter((i) => data.capabilities[i]?.isCorrect);
      const capWrong = selCapsArr.filter((i) => !data.capabilities[i]?.isCorrect);
      const capMissed = correctCapsIndices.filter((i: number) => !solCaps.has(i));
      const capUnit = 25 / (correctCapsIndices.length || 1);
      const cScore = Math.max(0, Math.min(25, capOk.length * capUnit - capWrong.length * (capUnit * 0.5)));

      const correctWfIndices: number[] = data.workflow.map((w: any, i: number) => (w.isCorrect ? i : null)).filter((x: any): x is number => x !== null);
      const wfOk = solWorkflow.filter((i) => data.workflow[i]?.isCorrect);
      const wfWrong = solWorkflow.filter((i) => !data.workflow[i]?.isCorrect);
      const wfMissed = correctWfIndices.filter((i: number) => !solWorkflow.includes(i));
      const wfUnit = 30 / (correctWfIndices.length || 1);
      const correctOrder = wfOk.length === correctWfIndices.length && wfOk.every((idx, pos) => correctWfIndices[pos] === idx);
      const orderBonus = correctOrder ? 5 : 0;
      const wScore = Math.max(0, Math.min(35, wfOk.length * wfUnit - wfWrong.length * (wfUnit * 0.5) + orderBonus));

      const autoCorrectIdx = data.autonomy.findIndex((a: any) => a.isCorrect);
      const autoOk = solAutonomy === autoCorrectIdx;
      const aScore = autoOk ? 20 : 0;

      const total = Math.round(Math.max(0, Math.min(100, appScore + cScore + wScore + aScore)));

      return {
        total,
        appScore,
        cScore: Math.round(cScore),
        wScore: Math.round(wScore),
        aScore,
        approachOk,
        autoOk,
        capOk,
        capWrong,
        capMissed,
        wfOk,
        wfWrong,
        wfMissed,
        correctOrder,
      };
    };

    const res = evalScore();

    return (
      <div className="w-full font-sans text-slate-900 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Business Scenario */}
          <div className="lg:col-span-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl sticky top-4">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
                Challenge {questionIndex + 1} of {totalQuestions} • {data.dept || 'Sales'}
              </span>
              <h2 className="text-xl md:text-2xl font-black flex items-center space-x-2">
                <span>{data.icon}</span>
                <span>{scenarioTitle}</span>
              </h2>
            </div>

            <div className="p-4 bg-slate-800/80 border-l-4 border-blue-500 rounded-2xl text-xs md:text-sm leading-relaxed space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-400 block">Business challenge</span>
              <p className="text-slate-200">{problemText}</p>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-300">Your goal: </span>
              <p>Select the best solution choices and build a simple design for this exact challenge.</p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200 text-xs space-y-1.5 leading-relaxed">
              <span className="font-black block uppercase text-[10px] tracking-wider text-amber-400">How to complete the challenge</span>
              <p>Select all choices you believe belong in the solution. Correct choices earn marks. Missing a correct choice reduces marks. Selecting a non-relevant or incorrect choice also reduces marks.</p>
            </div>

            {/* Scenario Navigation Buttons (Q1 - Q5) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              {Array.from({ length: totalQuestions }).map((_, qIdx) => {
                const isCurrent = questionIndex === qIdx;
                return (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => onNavigateQuestion?.(qIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    Q{qIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Stepper & Builder Card */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top Stepper Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
              {[
                { step: 1, label: '1. Choose approach' },
                { step: 2, label: '2. Choose capabilities' },
                { step: 3, label: '3. Build workflow' },
                { step: 4, label: '4. Set human control' },
                { step: 5, label: '5. Evaluate' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setSolStep(s.step)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap ${
                    solStep === s.step
                      ? 'bg-blue-600 text-white shadow-md'
                      : s.step < solStep || solEvaluated
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step 1: Choose AI Approach */}
            {solStep === 1 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Step 1: Choose the AI approach</h3>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">Choose carefully: </span>
                    one answer is the best fit. Selecting a wrong answer reduces marks.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {approachesList.map((app) => {
                    const isSelected = solApproach === app.name;
                    return (
                      <div
                        key={app.name}
                        onClick={() => !disabled && setSolApproach(app.name)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500 shadow-md'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-3xl">{app.icon}</div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900">{app.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{app.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!solApproach}
                    onClick={() => setSolStep(2)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-black text-xs transition shadow-sm"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Choose Capabilities */}
            {solStep === 2 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Step 2: Select the capabilities you need</h3>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">Select all that apply. </span>
                    Correct selections earn marks. Missing a correct option loses marks. Selecting a distractor also reduces marks.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.capabilities.map((c: any, i: number) => {
                    const isSel = solCaps.has(i);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleCap(i)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-start space-x-3 ${
                          isSel
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                            isSel ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isSel ? '✓' : ''}
                        </div>
                        <span className="text-xs font-bold leading-snug">{c.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSolStep(1)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolStep(3)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition shadow-sm"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Build Workflow */}
            {solStep === 3 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Step 3: Build the workflow</h3>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">Select the relevant workflow blocks. </span>
                    Their order matters. Distractor blocks reduce marks.
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Available Blocks:</span>
                  <div className="flex flex-wrap gap-2">
                    {data.workflow.map((w: any, i: number) => {
                      const isSel = solWorkflow.includes(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleWf(i)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold transition border ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-700'
                              : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          {isSel ? '✓ ' : '＋ '}{w.text}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 min-h-[160px]">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Workflow Sequence:</span>
                  {solWorkflow.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">Click blocks above to build your solution sequence...</p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {solWorkflow.map((wIdx, pos) => (
                        <div
                          key={wIdx}
                          className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[10px]">
                              {pos + 1}
                            </span>
                            <span>{data.workflow[wIdx]?.text}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWf(wIdx)}
                            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-black"
                          >
                            × Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSolStep(2)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolStep(4)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition shadow-sm"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Set Human Control */}
            {solStep === 4 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{data.controlTitle || 'Step 4: Decide how the AI and human work together'}</h3>
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">Choose the option that best fits this challenge. </span>
                    The other options are distractors and will reduce marks if selected.
                  </div>
                </div>

                <div className="space-y-3">
                  {data.autonomy.map((a: any, i: number) => {
                    const isSel = solAutonomy === i;
                    return (
                      <div
                        key={i}
                        onClick={() => !disabled && setSolAutonomy(i)}
                        className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                          isSel
                            ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <h4 className="font-black text-sm text-slate-900">{a.title}</h4>
                        <p className="text-xs text-slate-500">{a.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSolStep(3)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={solApproach === null || solAutonomy === null}
                    onClick={() => {
                      setSolEvaluated(true);
                      setSolStep(5);
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-xs transition shadow-md"
                  >
                    ✓ Evaluate My Solution
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Final Evaluation & Results */}
            {solStep === 5 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between">
                  <span>✓ Evaluation Complete — Solution scored.</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-black text-xs">
                    {res.total} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">1. AI Approach</span>
                    <p className="text-base font-black text-slate-900">{res.appScore} / 20</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">2. Capabilities</span>
                    <p className="text-base font-black text-slate-900">{res.cScore} / 25</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">3. Workflow</span>
                    <p className="text-base font-black text-slate-900">{res.wScore} / 35</p>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">4. Human Control</span>
                    <p className="text-base font-black text-slate-900">{res.aScore} / 20</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1 leading-relaxed">
                  <span className="font-black uppercase text-[10px] tracking-wider text-blue-600 block">Why this is the best solution</span>
                  <p className="font-semibold">{data.why}</p>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSolStep(4)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs"
                  >
                    ← Review Control
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolStep(1)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs"
                  >
                    Re-try Challenge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
            </div>
          </div>
        </div>

        {/* Evaluation Feedback if submitted or showing answers */}
        {(showCorrectAnswer || isAnswerSubmitted) && (
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
    const scData = question.scenarioQuestionsData || {
      scenarioTitle: question.questionText || 'Executive Business Scenario',
      scenarioText: question.explanation || 'Review the business scenario details carefully before answering.',
      backgroundContext: 'Consider all strategic objectives, operational constraints, and technology requirements.',
      subQuestions: [
        {
          id: 'q1',
          questionText: 'What is the primary objective described in the scenario?',
          options: ['Option A: Expand Market Reach', 'Option B: Reduce Operational Bottlenecks', 'Option C: Upgrade Legacy Hardware'],
          correctOptionIndex: 1,
          explanation: 'The scenario explicitly highlights reducing operational bottlenecks.',
        },
      ],
    };

    const subQuestions = scData.subQuestions || [];
    const answeredCount = Object.keys(scenarioSubAnswers).length;

    return (
      <div className="space-y-6 w-full font-sans text-slate-900 dark:text-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Scenario Case Study */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl sticky top-4">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
                SCENARIO-BASED CHALLENGE
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">{scData.scenarioTitle}</h2>
            </div>

            {/* Scenario Text */}
            <div className="p-4 bg-slate-800/90 border-l-4 border-purple-500 rounded-2xl text-xs md:text-sm leading-relaxed space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-400 block">Scenario Details</span>
              <div className="text-slate-200 whitespace-pre-wrap">{scData.scenarioText}</div>
            </div>

            {/* Background Context */}
            {scData.backgroundContext && (
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl text-xs text-slate-300 space-y-1">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">Key Context & Rules</span>
                <p className="leading-relaxed">{scData.backgroundContext}</p>
              </div>
            )}

            {/* Progress Badge */}
            <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-2xl text-xs font-bold text-purple-300 flex items-center justify-between">
              <span>Sub-Questions Progress:</span>
              <span className="font-black px-2 py-0.5 bg-purple-500/30 rounded-lg text-white">
                {answeredCount} / {subQuestions.length} Answered
              </span>
            </div>
          </div>

          {/* Right Panel: Sub-Questions List */}
          <div className="lg:col-span-7 space-y-5">
            {subQuestions.map((subQ, subIdx) => {
              const selectedOpt = scenarioSubAnswers[subIdx];
              return (
                <div key={subQ.id || subIdx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      Question {subIdx + 1} of {subQuestions.length}
                    </span>
                    {selectedOpt !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <span>✓ Answered</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug">
                    {subQ.questionText}
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {subQ.options.map((optText, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleSubQuestionSelect(subIdx, optIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition flex items-start space-x-3 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                              isSelected ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-snug pt-0.5">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Show Feedback if Evaluated */}
                  {(showCorrectAnswer || isAnswerSubmitted) && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                        selectedOpt === subQ.correctOptionIndex
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}
                    >
                      <div className="font-extrabold flex items-center space-x-1.5 mb-1">
                        <span>{selectedOpt === subQ.correctOptionIndex ? '✓ Correct Answer' : '✗ Incorrect'}</span>
                        <span>• Correct Option: {String.fromCharCode(65 + subQ.correctOptionIndex)}</span>
                      </div>
                      {subQ.explanation && <p className="opacity-90">{subQ.explanation}</p>}
                    </div>
                  )}
                </div>
              );
            })}
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
