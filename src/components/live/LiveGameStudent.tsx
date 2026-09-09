'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Volume2,
  VolumeX,
  Users,
  Lightbulb,
  Trophy,
  BookOpen,
  Hourglass,
  ArrowRight,
  BarChart2,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { Top5Leaderboard } from './Top5Leaderboard';
import { LivePodiumFinale } from './LivePodiumFinale';
import { QuestionRenderer } from '../common/QuestionRenderer';
import { PracticeTrialView } from './PracticeTrialView';
import { soundManager } from '@/lib/game/soundManager';

interface LiveGameStudentProps {
  quizCode: string;
  displayName: string;
  participantId?: string;
  onExit?: () => void;
}

export const LiveGameStudent: React.FC<LiveGameStudentProps> = ({
  quizCode,
  displayName,
  participantId = '',
  onExit,
}) => {
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>({
    totalParticipants: 0,
    answeredCount: 0,
    correctCount: 0,
    wrongCount: 0,
  });
  const [timeLeft, setTimeLeft] = useState<number>(16);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptionIndicesState, setSelectedOptionIndicesState] = useState<number[]>([]);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  useEffect(() => {
    soundManager.setMuted(true);
    if (typeof window !== 'undefined' && quizCode && participantId) {
      try {
        localStorage.setItem(`quiz_session_${quizCode}`, JSON.stringify({ quizCode, participantId, displayName }));
      } catch (e) {}
    }
  }, [quizCode, participantId, displayName]);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [hasTriedOnce, setHasTriedOnce] = useState<boolean>(false);

  const { showToast } = useToast();

  const syncState = async () => {
    try {
      let syncUrl = `/api/v1/live-sessions/sync?code=${quizCode}&role=student&displayName=${encodeURIComponent(displayName)}`;
      if (participantId) {
        syncUrl += `&participantId=${encodeURIComponent(participantId)}`;
      }
      const res = await fetch(syncUrl);
      const json = await res.json();

      if (json.success && json.data) {
        const sess = json.data.session;
        setSession(sess);
        setCurrentQuestion(json.data.currentQuestion);
        setStudentAnswer(json.data.studentAnswer);
        setRankings(json.data.rankings || []);
        if (json.data.liveStats) setLiveStats(json.data.liveStats);

        const qStart = sess.questionStartTimestamp;
        const qTime = sess.questionTime || 20;
        const sTime = json.data.serverTime || Date.now();

        if (qStart && sess.stage === 'QUESTION_ACTIVE') {
          const elapsed = Math.floor((sTime - qStart) / 1000);
          const remaining = Math.max(0, qTime - elapsed);
          setTimeLeft(remaining);

          soundManager.updateQuizState({
            stage: sess.stage,
            timeLeft: remaining,
            questionTimeLimit: qTime,
            isAnswerSubmitted: Boolean(json.data.studentAnswer),
          });

          if (remaining <= 0 && !json.data.studentAnswer && !hasTimedOut && !submitting) {
            setHasTimedOut(true);
            handleOptionSelect(-1, true);
          }
        } else {
          soundManager.updateQuizState({
            stage: sess.stage,
            timeLeft: qTime,
            questionTimeLimit: qTime,
            isAnswerSubmitted: Boolean(json.data.studentAnswer),
          });
        }
      }
    } catch (err) {
      console.error('Error syncing student session:', err);
    }
  };

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 500);

    // SSE Real-Time Event Stream Connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/v1/live-sessions/stream?code=${quizCode}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'STAGE_CHANGED' ||
            data.type === 'GAME_STARTED' ||
            data.type === 'GAME_CLOSED'
          ) {
            syncState();
            if (data.type === 'GAME_STARTED') {
              soundManager.playStartBeep(true);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [quizCode, displayName, participantId, hasTimedOut, submitting]);

  // Reset state when question index changes
  useEffect(() => {
    if (session?.currentQuestionIndex !== undefined) {
      setSelectedOption(null);
      setSelectedOptionIndicesState([]);
      setHasTimedOut(false);
      setStartTimeMs(Date.now());
    }
  }, [session?.currentQuestionIndex]);

  // Play audio when result is revealed
  useEffect(() => {
    if (session?.stage === 'SHOWING_RESULT' && studentAnswer) {
      if (studentAnswer.isCorrect) {
        soundManager.playCorrectSound();
      } else if (studentAnswer.isTimeout) {
        soundManager.playTimeoutSound();
      } else {
        soundManager.playWrongSound();
      }
    }
  }, [session?.stage, studentAnswer]);

  const handleOptionSelect = async (index: number, isTimeout: boolean = false) => {
    if (submitting || studentAnswer) return;

    setSelectedOption(index);
    setSubmitting(true);

    const responseTimeMs = Date.now() - startTimeMs;

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          participantId,
          displayName,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: index,
          responseTimeMs,
          isTimeout,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStudentAnswer(json.data);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMultiSelectSubmit = async (indices: number[]) => {
    if (submitting || studentAnswer) return;

    setSelectedOptionIndicesState(indices);
    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          participantId,
          displayName,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: -1,
          selectedOptionIndices: indices,
          responseTimeMs,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStudentAnswer(json.data);
      }
    } catch (err) {
      console.error('Error submitting multi-select answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryAssignmentsSelect = async (assignments: Record<string, string>) => {
    if (submitting || studentAnswer) return;

    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          participantId,
          displayName,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: -1,
          selectedCategoryAssignments: assignments,
          responseTimeMs,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStudentAnswer(json.data);
      }
    } catch (err) {
      console.error('Error submitting category assignments:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSequenceSelect = async (sequence: number[]) => {
    if (submitting || studentAnswer) return;

    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          participantId,
          displayName,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: -1,
          selectedSequence: sequence,
          responseTimeMs,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStudentAnswer(json.data);
      }
    } catch (err) {
      console.error('Error submitting sequence answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubAnswersComplete = async (subAnswers: Record<number, any>) => {
    if (submitting || studentAnswer) return;

    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          participantId,
          displayName,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: -1,
          selectedSubAnswers: subAnswers,
          responseTimeMs,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStudentAnswer(json.data);
      }
    } catch (err) {
      console.error('Error submitting scenario answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const totalQuestions = session?.totalQuestions || 5;
  const currentIdx = (session?.currentQuestionIndex || 0) + 1;
  const stage = session?.stage || 'LOBBY';

  // ==========================================
  // SCREEN 2: WAITING LOBBY
  // ==========================================
  if (!session || stage === 'LOBBY') {
    if (isTrialActive) {
      return (
        <PracticeTrialView
          onClose={() => {
            setIsTrialActive(false);
            setHasTriedOnce(true);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-blue-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans overflow-hidden animate-in fade-in duration-300">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center space-x-3">
            <img src="/QuizArena Icon.png" alt="QuizArena" className="w-8 h-8 object-contain" />
            <div>
              <span className="font-black text-lg text-white">QuizArena</span>
              <p className="text-[9px] font-bold text-blue-300 tracking-wide uppercase">Live Game Session</p>
            </div>
          </div>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-300" />}
          </button>
        </div>

        {/* Center Content Stage */}
        <div className="my-auto max-w-md mx-auto w-full space-y-5 text-center py-4">
          {/* Hourglass Icon Circle */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-amber-400/80 flex items-center justify-center shadow-xl text-amber-300">
              <Hourglass className="w-8 h-8 animate-spin duration-3000" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome <span className="text-amber-400">{displayName}!</span>
            </h1>
            <p className="text-xs text-blue-200 font-medium px-4">
              You&apos;re in! Waiting for the trainer to start the quiz.
            </p>
          </div>

          {/* Stats Pills Row */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-extrabold text-blue-100">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{session?.participantsCount || 0} Participants</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-extrabold text-amber-200">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="truncate max-w-[160px]">{session?.quizTitle || 'Activity 4: Prompt Engineering'}</span>
            </div>
          </div>

          {/* PRACTICE TRIAL WARMUP BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => setIsTrialActive(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-xl flex items-center justify-center space-x-2 border border-amber-300 active:scale-95 animate-in zoom-in-95 duration-300"
            >
              <Zap className="w-4.5 h-4.5 fill-slate-950" />
              <span>{hasTriedOnce ? 'Take Practice Trial Again' : 'Try Practice Questions (Warmup)'}</span>
            </button>
            <p className="text-[10px] text-blue-300 font-medium mt-1.5">
              Practice MCQ, True/False, Drag & Drop & Prompt Builder while waiting!
            </p>
          </div>

          {/* Lightbulb Quote Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-3xl text-xs font-semibold text-blue-100 flex items-center space-x-3 text-left">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p className="font-serif italic text-xs sm:text-sm">
              &quot;Good Questions Lead to Great Minds!&quot;
            </p>
          </div>
        </div>

        {/* Bottom Slogan Footer */}
        <div className="text-center text-xs text-blue-300 font-medium pt-2 border-t border-white/10">
          Play • Learn • Compete • Grow
        </div>
      </div>
    );
  }

  // 2. Synchronized 3-2-1 Countdown View
  if (stage === 'STARTING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex flex-col items-center justify-center p-6 text-slate-950 font-sans text-center">
        <div className="space-y-4 animate-in zoom-in duration-300">
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-slate-950 text-amber-400">
            GET READY!
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
            3 ... 2 ... 1 ...
          </h1>
          <p className="text-xl sm:text-2xl font-extrabold opacity-90">GO!</p>
        </div>
      </div>
    );
  }

  // 3. Paused Overlay View
  if (stage === 'PAUSED') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-amber-500 text-slate-950 p-8 rounded-3xl shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">GAME PAUSED</h1>
          <p className="text-xs font-bold opacity-90">Please wait for the Trainer to resume the live session...</p>
        </div>
      </div>
    );
  }

  // 4. Leaderboard View Between Questions
  if (stage === 'LEADERBOARD') {
    if (session?.scoreboardVisibility === 'TRAINER_ONLY') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans text-center animate-in zoom-in duration-300">
          <div className="my-auto max-w-md mx-auto w-full space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 border border-indigo-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">Scoreboard Active</h1>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold max-w-xs mx-auto leading-relaxed">
                The live scoreboard is currently displayed on the Trainer's screen. Get ready for the next question!
              </p>
            </div>
            <div className="flex justify-center space-x-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse delay-150" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse delay-300" />
            </div>
          </div>
          <div className="text-center text-xs text-indigo-400 font-medium">
            QuizArena Live Session
          </div>
        </div>
      );
    }

    return (
      <Top5Leaderboard
        rankings={rankings}
        currentQuestionIndex={session.currentQuestionIndex || 0}
        totalQuestions={session.totalQuestions || 1}
        userDisplayName={displayName}
        userParticipantId={participantId}
        sessionType="LIVE_GAME"
        isPaused={session?.stage === 'PAUSED'}
        timerDurationSec={8}
      />
    );
  }

  // 5. Final Podium View
  if (stage === 'FINAL_PODIUM' || stage === 'FINAL_SCOREBOARD' || stage === 'CLOSED') {
    return (
      <LivePodiumFinale
        quizTitle={session.quizTitle}
        rankings={rankings}
        userDisplayName={displayName}
        userParticipantId={participantId}
        onBackToDashboard={onExit || (() => (window.location.href = '/'))}
      />
    );
  }

  // ==========================================
  // SCREEN 4: ANSWER LOCKED / SUBMITTED (Stage: QUESTION_ACTIVE & Answer submitted)
  // ==========================================
  const isAnswered = !!studentAnswer || selectedOption !== null || selectedOptionIndicesState.length > 0;

  if (isAnswered && stage !== 'SHOWING_RESULT') {
    const chosenIndex = studentAnswer?.selectedOptionIndex ?? selectedOption ?? 0;
    const rawChosen = currentQuestion?.options?.[chosenIndex] || 'Submitted Response';
    const chosenText = rawChosen.split('||')[0];
    const respTimeSec = ((studentAnswer?.responseTimeMs || Date.now() - startTimeMs) / 1000).toFixed(1);

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-green-950 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
            Q {currentIdx} OF {totalQuestions}
          </span>
          <button onClick={handleToggleMute} className="p-2 rounded-xl bg-white/10 text-white">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>
        </div>

        {/* Center Card */}
        <div className="my-auto max-w-md mx-auto w-full space-y-6 text-center py-4">
          
          {/* Glowing Checkmark with Confetti Sparkles */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/40 border-2 border-emerald-300 text-white">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Answer Submitted!
            </h1>
            <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
              Response recorded
            </p>
          </div>

          {/* Selected Choice Badge Card */}
          <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-left">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0">
              ✓
            </span>
            <span className="text-base font-extrabold flex-1 text-slate-900 leading-snug">
              {chosenText}
            </span>
          </div>

          {/* Speed Card */}
          <div className="bg-emerald-900/60 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 text-emerald-200 font-bold">
              <div className="p-2 rounded-xl bg-emerald-400 text-slate-950">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-80">Response Time</p>
                <p className="text-sm font-black text-white font-mono">{respTimeSec} seconds</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-wider">
              Fast!
            </span>
          </div>

          {/* Loading Dots */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-emerald-200">
              Waiting for other players to finish...
            </p>
            <div className="flex justify-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse delay-300" />
            </div>
          </div>

          {/* Trophy Quote */}
          <div className="bg-white/10 border border-white/15 p-3.5 rounded-2xl text-xs font-bold text-emerald-100 flex items-center justify-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-serif italic">'Every question makes you stronger!'</span>
          </div>
        </div>

        <div className="text-center text-xs text-emerald-400 font-medium">
          QuizArena Live Game
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 5: RESULT SCREEN (Stage: SHOWING_RESULT)
  // ==========================================
  if (stage === 'SHOWING_RESULT') {
    const isCorrect = studentAnswer?.isCorrect ?? false;
    const pointsEarned = studentAnswer?.pointsEarned ?? 0;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full font-sans text-slate-900 animate-in zoom-in duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-700">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Question {currentIdx} Result</span>
          </div>

          <button onClick={handleToggleMute} className="p-2 rounded-xl bg-slate-100 text-slate-600">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Top Result Banner */}
        <div
          className={`p-6 rounded-3xl border shadow-lg text-center space-y-2 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-white shadow-md ${
              isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl font-black">
            {pointsEarned > 0 ? (isCorrect ? 'Correct!' : 'Partial Marks!') : 'Incorrect'}
          </h2>

          <p className="text-sm font-extrabold text-emerald-700">
            {pointsEarned > 0 ? `+${pointsEarned} Points` : '+0 Points'}
          </p>
        </div>

        {/* Explanation Card (only rendered if question has an explanation) */}
        {currentQuestion?.explanation && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-xs font-black text-amber-600">
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Explanation</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Dynamic Answer Breakdown Card for MCQ & Standard Questions */}
        {currentQuestion?.options && currentQuestion.options.length > 0 && currentQuestion?.questionType !== 'DRAG_AND_DROP' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Answer Breakdown</h3>

            <div className="space-y-2.5 text-xs font-bold">
              {currentQuestion.options.map((optText: string, idx: number) => {
                const letter = String.fromCharCode(65 + idx);
                const correctIndices: number[] = Array.isArray(currentQuestion?.correctOptionIndices) && currentQuestion.correctOptionIndices.length > 0
                  ? currentQuestion.correctOptionIndices
                  : (currentQuestion?.correctOptionIndex !== undefined ? [currentQuestion.correctOptionIndex] : []);
                const isCorrectOpt = correctIndices.includes(idx);

                const studentSelectedList: number[] = Array.isArray(studentAnswer?.selectedOptionIndices)
                  ? studentAnswer.selectedOptionIndices
                  : (studentAnswer?.selectedOptionIndex !== undefined && studentAnswer.selectedOptionIndex >= 0 ? [studentAnswer.selectedOptionIndex] : []);
                const isStudentChoice = studentSelectedList.includes(idx);
                const cleanOptText = optText.split('||')[0];

                let cardStyle = "bg-slate-50 border-slate-200 text-slate-700";
                let badgeStyle = "bg-slate-200 text-slate-700";

                if (isCorrectOpt) {
                  cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-950 font-black shadow-xs";
                  badgeStyle = "bg-emerald-600 text-white";
                } else if (isStudentChoice) {
                  cardStyle = "bg-rose-50 border-rose-300 text-rose-950 font-extrabold";
                  badgeStyle = "bg-rose-600 text-white";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${cardStyle}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className="text-xs font-extrabold truncate">{cleanOptText}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {isStudentChoice && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[9px] font-black uppercase tracking-wider">
                          YOUR ANSWER
                        </span>
                      )}
                      {isCorrectOpt && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CORRECT</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category-Grouped Answer Key for DRAG_AND_DROP Questions */}
        {currentQuestion?.questionType === 'DRAG_AND_DROP' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <QuestionRenderer
              question={currentQuestion}
              mode="player"
              isAnswerSubmitted={true}
              showCorrectAnswer={true}
            />
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // SCREEN 3: ACTIVE QUESTION SCREEN (Stage: QUESTION_ACTIVE & Answer NOT submitted)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full font-sans text-slate-900 space-y-4">
      
      {/* Mobile Top Header: Question count, 16s Timer ring, Audio button (Sticky on Scroll) */}
      <div className="sticky top-2 z-40 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between transition-all">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          Q {currentIdx} of {totalQuestions}
        </span>

        {/* Center Circular 16s Timer Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="currentColor"
              strokeWidth="5"
              className="text-amber-100"
              fill="transparent"
            />
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="currentColor"
              strokeWidth="5"
              className={`${
                timeLeft <= 5 ? 'text-rose-500' : 'text-amber-500'
              } transition-all duration-1000 ease-linear`}
              fill="transparent"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - Math.max(0, timeLeft / 20))}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-black font-mono text-slate-900">
            {timeLeft}s
          </span>
        </div>

        <button
          onClick={handleToggleMute}
          className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Dynamic Question Renderer for all Question Types */}
      <QuestionRenderer
        question={currentQuestion}
        mode="player"
        questionIndex={session?.currentQuestionIndex || 0}
        totalQuestions={totalQuestions}
        selectedOptionIndex={selectedOption}
        selectedOptionIndices={selectedOptionIndicesState}
        onSelectOption={(idx) => handleOptionSelect(idx)}
        onSelectMultipleOptions={(indices) => handleMultiSelectSubmit(indices)}
        onSelectSequence={(seq) => handleSequenceSelect(seq)}
        onSelectCategoryAssignments={(assignments) => handleCategoryAssignmentsSelect(assignments)}
        onSubAnswersComplete={(subAns) => handleSubAnswersComplete(subAns)}
        disabled={submitting || timeLeft <= 0 || Boolean(studentAnswer)}
        isAnswerSubmitted={Boolean(studentAnswer)}
      />

      {/* Bottom Footer Slogan */}
      <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-2">
        QuizArena Live Game
      </div>
    </div>
  );
};
