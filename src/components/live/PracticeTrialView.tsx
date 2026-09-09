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
  FileText,
  ListChecks,
} from 'lucide-react';

interface PracticeTrialViewProps {
  onClose: () => void;
}

export const PracticeTrialView: React.FC<PracticeTrialViewProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Practice state per question type
  const [selectedSingleChoice, setSelectedSingleChoice] = useState<number | null>(null);
  const [selectedMultiChoices, setSelectedMultiChoices] = useState<number[]>([]);
  const [selectedScenarioChoice, setSelectedScenarioChoice] = useState<number | null>(null);
  const [dragAssignments, setDragAssignments] = useState<Record<string, string>>({});
  const [sequenceSteps, setSequenceSteps] = useState<string[]>([
    'Define Role & System Persona',
    'Provide Context & Background Data',
    'Specify Clear Instructions & Task',
    'Set Output Constraints & JSON Schema',
  ]);

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const practiceQuestions = [
    {
      type: 'SINGLE_CHOICE',
      title: 'Practice 1: Single Choice Question',
      badge: 'Single Choice (MCQ)',
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
      type: 'MULTIPLE_SELECTION',
      title: 'Practice 2: Multiple Selection Question',
      badge: 'Check All That Apply',
      description: 'Select ALL correct answers that apply before moving forward.',
      questionText: 'Which of the following are essential components of effective prompt engineering? (Select all correct)',
      options: [
        'Defining a clear Role & Persona',
        'Providing Context & Input Examples',
        'Setting Output Constraints & Formatting',
        'Inserting random unformatted text',
      ],
      correctIndices: [0, 1, 2],
      explanation: 'Role, Context, and Output Constraints are all core pillars of structured prompt engineering!',
    },
    {
      type: 'SCENARIO_BASED',
      title: 'Practice 3: Scenario-Based Question',
      badge: 'Case Study & Scenario',
      description: 'Read the scenario case study and select the optimal decision response.',
      scenarioContext:
        'Scenario: You are designing an AI customer support agent for a major e-commerce enterprise. Users frequently inquire about order tracking, item exchanges, and high-value refund requests exceeding $50.',
      questionText:
        'Which prompt strategy best ensures compliance and security when handling high-value refund requests?',
      options: [
        'Enforce strict policy rules and automatically escalate refunds > $50 to human supervisors.',
        'Allow the AI agent to grant unlimited refunds to satisfy every customer.',
        'Ignore customer messages containing refund keywords.',
        'Ask customers to reveal their credit card PINs for verification.',
      ],
      correctIndex: 0,
      explanation:
        'Scenario-based questions test real-world application. Requiring human escalation for high-value refunds balances safety with automation.',
    },
    {
      type: 'DRAG_DROP',
      title: 'Practice 4: Drag & Drop Categorization',
      badge: 'Category Matching',
      description: 'Click or drag each scenario card into its correct AI Category.',
      cards: [
        { id: 'c1', text: 'Translating English documentation to Spanish' },
        { id: 'c2', text: 'Detecting physical defects in factory line items' },
      ],
      categories: [
        { id: 'nlp', name: 'Natural Language Processing (NLP)' },
        { id: 'cv', name: 'Computer Vision (CV)' },
      ],
      correctAssignments: { c1: 'nlp', c2: 'cv' },
    },
    {
      type: 'SEQUENCE',
      title: 'Practice 5: Sequence & Step Ordering',
      badge: 'Sequence Reordering',
      description: 'Use the Up / Down arrows to arrange the steps in logical execution order.',
      correctSequence: [
        'Define Role & System Persona',
        'Provide Context & Background Data',
        'Specify Clear Instructions & Task',
        'Set Output Constraints & JSON Schema',
      ],
    },
  ];

  const toggleMultiChoice = (index: number) => {
    if (selectedMultiChoices.includes(index)) {
      setSelectedMultiChoices(selectedMultiChoices.filter((i) => i !== index));
    } else {
      setSelectedMultiChoices([...selectedMultiChoices, index]);
    }
  };

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
    setSelectedSingleChoice(null);
    setSelectedMultiChoices([]);
    setSelectedScenarioChoice(null);
    setDragAssignments({});
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
              Explore All Question Types Before Game Starts
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
                You have practiced all 5 question types (Single Choice, Multiple Selection, Scenario-Based, Drag & Drop, and Sequence Reordering). When the trainer starts the live quiz, you will be fully prepared!
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

            {/* Question Header & Description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentQ.title}
              </h3>
              <p className="text-xs text-blue-200 font-medium">{currentQ.description}</p>
            </div>

            {/* 1. SINGLE CHOICE (MCQ) */}
            {currentQ.type === 'SINGLE_CHOICE' && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-white bg-white/5 p-4 rounded-2xl border border-white/10">
                  {currentQ.questionText}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = selectedSingleChoice === optIdx;
                    const isCorrect = optIdx === currentQ.correctIndex;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedSingleChoice(optIdx)}
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
                {selectedSingleChoice !== null && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-xs font-semibold text-emerald-200">
                    💡 {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

            {/* 2. MULTIPLE SELECTION (CHECK ALL THAT APPLY) */}
            {currentQ.type === 'MULTIPLE_SELECTION' && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-white bg-white/5 p-4 rounded-2xl border border-white/10">
                  {currentQ.questionText}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = selectedMultiChoices.includes(optIdx);
                    const isCorrect = currentQ.correctIndices?.includes(optIdx);
                    return (
                      <button
                        key={optIdx}
                        onClick={() => toggleMultiChoice(optIdx)}
                        className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-bold border transition flex items-center justify-between ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 font-extrabold ring-2 ring-emerald-400/40'
                              : 'bg-rose-500/25 border-rose-400 text-rose-100'
                            : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-amber-400 border-amber-300 text-slate-950' : 'border-white/30 bg-white/5'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </div>
                          <span>{opt}</span>
                        </div>
                        <span className="text-[11px] text-blue-200 opacity-70">
                          Option {String.fromCharCode(65 + optIdx)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedMultiChoices.length > 0 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-2xl text-xs font-semibold text-blue-200">
                    💡 {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

            {/* 3. SCENARIO-BASED QUESTION */}
            {currentQ.type === 'SCENARIO_BASED' && (
              <div className="space-y-4 pt-2">
                {/* Scenario Case Study Box */}
                <div className="p-4 bg-indigo-900/60 border border-indigo-400/40 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                    READ CASE STUDY SCENARIO
                  </span>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    {currentQ.scenarioContext}
                  </p>
                </div>

                <p className="text-sm font-bold text-white bg-white/5 p-4 rounded-2xl border border-white/10">
                  {currentQ.questionText}
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options?.map((opt, optIdx) => {
                    const isSelected = selectedScenarioChoice === optIdx;
                    const isCorrect = optIdx === currentQ.correctIndex;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedScenarioChoice(optIdx)}
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
                            {isCorrect ? '✓ Optimal Strategy' : '✕ Re-evaluate'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedScenarioChoice !== null && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-xs font-semibold text-emerald-200">
                    💡 {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

            {/* 4. DRAG & DROP STEP */}
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

            {/* 5. SEQUENCE REORDERING STEP */}
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
