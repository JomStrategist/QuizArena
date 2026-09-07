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
  RotateCcw,
  Check,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { soundManager } from '@/lib/game/soundManager';
import { QuestionRenderer } from '../common/QuestionRenderer';
import { LivePodiumFinale } from './LivePodiumFinale';

interface ConductQuizStudentProps {
  quizCode: string;
  displayName: string;
  participantId?: string;
  studentEmail?: string;
  onExit?: () => void;
}

export const ConductQuizStudent: React.FC<ConductQuizStudentProps> = ({
  quizCode: initialCode,
  displayName: initialName,
  participantId = '',
  studentEmail = '',
  onExit,
}) => {
  const [quizCode, setQuizCode] = useState<string>(initialCode || '');
  const [displayName, setDisplayName] = useState<string>(initialName || '');
  const [isJoined, setIsJoined] = useState<boolean>(Boolean(initialCode && initialName));
  const [joinLoading, setJoinLoading] = useState<boolean>(false);

  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  const { showToast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCode || quizCode.length !== 6) {
      showToast('Please enter a valid 6-digit Quiz Code.', 'warning');
      return;
    }
    if (!displayName.trim()) {
      showToast('Please enter your Display Name.', 'warning');
      return;
    }

    setJoinLoading(true);
    try {
      const res = await fetch('/api/v1/live-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode: quizCode.trim(),
          displayName: displayName.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to join session.');
      }

      showToast(`Successfully joined session! Welcome, ${displayName}`, 'success');
      setIsJoined(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to join session.', 'error');
    } finally {
      setJoinLoading(false);
    }
  };

  const syncState = async () => {
    if (!quizCode || !displayName || !isJoined) return;

    try {
      let syncUrl = `/api/v1/live-sessions/sync?code=${quizCode}&role=student&displayName=${encodeURIComponent(
        displayName
      )}`;
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

        const qStart = sess.questionStartTimestamp;
        const qTime = sess.questionTime || 30;
        const sTime = json.data.serverTime || Date.now();

        if (qStart && sess.stage === 'QUESTION_ACTIVE') {
          const elapsed = Math.floor((sTime - qStart) / 1000);
          const remaining = Math.max(0, qTime - elapsed);
          setTimeLeft(remaining);

          if (remaining <= 0 && !json.data.studentAnswer && !hasTimedOut && !submitting) {
            setHasTimedOut(true);
            handleOptionSelect(-1, true);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing student conduct state:', err);
    }
  };

  useEffect(() => {
    if (isJoined) {
      syncState();
      const interval = setInterval(syncState, 1000);

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
            }
          } catch (e) {}
        };
      } catch (e) {}

      return () => {
        clearInterval(interval);
        if (eventSource) eventSource.close();
      };
    }
  }, [quizCode, displayName, isJoined, participantId]);

  useEffect(() => {
    if (session?.currentQuestionIndex !== undefined) {
      setSelectedOption(null);
      setHasTimedOut(false);
      setStartTimeMs(Date.now());
    }
  }, [session?.currentQuestionIndex]);

  const handleOptionSelect = async (optionIndex: number, isTimeout: boolean = false) => {
    if (submitting || studentAnswer) return;

    setSelectedOption(optionIndex);
    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          displayName,
          participantId,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: optionIndex,
          responseTimeMs,
          isTimeout,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStudentAnswer(json.data);
        if (json.data.isCorrect) {
          soundManager.playCorrectSound();
          showToast('Answer Submitted!', 'success');
        } else {
          soundManager.playWrongSound();
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubAnswersComplete = async (subAnswers: Record<number, any>, isTimeout: boolean = false) => {
    if (submitting || studentAnswer) return;

    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          displayName,
          participantId,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: -1,
          selectedSubAnswers: subAnswers,
          responseTimeMs,
          isTimeout,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStudentAnswer(json.data);
        if (json.data.isCorrect) {
          soundManager.playCorrectSound();
          showToast('Scenario Complete!', 'success');
        } else {
          soundManager.playWrongSound();
        }
      }
    } catch (err) {
      console.error('Error submitting scenario answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSequenceSelect = async (sequence: number[], isTimeout: boolean = false) => {
    if (submitting || studentAnswer) return;

    setSubmitting(true);
    const responseTimeMs = Math.max(100, Date.now() - startTimeMs);

    try {
      const res = await fetch('/api/v1/live-sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          displayName,
          participantId,
          questionIndex: session?.currentQuestionIndex || 0,
          selectedOptionIndex: -1,
          selectedSequence: sequence,
          responseTimeMs,
          isTimeout,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStudentAnswer(json.data);
        if (json.data.isCorrect) {
          soundManager.playCorrectSound();
          showToast('Answer Submitted!', 'success');
        } else {
          soundManager.playWrongSound();
        }
      }
    } catch (err) {
      console.error('Error submitting sequence answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. PLAYER JOIN SCREEN (If not joined yet)
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <img src="/QuizArena Logo.png" alt="QuizArena" className="h-12 mx-auto object-contain" />
            <h1 className="text-2xl font-black text-slate-900">Join Conduct Quiz</h1>
            <p className="text-xs text-slate-500 font-semibold">Enter your display name and 6-digit session code</p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No Account Required (Name + Code)</span>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
                Your Display Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ajay"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
                6-Digit Quiz Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="148584"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black font-mono tracking-widest text-blue-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={joinLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {joinLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Join Quiz Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading state while syncing session
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-slate-500 font-bold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Connecting to Conduct Quiz Session...</span>
        </div>
      </div>
    );
  }

  // 2. WAITING ROOM (LOBBY)
  if (session.stage === 'LOBBY') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 space-y-6">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>CONDUCT QUIZ • WAITING ROOM</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">WELCOME,</p>
            <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Session Title
            </span>
            <h2 className="text-lg font-black text-slate-900">{session.quizTitle}</h2>
            <p className="text-xs font-semibold text-slate-500">Prepared by: {session.trainerName}</p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center space-x-2 text-xs font-extrabold text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Successfully joined session! Waiting for trainer to start...</span>
          </div>

          <div className="flex justify-center pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Session starts automatically without manual refresh</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. FINAL RESULTS SCREEN
  if (session.stage === 'FINAL_PODIUM' || session.stage === 'FINAL_SCOREBOARD') {
    const myRankItem = rankings.find((r) => r.displayName === displayName);

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto font-sans text-slate-900 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
            QUIZ COMPLETE
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            {session.quizTitle}
          </h1>

          {myRankItem && (
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl space-y-3 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Your Final Result
              </p>
              <div className="flex justify-center items-baseline space-x-2">
                <span className="text-5xl font-black font-mono">{myRankItem.score}</span>
                <span className="text-sm font-bold text-blue-200">POINTS</span>
              </div>
              <div className="flex justify-center items-center space-x-6 text-xs font-extrabold text-blue-100 pt-2 border-t border-white/20">
                <span>Rank: #{myRankItem.rank}</span>
                <span>Correct: {myRankItem.correctAnswers || 0}</span>
                <span>Accuracy: {myRankItem.accuracy || 0}%</span>
              </div>
            </div>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition"
            >
              Exit Session
            </button>
          )}
        </div>

        {/* Podium / Final Leaderboard */}
        <LivePodiumFinale
          quizTitle={session.quizTitle}
          rankings={rankings}
          onBackToDashboard={onExit || (() => setIsJoined(false))}
        />
      </div>
    );
  }

  // 4. LIVE QUESTION & RESULT STAGE
  const currentIdx = (session.currentQuestionIndex || 0) + 1;
  const totalQuestions = session.totalQuestions || 5;

  const showCorrectAnswer = session.showCorrectAnswer !== false && (session.stage === 'SHOWING_RESULT' || Boolean(studentAnswer));
  const showScore = session.showScore !== false;
  const isQuestionActive = session.stage === 'QUESTION_ACTIVE' && !studentAnswer;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 max-w-4xl mx-auto w-full font-sans text-slate-900 space-y-6">
      
      {/* Player Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-8 h-8 object-contain" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
              CONDUCT QUIZ
            </span>
            <span className="text-xs font-black text-slate-900">
              QUESTION {currentIdx} OF {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Synchronized Timer */}
          <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center space-x-1.5 font-mono font-black text-slate-900">
            <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
            <span className={timeLeft <= 5 ? 'text-rose-600' : 'text-slate-900'}>{timeLeft}s</span>
          </div>

          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-100">
            {displayName}
          </span>
        </div>
      </div>

      {/* Answer Result Banner (If Showing Result) */}
      {studentAnswer && session.stage === 'SHOWING_RESULT' && (
        <div className={`p-5 rounded-3xl border shadow-sm space-y-1 ${
          studentAnswer.isCorrect
            ? 'bg-emerald-500 text-white border-emerald-600'
            : 'bg-rose-600 text-white border-rose-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black flex items-center space-x-2">
              {studentAnswer.isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>✓ CORRECT</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  <span>INCORRECT</span>
                </>
              )}
            </span>

            {showScore && studentAnswer.pointsEarned > 0 && (
              <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-black">
                +{studentAnswer.pointsEarned} POINTS
              </span>
            )}
          </div>
          <p className="text-xs font-bold opacity-90">
            Response Time: {(studentAnswer.responseTimeMs / 1000).toFixed(1)}s
          </p>
        </div>
      )}

      {/* Leaderboard Stage View */}
      {session.stage === 'LEADERBOARD' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>CURRENT LEADERBOARD STANDINGS</span>
            </h3>
          </div>

          <div className="space-y-2">
            {rankings.slice(0, 5).map((r, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  r.displayName === displayName
                    ? 'bg-blue-50 border-blue-300 text-blue-950 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                    {r.rank}
                  </span>
                  <span>{r.displayName}</span>
                </div>
                <span className="font-mono text-blue-600 font-black">{r.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unified Question Renderer */}
      <QuestionRenderer
        question={currentQuestion}
        mode="player"
        questionIndex={session?.currentQuestionIndex || 0}
        totalQuestions={session?.totalQuestions || 5}
        selectedOptionIndex={selectedOption !== null ? selectedOption : studentAnswer?.selectedOptionIndex}
        onSelectOption={(idx) => handleOptionSelect(idx, false)}
        onSelectSequence={(seq) => handleSequenceSelect(seq, false)}
        onSubAnswersComplete={(subAnswers) => handleSubAnswersComplete(subAnswers, false)}
        disabled={!isQuestionActive || submitting}
        showCorrectAnswer={showCorrectAnswer}
        correctOptionIndex={showCorrectAnswer ? currentQuestion?.correctOptionIndex : null}
        userAnswerIndex={studentAnswer?.selectedOptionIndex}
        isAnswerSubmitted={Boolean(studentAnswer)}
      />
    </div>
  );
};
