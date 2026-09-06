'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, Sparkles, AlertCircle, Award, Check } from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { ConductScoreboard } from './ConductScoreboard';
import { Top5Leaderboard } from './Top5Leaderboard';

interface ConductQuizStudentProps {
  quizCode: string;
  displayName: string;
  participantId?: string;
  studentEmail?: string;
  onExit?: () => void;
}

export const ConductQuizStudent: React.FC<ConductQuizStudentProps> = ({
  quizCode,
  displayName,
  participantId = '',
  studentEmail = '',
  onExit,
}) => {
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

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

        const qStart = sess.questionStartTimestamp;
        const qTime = sess.questionTime || 30;
        const sTime = json.data.serverTime || Date.now();

        if (qStart && sess.stage === 'QUESTION_ACTIVE') {
          const elapsed = Math.floor((sTime - qStart) / 1000);
          const remaining = Math.max(0, qTime - elapsed);
          setTimeLeft(remaining);

          // Handle automatic timeout if time runs out and no answer submitted yet
          if (remaining <= 0 && !json.data.studentAnswer && !hasTimedOut && !submitting) {
            setHasTimedOut(true);
            handleOptionSelect(-1, true);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing student session:', err);
    }
  };

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 1000);
    return () => clearInterval(interval);
  }, [quizCode, displayName, participantId]);

  // Reset selected option when question index changes
  useEffect(() => {
    if (session?.currentQuestionIndex !== undefined) {
      setSelectedOption(null);
      setHasTimedOut(false);
      setStartTimeMs(Date.now());
    }
  }, [session?.currentQuestionIndex]);

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

  const optionColors = [
    'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-blue-500/20',
    'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-indigo-500/20',
    'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/20',
    'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-500/20',
  ];
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Stage 1: Waiting Lobby
  if (!session || session.stage === 'LOBBY') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto border-4 border-blue-50 animate-bounce">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              {session?.sessionType === 'CONDUCT' ? 'CONDUCT QUIZ' : 'LIVE GAME'}
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {session?.quizTitle || 'Conduct Quiz Session'}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">Trainer: {session?.trainerName || 'Trainer'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
            <p className="font-bold text-slate-500 uppercase tracking-wider">Welcome,</p>
            <p className="text-lg font-black text-blue-600">{displayName}</p>
            <div className="pt-2 flex items-center justify-center space-x-1.5 text-emerald-600 font-bold">
              <Check className="w-4 h-4" />
              <span>Successfully joined session</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-blue-700 font-bold text-xs bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Waiting for trainer to start...</span>
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Showing Result / Top 5 Leaderboard after each question (if enabled)
  if (session.stage === 'SHOWING_RESULT' || (session.stage === 'LEADERBOARD' && session.showLeaderboard !== false)) {
    return (
      <Top5Leaderboard
        rankings={rankings}
        currentQuestionIndex={session.currentQuestionIndex || 0}
        totalQuestions={session.totalQuestions || 1}
        userDisplayName={displayName}
        userParticipantId={participantId}
        sessionType={session.sessionType}
      />
    );
  }

  // Stage 3: Final Scoreboard or Closed
  if (session.stage === 'FINAL_SCOREBOARD' || session.stage === 'FINAL_PODIUM' || session.stage === 'CLOSED') {
    return (
      <ConductScoreboard
        quizTitle={session.quizTitle}
        rankings={rankings}
        sessionType={session.sessionType}
        userDisplayName={displayName}
        onBackToDashboard={onExit || (() => (window.location.href = '/'))}
      />
    );
  }

  // Stage 4: Question Active
  const totalQuestions = session.totalQuestions || 1;
  const currentIdx = (session.currentQuestionIndex || 0) + 1;
  const isAnswered = !!studentAnswer;

  const isTimeUp = timeLeft <= 0 || session?.stage === 'SHOWING_RESULT';
  const showScore = session?.showScore !== false;
  const showQuestionResult = isAnswered && (isTimeUp || showScore);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-6 max-w-2xl mx-auto space-y-5 w-full font-sans">
      {/* Mobile-First Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              CONDUCT QUIZ
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {currentIdx} of {totalQuestions}
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-900 mt-0.5">{displayName}</h3>
        </div>

        {/* Synchronized Server-Authoritative Timer Display */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono font-black text-base ${
            timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Structured Question Prompt Card */}
      {currentQuestion && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-3 text-center">
          <h2 className="text-base md:text-lg font-black text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h2>
        </div>
      )}

      {/* Large Touch Option Cards OR Response Feedback Screen */}
      {!isAnswered ? (
        <div className="grid grid-cols-1 gap-3 flex-1">
          {currentQuestion?.options?.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(i)}
              disabled={submitting || timeLeft <= 0}
              className={`p-4 md:p-5 rounded-2xl border-b-4 font-black text-left text-sm md:text-base transition-transform active:scale-[0.98] flex items-center space-x-4 shadow-md disabled:opacity-50 ${
                optionColors[i % optionColors.length]
              }`}
            >
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-xs md:text-sm font-black flex-shrink-0">
                {optionLetters[i]}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
            </button>
          ))}
        </div>
      ) : showQuestionResult ? (
        /* Score & Correctness Reveal Card */
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl text-center space-y-4 animate-in zoom-in duration-200 ${
            studentAnswer.isCorrect
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400'
              : studentAnswer.isTimeout
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400'
              : 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white/30">
            {studentAnswer.isCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : studentAnswer.isTimeout ? (
              <AlertCircle className="w-8 h-8 text-white" />
            ) : (
              <XCircle className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              {studentAnswer.isCorrect ? '✓ CORRECT' : studentAnswer.isTimeout ? '⌛ TIME OUT' : '✕ INCORRECT'}
            </h2>
            <p className="text-sm font-extrabold opacity-90">
              {studentAnswer.isCorrect ? `+${studentAnswer.pointsEarned} POINTS` : '+0 POINTS'}
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 max-w-xs mx-auto text-xs space-y-1">
            <p className="font-bold opacity-90">Response Time: {((studentAnswer.responseTimeMs || 0) / 1000).toFixed(1)}s</p>
            <p className="opacity-80">Next question loads automatically when timer ends.</p>
          </div>
        </div>
      ) : (
        /* Answer Locked-In Confirmation Card */
        <div className="p-6 md:p-8 rounded-3xl border border-blue-400 shadow-xl text-center space-y-4 animate-in zoom-in duration-200 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white/30">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black">✓ ANSWER SUBMITTED</h2>
            <p className="text-xs font-semibold opacity-90">Your response has been securely locked in.</p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 max-w-xs mx-auto text-xs">
            <p className="font-bold opacity-90">Option {optionLetters[studentAnswer.selectedOptionIndex]} Selected</p>
            <p className="opacity-80 mt-1">Waiting for remaining trainees to finish...</p>
          </div>
        </div>
      )}
    </div>
  );
};
