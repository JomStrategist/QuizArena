'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Info,
  ShieldAlert,
  Award,
  Zap,
} from 'lucide-react';
import { IQuestion, ISolutionChallengeData, ISolutionChallengeCapability, ISolutionChallengeWorkflowStep, ISolutionChallengeAutonomy } from '@/types';

interface Activity3ChallengeViewProps {
  question: Partial<IQuestion>;
  questionIndex?: number;
  totalQuestions?: number;
  onNavigateQuestion?: (idx: number) => void;
  onCompleteChallenge?: (result: any) => void;
  disabled?: boolean;
}

const APPROACHES_LIST = [
  {
    name: 'Generative AI',
    icon: '✨',
    desc: 'Creates original text, code, images, audio, or video based on prompts.',
  },
  {
    name: 'AI Copilot',
    icon: '💡',
    desc: 'Assists human workers in real-time by drafting, suggesting, and recommending.',
  },
  {
    name: 'AI Agent',
    icon: '🤖',
    desc: 'Performs multi-step tasks autonomously using tools, APIs, and business systems.',
  },
  {
    name: 'Machine Learning',
    icon: '📈',
    desc: 'Finds patterns in numerical or structured data to make statistical predictions.',
  },
  {
    name: 'Automation',
    icon: '🔄',
    desc: 'Executes fixed, deterministic rule-based workflows without AI generation.',
  },
];

