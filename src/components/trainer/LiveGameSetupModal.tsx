'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Play,
  Sparkles,
  Search,
  Clock,
  Users,
  Star,
  Zap,
  Eye,
  BarChart2,
  Trophy,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  Lightbulb,
  Gamepad2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface LiveGameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizzes: IQuiz[];
  initialQuiz?: IQuiz | null;
  onLaunchLiveGame: (
    quizId: string,
    settings: {
      questionTime: number;
      maxParticipants: number;
      speedScoring: boolean;
      showCorrectAnswer: boolean;
      showLeaderboard: boolean;
      finalPodium: boolean;
    }
  ) => void;
}

export const LiveGameSetupModal: React.FC<LiveGameSetupModalProps> = ({
  isOpen,
  onClose,
  quizzes,
  initialQuiz,
  onLaunchLiveGame,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>(null);

  // Search & Filter state for Step 1
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Game Settings State
  const [questionTime, setQuestionTime] = useState<number>(20);
  const [maxParticipants, setMaxParticipants] = useState<number>(200);
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(100);
  const [speedScoring, setSpeedScoring] = useState<boolean>(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(true);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [finalPodium, setFinalPodium] = useState<boolean>(true);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      if (initialQuiz) {
        setSelectedQuizId(initialQuiz._id);
        setSelectedQuiz(initialQuiz);
      } else if (quizzes.length > 0) {
        setSelectedQuizId(quizzes[0]._id);
        setSelectedQuiz(quizzes[0]);
      }
    }
  }, [isOpen, initialQuiz, quizzes]);

  useEffect(() => {
    if (selectedQuizId && quizzes.length > 0) {
      const q = quizzes.find((item) => item._id === selectedQuizId);
      if (q) setSelectedQuiz(q);
    }
  }, [selectedQuizId, quizzes]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    (quizzes || []).forEach((q) => {
      if (q && q.category) set.add(q.category);
    });
    return Array.from(set);
  }, [quizzes]);

  // Filtered quizzes for selection
  const filteredQuizzes = useMemo(() => {
    return (quizzes || []).filter((q) => {
      if (!q) return false;
      const search = (searchQuery || '').toLowerCase();
      const matchesSearch =
        !search ||
        (q.title || '').toLowerCase().includes(search) ||
        (q.description || '').toLowerCase().includes(search);

      const matchesCategory = selectedCategory === 'ALL' || q.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [quizzes, searchQuery, selectedCategory]);

  // Calculate Question Time Limits & Duration dynamically from Question model
  const questionsList = selectedQuiz?.questions || [];
  const totalQuestions = selectedQuiz?.questionIds?.length || questionsList.length || 0;

  const totalQuizSeconds = useMemo(() => {
    if (questionsList && questionsList.length > 0) {
      return questionsList.reduce((acc, q) => acc + (q?.timeLimit || 20), 0);
    }
    return (totalQuestions || 0) * 20;
  }, [questionsList, totalQuestions]);

  const timePerQuestionLabel = useMemo(() => {
    if (questionsList && questionsList.length > 0) {
      const times = questionsList.map((q) => q?.timeLimit || 20);
      if (times.length === 0) return 'From Questions (Auto)';
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      if (isNaN(minTime) || isNaN(maxTime) || !isFinite(minTime) || !isFinite(maxTime)) {
        return 'From Questions (Auto)';
      }
      if (minTime === maxTime) {
        return `${minTime} seconds (Question Default)`;
      }
      return `${minTime}s - ${maxTime}s (Question Specific)`;
    }
    return 'From Questions (Auto)';
  }, [questionsList]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const estimatedDurationMinutes = Math.max(1, Math.ceil(totalQuizSeconds / 60));
  const totalPoints = totalQuestions * pointsPerQuestion;

  const handleLaunch = () => {
    if (!selectedQuiz) {
      showToast('Please select a quiz to launch.', 'warning');
      return;
    }

    if (totalQuestions === 0) {
      showToast('Selected quiz has no questions. Please add questions before launching.', 'error');
      return;
    }

    // Default question time (20s) passed for fallback while backend uses each question's actual timeLimit
    const fallbackTime = questionsList.length > 0 ? (questionsList[0].timeLimit || 20) : 20;

    onLaunchLiveGame(selectedQuiz._id, {
      questionTime: fallbackTime,
      maxParticipants,
      speedScoring,
      showCorrectAnswer,
      showLeaderboard,
      finalPodium,
    });
    onClose();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedQuiz) {
      showToast('Please select a quiz first.', 'warning');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleLaunch();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-sans cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-6xl w-full rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 cursor-default"
      >
        
        {/* TOP BANNER HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden shrink-0">
          {/* Background Decorative Sparkles & Rays */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                    Start Live Game
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-medium text-blue-100/90 mt-0.5">
                  Turn your quiz into an exciting live game. Set your preferences and get ready!
                </p>
              </div>
            </div>

            {/* Right Banner Graphic Slogan & Close Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-serif italic text-blue-100">
                <Rocket className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Same Questions Real-time Fun!</span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition text-white backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* STEPPER PROGRESS NAVIGATION BAR */}
          <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Select Quiz', sub: 'Choose the quiz' },
              { num: 2, title: 'Game Settings', sub: 'Configure rules' },
              { num: 3, title: 'Participant Access', sub: 'Review join method' },
              { num: 4, title: 'Review & Start', sub: 'Launch the game' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => {
                    if (selectedQuiz || step.num === 1) setCurrentStep(step.num);
                  }}
                  className={`flex items-center space-x-3 p-2.5 rounded-2xl transition text-left ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xl ring-2 ring-white/50'
                      : isCompleted
                      ? 'bg-white/15 text-white hover:bg-white/20'
                      : 'bg-white/5 text-blue-100/70 hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-black leading-tight ${isActive ? 'text-slate-900' : 'text-white'}`}>
                      {step.title}
                    </p>
                    <p className={`text-[10px] font-medium truncate ${isActive ? 'text-slate-500' : 'text-blue-200/80'}`}>
                      {step.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY GRID: LEFT CONTROLS (65%) + RIGHT PREVIEW SIDEBAR (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto min-h-0">
          
          {/* LEFT MAIN CONTENT AREA (8 COLS) */}
          <div className="lg:col-span-8 p-6 space-y-6 overflow-y-auto border-r border-slate-200/80">
            
            {/* STEP 1: SELECT QUIZ ACTIVITY */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Select Quiz Activity</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Choose the quiz you want to conduct as a live game.
                      </p>
                    </div>
                  </div>

                  {/* Search & Category Filter Toolbar */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="ALL">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Quiz Card (Highlighted matching reference image) */}
                {selectedQuiz && (
                  <div className="p-5 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/50 border-2 border-amber-300/90 rounded-3xl space-y-4 shadow-sm relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 shadow-xs">
                          <Lightbulb className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 block">
                            {selectedQuiz.category || 'General'}
                          </span>
                          <h4 className="text-base font-black text-slate-900 leading-tight">
                            {selectedQuiz.title}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xl">
                            {selectedQuiz.description || 'Master prompt design principles including Role definition, Context setting, Task instructions, Constraints, and Output formatting.'}
                          </p>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                              {selectedQuiz.category || 'Prompt Engineering'}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                              General
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Stats & Selected Badge */}
                      <div className="flex flex-col items-end justify-between space-y-3 text-right shrink-0">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-xs font-black flex items-center space-x-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selected</span>
                        </span>

                        <div className="space-y-1 text-xs font-bold text-slate-700">
                          <div className="flex items-center space-x-1.5 justify-end">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span><strong className="text-slate-900">{totalQuestions}</strong> Questions</span>
                          </div>
                          <div className="flex items-center space-x-1.5 justify-end">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>~ <strong>{estimatedDurationMinutes}</strong> mins</span>
                          </div>
                          <div className="flex items-center space-x-1.5 justify-end text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span><strong className="text-slate-900">{totalPoints}</strong> Points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Quizzes Grid Selection */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Available Quizzes ({filteredQuizzes.length})
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {filteredQuizzes.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold p-4 text-center">
                        No quizzes match your filter query.
                      </p>
                    ) : (
                      filteredQuizzes.map((q) => {
                        const isSelected = selectedQuizId === q._id;
                        const qCount = q.questionIds?.length || q.questions?.length || 0;
                        return (
                          <div
                            key={q._id}
                            onClick={() => {
                              setSelectedQuizId(q._id);
                              setSelectedQuiz(q);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-black text-slate-900">{q.title}</h5>
                                <p className="text-[11px] font-medium text-slate-500 truncate max-w-md">
                                  {q.category || 'General'} • {qCount} Questions
                                </p>
                              </div>
                            </div>

                            <button className={`px-3 py-1 rounded-xl text-xs font-bold transition ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GAME SETTINGS */}
            {(currentStep === 2 || currentStep === 1) && (
              <div className="space-y-5 animate-in fade-in duration-300 pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Game Settings</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure how the live game will be conducted. Time limits are automatically fetched from each question.
                    </p>
                  </div>
                </div>

                {/* ROW 1: 2 DROPDOWN CONFIG CARDS (QUESTION TIME LIMIT REMOVED AS REQUESTED) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Maximum Participants */}
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 hover:border-blue-300 transition">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Maximum Participants</p>
                        <p className="text-[10px] text-slate-500 font-medium">Students who can join</p>
                      </div>
                    </div>
                    <select
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value={50}>50 Students</option>
                      <option value={100}>100 Students</option>
                      <option value={200}>200 Students (Max)</option>
                      <option value={500}>500 Students</option>
                      <option value={1000}>1000 Students</option>
                    </select>
                  </div>

                  {/* Card 2: Points per Question */}
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 hover:border-blue-300 transition">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Points per Question</p>
                        <p className="text-[10px] text-slate-500 font-medium">Points for correct answer</p>
                      </div>
                    </div>
                    <select
                      value={pointsPerQuestion}
                      onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value={100}>Use Quiz Default (100)</option>
                      <option value={50}>50 Points</option>
                      <option value={150}>150 Points</option>
                      <option value={200}>200 Points</option>
                      <option value={500}>500 Points</option>
                    </select>
                  </div>
                </div>

                {/* ROW 2: 4 INTERACTIVE TOGGLE SWITCH CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Toggle 1: Speed Scoring */}
                  <div
                    onClick={() => setSpeedScoring(!speedScoring)}
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50/40 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Speed Scoring</p>
                        <p className="text-[10px] text-slate-500 font-medium">Faster answers get more points</p>
                      </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${speedScoring ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${speedScoring ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Toggle 2: Show Correct Answer */}
                  <div
                    onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50/40 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl shrink-0">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Show Correct Answer</p>
                        <p className="text-[10px] text-slate-500 font-medium">Reveal answer after timer ends</p>
                      </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${showCorrectAnswer ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showCorrectAnswer ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Toggle 3: Show Leaderboard */}
                  <div
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50/40 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl shrink-0">
                        <BarChart2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Show Leaderboard</p>
                        <p className="text-[10px] text-slate-500 font-medium">Display leaderboard between questions</p>
                      </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${showLeaderboard ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showLeaderboard ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Toggle 4: Final Podium */}
                  <div
                    onClick={() => setFinalPodium(!finalPodium)}
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50/40 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Final Podium</p>
                        <p className="text-[10px] text-slate-500 font-medium">Show 1st/2nd/3rd place celebration</p>
                      </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${finalPodium ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${finalPodium ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 & 4 ADDITIONAL DETAILS */}
            {currentStep >= 3 && (
              <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-3xl space-y-3 animate-in fade-in">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>Participant Access & Rules Verified</span>
                </h4>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  Students can join instantly using the 6-digit session PIN or by scanning the QR code on mobile. No registration or app download is required.
                </p>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: QUIZ PREVIEW CARD (4 COLS) */}
          <div className="lg:col-span-4 p-6 bg-slate-50/80 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm font-black text-slate-900">Quiz Preview</h4>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>READY</span>
                </span>
              </div>

              {/* Selected Quiz Card Header */}
              {selectedQuiz ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-slate-900 leading-snug">
                        {selectedQuiz.title}
                      </h5>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-md mt-1 inline-block">
                        {selectedQuiz.category || 'Prompt Engineering'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-snug line-clamp-3">
                    {selectedQuiz.description || 'Master prompt design principles including Role definition, Context setting, Task instructions, Constraints, and Output formatting.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                  Select a quiz to view preview specifications.
                </div>
              )}

              {/* Detailed Metrics List matching design */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 text-xs font-bold">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center space-x-2 text-slate-500">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Total Questions</span>
                  </span>
                  <span className="text-slate-900 font-black text-sm">{totalQuestions}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center space-x-2 text-slate-500">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Time per Question</span>
                  </span>
                  <span className="text-slate-900 font-black text-[11px]">{timePerQuestionLabel}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center space-x-2 text-slate-500">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Total Duration</span>
                  </span>
                  <span className="text-slate-900 font-black">~ {estimatedDurationMinutes} mins</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center space-x-2 text-slate-500">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span>Total Points</span>
                  </span>
                  <span className="text-slate-900 font-black text-sm">{totalPoints}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-100">
                  <span className="flex items-center space-x-2 text-slate-500">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Category</span>
                  </span>
                  <span className="text-slate-900 font-black">{selectedQuiz?.category || 'General'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Trophy Artwork & Slogan */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-5 rounded-3xl border border-amber-200/80 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-amber-400/30">
                <Trophy className="w-7 h-7" />
              </div>
              <p className="text-xs font-black text-amber-950 font-serif italic tracking-wide">
                Engage • Compete • Learn • Grow
              </p>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-2xs"
          >
            ✕ Cancel
          </button>

          <p className="text-[11px] text-slate-500 font-semibold text-center flex items-center space-x-1">
            <span>💡 Question time limits are dynamically read from each question.</span>
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition flex items-center space-x-1 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={!selectedQuiz || totalQuestions === 0}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl transition shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {currentStep === 4 ? 'Start Live Game' : currentStep === 1 ? 'Next: Game Settings →' : currentStep === 2 ? 'Next: Participant Access →' : 'Next: Launch →'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


