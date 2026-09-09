'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  GripVertical,
  Check,
  Layers,
  Award,
  Zap,
  Play,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface PracticeTrialViewProps {
  onClose: () => void;
}

export const PracticeTrialView: React.FC<PracticeTrialViewProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [selectedTf, setSelectedTf] = useState<number | null>(null);

  // Drag & Drop practice state
  const [dragAssignments, setDragAssignments] = useState<Record<string, string>>({});

  // Sequence ordering practice state
  const [sequenceSteps, setSequenceSteps] = useState<string[]>([
    'Define Role & Goal',
    'Provide Context & Input Data',
    'Specify Clear Instructions',
    'Set Output Constraints & Format',
  ]);

  // Prompt Builder practice state
  const [selectedPromptBlocks, setSelectedPromptBlocks] = useState<{
    role?: string;
    context?: string;
    task?: string;
    format?: string;
  }>({});

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const practiceQuestions = [
    {
      type: 'MCQ',
      title: 'Practice 1: Multiple Choice (MCQ)',
      badge: 'MCQ Question',
      description: 'Select the single best answer from the options below.',
      questionText: 'What is the primary benefit of defining a specific Role in a system prompt?',
      options: [
        'It sets clear behavior boundaries and domain expertise for the AI model.',
        'It makes the model process tokens faster.',
        'It automatically corrects spelling mistakes in user input.',
        'It reduces the cost of API tokens.',
      ],
      correctIndex: 0,
      explanation: 'Setting a clear role (e.g. "Act as a Senior Data Scientist") grounds the AI\'s persona and domain expertise.',
    },
    {
      type: 'TRUE_FALSE',
      title: 'Practice 2: True or False',
      badge: 'Binary Decision',
      description: 'Evaluate the statement and select True or False.',
      questionText: 'True or False: Providing concrete examples (Few-Shot Prompting) improves model accuracy for complex tasks.',
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: 'True! Few-shot prompting guides the model with clear target output patterns.',
    },
    {
      type: 'DRAG_DROP',
      title: 'Practice 3: Drag & Drop Categorization',
      badge: 'Category Matching',
      description: 'Assign each AI scenario card to its correct AI Category.',
      cards: [
        { id: 'c1', text: 'Translating English to French' },
        { id: 'c2', text: 'Detecting defects in factory images' },
      ],
      categories: [
        { id: 'nlp', name: 'Natural Language Processing (NLP)' },
        { id: 'cv', name: 'Computer Vision (CV)' },
      ],
      correctAssignments: { c1: 'nlp', c2: 'cv' },
    },
    {
      type: 'SEQUENCE',
      title: 'Practice 4: Correct Sequence / Ordering',
      badge: 'Sequence Reordering',
      description: 'Use the Up/Down arrows to reorder the steps in logical sequence.',
      correctSequence: [
        'Define Role & Goal',
        'Provide Context & Input Data',
        'Specify Clear Instructions',
        'Set Output Constraints & Format',
      ],
    },
    {
      type: 'PROMPT_BUILDER',
      title: 'Practice 5: RCTOF Prompt Builder',
      badge: 'Interactive Block Builder',
      description: 'Assemble a complete structured prompt by choosing blocks for Role, Context, Task, and Format.',
      blocks: {
        role: ['Act as an Expert AI Engineer', 'Act as a General Assistant'],
        context: ['Working on an enterprise web platform', 'Writing a personal blog'],
        task: ['Generate a clean JSON API schema', 'Write a short story'],
        format: ['Format as valid JSON', 'Format as plain text'],
      },
    },
  ];

  const moveSequenceStep = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || toIdx < 0 || toIdx >= sequenceSteps.length || fromIdx === toIdx) return;
    const copy = [...sequenceSteps];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setSequenceSteps(copy);
  };

  const handleNextStep = () => {
    if (currentStep < practiceQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedMcq(null);
    setSelectedTf(null);
    setDragAssignments({});
    setSelectedPromptBlocks({});
    setIsCompleted(false);
  };

  const currentQ = practiceQuestions[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-blue-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans animate-in fade-in duration-300">
      
      {/* TOP NAVBAR HEADER */}
      <div className="flex items-center justify-between max-w-3xl mx-auto w-full border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Practice Warmup Trial</h2>
            <p className="text-[10px] text-amber-300 font-bold tracking-wide uppercase">
              Try Question Types Before Game Starts
            </p>
          </div>
        </div>

        {/* Skip / Exit Button */}
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 border border-white/15"
          title="Skip Trial and return to waiting lobby"
        >
          <X className="w-4 h-4" />
          <span>Skip Trial</span>
        </button>
      </div>

      {/* CENTER PRACTICE STAGE */}
      <div className="my-auto max-w-3xl mx-auto w-full space-y-6 py-6">
        
        {isCompleted ? (
          /* COMPLETION SCREEN */
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center space-y-6 animate-in zoom-in-95 duration-400">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-black uppercase tracking-wider">
                WARMUP COMPLETE!
              </span>
              <h1 className="text-3xl font-black text-white">You&apos;re 100% Ready for the Live Game!</h1>
              <p className="text-xs text-blue-200 font-medium max-w-md mx-auto">
                You have practiced all key question types. When the trainer starts the live quiz, you will immediately jump into the live contest!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-2xl transition border border-white/20 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Practice Trial</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-2xl transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Back to Waiting Lobby</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE PRACTICE STEP CARD */
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl animate-in fade-in duration-300">
            
            {/* Step Progress & Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black uppercase">
                  {currentQ.badge}
                </span>
                <span className="text-xs font-bold text-blue-200">
                  Step {currentStep + 1} of {practiceQuestions.length}
                </span>
              </div>

              {/* Step Dots */}
              <div className="flex items-center space-x-1.5">
                {practiceQuestions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-6 bg-amber-400'
                        : idx < currentStep
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Header & Prompt */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentQ.title}
              </h3>
              <p className="text-xs text-blue-200 font-medium">{currentQ.description}</p>
            </div>

            {/* 1. MCQ STEP */}
            {currentQ.type === 'MCQ' && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-white bg-white/5 p-4 rounded-2xl border border-white/10">
                  {currentQ.questionText}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = selectedMcq === optIdx;
                    const isCorrect = optIdx === currentQ.correctIndex;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedMcq(optIdx)}
                        className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-bold border transition flex items-center justify-between ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-400 text-rose-200'
                            : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-mono font-black text-xs">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white/20">
                            {isCorrect ? '✓ Correct' : '✕ Try Again'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedMcq !== null && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-xs font-semibold text-emerald-200">
                    💡 {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

            {/* 2. TRUE / FALSE STEP */}
            {currentQ.type === 'TRUE_FALSE' && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-white bg-white/5 p-4 rounded-2xl border border-white/10">
                  {currentQ.questionText}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = selectedTf === optIdx;
                    return (
                      <button
                        key={opt}
                        onClick={() => setSelectedTf(optIdx)}
                        className={`p-5 rounded-2xl text-center font-black text-lg border transition ${
                          isSelected
                            ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-lg scale-[1.02]'
                            : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedTf !== null && (
                  <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-2xl text-xs font-semibold text-blue-200">
                    💡 {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

            {/* 3. DRAG & DROP STEP */}
            {currentQ.type === 'DRAG_DROP' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.categories?.map((cat) => (
                    <div key={cat.id} className="p-4 bg-white/5 border border-white/15 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black uppercase text-amber-300 tracking-wide">{cat.name}</h4>
                      <div className="space-y-2 min-h-[60px]">
                        {currentQ.cards?.map((card) => {
                          const assignedCat = dragAssignments[card.id];
                          const isAssignedToThis = assignedCat === cat.id;
                          return (
                            <button
                              key={card.id}
                              onClick={() => setDragAssignments({ ...dragAssignments, [card.id]: cat.id })}
                              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold border transition ${
                                isAssignedToThis
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                              }`}
                            >
                              {card.text} {isAssignedToThis ? '✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SEQUENCE REORDERING STEP */}
            {currentQ.type === 'SEQUENCE' && (
              <div className="space-y-3 pt-2">
                {sequenceSteps.map((stepText, sIdx) => (
                  <div
                    key={stepText}
                    className="p-3.5 bg-white/10 border border-white/15 rounded-2xl flex items-center justify-between space-x-3 text-xs font-bold text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                        {sIdx + 1}
                      </span>
                      <span>{stepText}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveSequenceStep(sIdx, sIdx - 1)}
                        disabled={sIdx === 0}
                        className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSequenceStep(sIdx, sIdx + 1)}
                        disabled={sIdx === sequenceSteps.length - 1}
                        className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. PROMPT BUILDER STEP */}
            {currentQ.type === 'PROMPT_BUILDER' && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(currentQ.blocks || {}).map(([key, options]) => (
                    <div key={key} className="p-3 bg-white/5 border border-white/15 rounded-2xl space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-amber-300">{key}</label>
                      <select
                        value={selectedPromptBlocks[key as keyof typeof selectedPromptBlocks] || ''}
                        onChange={(e) =>
                          setSelectedPromptBlocks({ ...selectedPromptBlocks, [key]: e.target.value })
                        }
                        className="w-full p-2 bg-slate-900 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none"
                      >
                        <option value="">Choose {key} block...</option>
                        {(options as string[]).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEXT STEP ACTION FOOTER */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="text-xs font-bold text-blue-300 hover:text-white transition"
              >
                Exit Trial
              </button>

              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl transition shadow-lg flex items-center space-x-2 active:scale-95"
              >
                <span>{currentStep === practiceQuestions.length - 1 ? 'Finish Warmup' : 'Next Practice Question'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-blue-300 font-medium pt-2 border-t border-white/10 max-w-3xl mx-auto w-full">
        QuizArena Practice Mode • Learn • Master • Compete
      </div>
    </div>
  );
};