// Helper to shuffle array deterministically or randomly for attempt
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const Activity3ChallengeView: React.FC<Activity3ChallengeViewProps> = ({
  question,
  questionIndex = 0,
  totalQuestions = 5,
  onNavigateQuestion,
  onCompleteChallenge,
  disabled = false,
}) => {
  const challengeData: ISolutionChallengeData = (question?.solutionChallengeData || {}) as ISolutionChallengeData;
  const questionId = question._id ? question._id.toString() : '';

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User selections using stable IDs
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null);
  const [selectedCapIds, setSelectedCapIds] = useState<string[]>([]);
  const [selectedWfIds, setSelectedWfIds] = useState<string[]>([]);
  const [selectedAutonomyId, setSelectedAutonomyId] = useState<string | null>(null);
  const [selectedRiskOptId, setSelectedRiskOptId] = useState<string | null>(null);

  // Shuffled items for frontend rendering (preserves stable IDs!)
  const [shuffledCaps, setShuffledCaps] = useState<ISolutionChallengeCapability[]>([]);
  const [shuffledWf, setShuffledWf] = useState<ISolutionChallengeWorkflowStep[]>([]);
  const [shuffledAutonomy, setShuffledAutonomy] = useState<ISolutionChallengeAutonomy[]>([]);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Timer state per challenge
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Initialize & shuffle on question change or reset
  useEffect(() => {
    setCurrentStep(1);
    setSelectedApproach(null);
    setSelectedCapIds([]);
    setSelectedWfIds([]);
    setSelectedAutonomyId(null);
    setSelectedRiskOptId(null);
    setEvaluationResult(null);
    setEvaluationError(null);
    setSecondsSpent(0);
    setTimerRunning(true);

    const caps: ISolutionChallengeCapability[] = challengeData.capabilities || [];
    const wf: ISolutionChallengeWorkflowStep[] = challengeData.workflow || [];
    const auto: ISolutionChallengeAutonomy[] = challengeData.autonomy || [];

    setShuffledCaps(shuffleArray(caps));
    setShuffledWf(shuffleArray(wf));
    setShuffledAutonomy(auto); // keep autonomy options order clean
  }, [questionId]);

  // Challenge Timer hook
  useEffect(() => {
    if (!timerRunning || evaluationResult) return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, evaluationResult]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Capabilities selection toggle
  const toggleCapability = (capId: string) => {
    if (disabled || evaluationResult) return;
    if (selectedCapIds.includes(capId)) {
      setSelectedCapIds(selectedCapIds.filter((id) => id !== capId));
    } else {
      setSelectedCapIds([...selectedCapIds, capId]);
    }
  };

  // Workflow block toggle & sequence manager
  const toggleWorkflowBlock = (wfId: string) => {
    if (disabled || evaluationResult) return;
    if (selectedWfIds.includes(wfId)) {
      setSelectedWfIds(selectedWfIds.filter((id) => id !== wfId));
    } else {
      setSelectedWfIds([...selectedWfIds, wfId]);
    }
  };

  const moveWorkflowStep = (fromIdx: number, delta: number) => {
    if (disabled || evaluationResult) return;
    const toIdx = fromIdx + delta;
    if (toIdx < 0 || toIdx >= selectedWfIds.length) return;
    const updated = [...selectedWfIds];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setSelectedWfIds(updated);
  };

  // Submit to Backend Evaluation Endpoint
  const handleEvaluate = async () => {
    if (!selectedApproach || !selectedAutonomyId) return;

    setIsEvaluating(true);
    setEvaluationError(null);
    setTimerRunning(false);

    try {
      const res = await fetch('/api/v1/quizzes/activity3/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: questionId,
          approach: selectedApproach,
          capabilityIds: selectedCapIds,
          workflowSequenceIds: selectedWfIds,
          autonomyId: selectedAutonomyId,
          riskOptionId: selectedRiskOptId,
          timeSpentSeconds: secondsSpent,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEvaluationResult(json.data);
        setCurrentStep(5);
        if (onCompleteChallenge) {
          onCompleteChallenge(json.data);
        }
      } else {
        setEvaluationError(json.error?.message || 'Evaluation failed. Please try again.');
        setTimerRunning(true);
      }
    } catch (err: any) {
      setEvaluationError(err.message || 'Network error evaluating solution.');
      setTimerRunning(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedApproach(null);
    setSelectedCapIds([]);
    setSelectedWfIds([]);
    setSelectedAutonomyId(null);
    setSelectedRiskOptId(null);
    setEvaluationResult(null);
    setEvaluationError(null);
    setSecondsSpent(0);
    setTimerRunning(true);
  };

  const scenarioTitle = question.questionText || 'AI Business Challenge';
  const scenarioText = question.options && question.options.length > 0 ? question.options[0] : question.explanation || '';
  const objective = challengeData.objective || 'Solve the business problem using optimal AI tools and workflow design.';
  const constraints = challengeData.constraints || '';

  return (
    <div className="w-full font-sans text-slate-900 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Business Scenario & Navigation */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl sticky top-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
              Challenge {questionIndex + 1} of {totalQuestions} • {challengeData.dept || 'Operations'}
            </span>
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono font-bold text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsSpent)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black flex items-center space-x-2">
              <span className="text-2xl">{challengeData.icon || '🚀'}</span>
              <span>{scenarioTitle}</span>
            </h2>
          </div>

          <div className="p-4 bg-slate-800/90 border-l-4 border-blue-500 rounded-2xl text-xs md:text-sm leading-relaxed space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-400 block">Business Scenario</span>
            <p className="text-slate-200">{scenarioText}</p>
          </div>

          {objective && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl text-xs text-blue-200 space-y-1">
              <span className="font-bold text-blue-400 block text-[10px] uppercase tracking-wider">Primary Objective</span>
              <p>{objective}</p>
            </div>
          )}

          {constraints && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-xs text-rose-200 space-y-1">
              <span className="font-bold text-rose-400 block text-[10px] uppercase tracking-wider">Business Guardrails & Constraints</span>
              <p>{constraints}</p>
            </div>
          )}

          {/* Navigation Controls across Challenges (Q1..Q5) */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Switch Challenge</span>
            <div className="flex flex-wrap items-center gap-2">
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
        </div>

        {/* Right Column: Stepper & Step Panels */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Stepper Navigation Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
            {[
              { step: 1, label: '1. Approach' },
              { step: 2, label: '2. Capabilities' },
              { step: 3, label: '3. Workflow' },
              { step: 4, label: '4. Human Control' },
              { step: 5, label: '5. Evaluation' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 whitespace-nowrap flex items-center space-x-1.5 ${
                  currentStep === s.step
                    ? 'bg-blue-600 text-white shadow-md'
                    : evaluationResult
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : s.step < currentStep
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: Choose AI Approach */}
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Step 1 of 4 • 20 Marks
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Choose the Core AI Approach</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select the technology architecture that best fits this specific business challenge.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {APPROACHES_LIST.map((app) => {
                  const isSelected = selectedApproach === app.name;
                  return (
                    <div
                      key={app.name}
                      onClick={() => !disabled && setSelectedApproach(app.name)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500 shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="text-3xl">{app.icon}</div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 flex items-center justify-between">
                          <span>{app.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{app.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!selectedApproach}
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-black text-xs transition shadow-sm flex items-center space-x-2"
                >
                  <span>Continue to Capabilities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Capabilities */}
          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Step 2 of 4 • 25 Marks
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Select Required System Capabilities</h3>
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900">Select all that apply. </span>
                  Correct capability choices earn marks. Selecting distractor capabilities or omitting correct ones will deduct marks.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shuffledCaps.map((c) => {
                  const isSelected = selectedCapIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleCapability(c.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="text-xs font-bold leading-snug text-slate-800">{c.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition shadow-sm flex items-center space-x-2"
                >
                  <span>Continue to Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Build Workflow */}
          {currentStep === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Step 3 of 4 • 35 Marks (30 Steps + 5 Order Bonus)
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Build the Solution Workflow Sequence</h3>
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900">Click available blocks to add them to your sequence. </span>
                  Arrange them in the exact logical execution order. Matching exact sequence grants a +5 Bonus!
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Available Workflow Blocks:</span>
                <div className="flex flex-wrap gap-2">
                  {shuffledWf.map((w) => {
                    const isSelected = selectedWfIds.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => toggleWorkflowBlock(w.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold transition border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? '✓ ' : '＋ '}{w.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 min-h-[160px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Solution Sequence:</span>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedWfIds.length} steps added</span>
                </div>

                {selectedWfIds.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-8 text-center">
                    Click available blocks above to construct your step-by-step workflow sequence...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedWfIds.map((wfId, pos) => {
                      const item = (challengeData.workflow || []).find((w: any) => w.id === wfId);
                      return (
                        <div
                          key={wfId}
                          className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center space-x-3 pr-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                              {pos + 1}
                            </span>
                            <span className="leading-snug">{item?.text || wfId}</span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveWorkflowStep(pos, -1)}
                              disabled={pos === 0}
                              className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200"
                              title="Move step up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveWorkflowStep(pos, 1)}
                              disabled={pos === selectedWfIds.length - 1}
                              className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200"
                              title="Move step down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWorkflowBlock(wfId)}
                              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-black ml-1"
                            >
                              × Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition shadow-sm flex items-center space-x-2"
                >
                  <span>Continue to Human Control</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Set Human Control & Guardrails */}
          {currentStep === 4 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Step 4 of 4 • 20 Marks
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {challengeData.controlTitle || 'Establish Human Control & Autonomy Level'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select the appropriate oversight framework balancing operational speed with risk management.
                </p>
              </div>

              <div className="space-y-3">
                {shuffledAutonomy.map((a) => {
                  const isSelected = selectedAutonomyId === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => !disabled && setSelectedAutonomyId(a.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                        isSelected
                          ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900">{a.title}</h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{a.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Optional Guardrail Risk Question (Question 5) */}
              {challengeData.riskQuestion && (
                <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">
                      {challengeData.riskQuestion.title || 'Guardrail Risk Check'}
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-slate-200">{challengeData.riskQuestion.text}</p>

                  <div className="space-y-2 pt-1">
                    {challengeData.riskQuestion.options?.map((opt: any) => {
                      const isSel = selectedRiskOptId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedRiskOptId(opt.id)}
                          className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold transition ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {evaluationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                  {evaluationError}
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedApproach || !selectedAutonomyId || isEvaluating}
                  onClick={handleEvaluate}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-xs transition shadow-md flex items-center space-x-2"
                >
                  {isEvaluating ? (
                    <span>Evaluating Solution...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>✓ Evaluate My Solution</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Final Server Evaluation & Detailed Rationale */}
          {currentStep === 5 && evaluationResult && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Header Evaluation Status Card */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  evaluationResult.totalScore >= 90
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : evaluationResult.totalScore >= 75
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-75">Evaluation Result</span>
                  <h3 className="text-xl font-black">{evaluationResult.performanceTitle}</h3>
                  <p className="text-xs mt-0.5 opacity-90">
                    Completed in {formatTimer(evaluationResult.timeSpentSeconds || secondsSpent)}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-3xl font-black">{evaluationResult.totalScore}</span>
                    <span className="text-sm font-bold opacity-75"> / 100</span>
                  </div>
                </div>
              </div>

              {/* 4 Score Category Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">1. AI Approach</span>
                  <p className="text-lg font-black text-slate-900">
                    {evaluationResult.breakdown.approach.score} / {evaluationResult.breakdown.approach.max}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">2. Capabilities</span>
                  <p className="text-lg font-black text-slate-900">
                    {evaluationResult.breakdown.capabilities.score} / {evaluationResult.breakdown.capabilities.max}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">3. Workflow</span>
                  <p className="text-lg font-black text-slate-900 flex items-center justify-center space-x-1">
                    <span>{evaluationResult.breakdown.workflow.score} / {evaluationResult.breakdown.workflow.max}</span>
                    {evaluationResult.breakdown.workflow.sequenceBonus > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500 text-white rounded font-bold" title="Exact order bonus earned!">
                        +5
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">4. Human Control</span>
                  <p className="text-lg font-black text-slate-900">
                    {evaluationResult.breakdown.autonomy.score} / {evaluationResult.breakdown.autonomy.max}
                  </p>
                </div>
              </div>

              {/* Approach Review Rationale */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Approach Evaluation</span>
                  {evaluationResult.breakdown.approach.isCorrect ? (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-full">✓ Correct Choice</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded-full">
                      Selected: {evaluationResult.breakdown.approach.selected} (Correct: {evaluationResult.breakdown.approach.correct})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {evaluationResult.breakdown.approach.rationale}
                </p>
              </div>

              {/* Capabilities Review */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Capabilities Review</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evaluationResult.breakdown.capabilities.items?.map((capItem: any) => {
                    const isGood = capItem.isCorrect && capItem.isSelected;
                    const isMissed = capItem.isCorrect && !capItem.isSelected;
                    const isDistractor = !capItem.isCorrect && capItem.isSelected;

                    if (!capItem.isSelected && !capItem.isCorrect) return null; // hide non-selected distractors

                    return (
                      <div
                        key={capItem.id}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                          isGood
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : isMissed
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <span>{capItem.text}</span>
                        {isGood && <span className="text-[10px] font-black text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">✓ Correct</span>}
                        {isMissed && <span className="text-[10px] font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">Missed</span>}
                        {isDistractor && <span className="text-[10px] font-black text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded">Distractor Penalty</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Why This is the Best Solution Card */}
              <div className="p-5 bg-blue-900 text-white rounded-2xl space-y-2 leading-relaxed shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block">
                  Why this is the best solution architecture
                </span>
                <p className="text-xs md:text-sm text-slate-100 font-medium">{evaluationResult.whySolution}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Re-try Challenge</span>
                </button>
                {questionIndex < totalQuestions - 1 && (
                  <button
                    type="button"
                    onClick={() => onNavigateQuestion?.(questionIndex + 1)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center space-x-2 shadow-sm"
                  >
                    <span>Next Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
