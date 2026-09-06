'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { Top5Leaderboard } from './Top5Leaderboard';
import { LivePodiumFinale } from './LivePodiumFinale';
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
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

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
        const qTime = sess.questionTime || 20; // Question-specific time limit
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
      console.error('Error syncing student session:', err);
    }
  };

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 1000);

    // SSE Real-Time Event Stream Connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/v1/live-sessions/stream?code=${quizCode}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STAGE_CHANGED' || data.type === 'GAME_STARTED' || data.type === 'GAME_CLOSED') {
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
  }, [quizCode, displayName, participantId]);

  // Reset state when question index changes
  useEffect(() => {
    if (session?.currentQuestionIndex !== undefined) {
      setSelectedOption(null);
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

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const optionColors = [
    'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-rose-500/20 ring-rose-300',
    'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-blue-500/20 ring-blue-300',
    'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/20 ring-amber-300',
    'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-500/20 ring-emerald-300',
  ];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const myRankRecord = rankings.find(
    (p) => (participantId && p.participantId === participantId) || p.displayName === displayName
  );
  const myRank = myRankRecord?.rank || '-';
  const rankDelta = myRankRecord?.lastRankDelta || 0;

  // 1. Waiting Lobby View
  if (!session || session.stage === 'LOBBY') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleToggleMute}
              className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-bounce">
            <Zap className="w-8 h-8 fill-current" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
              QUIZARENA LIVE GAME
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {session?.quizTitle || 'Live Game Session'}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">Trainer: {session?.trainerName || 'KVJ Trainer'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">YOU'VE JOINED AS</p>
            <p className="text-lg font-black text-amber-600">{displayName}</p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-amber-800 font-bold text-xs bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Waiting for Trainer to start the game...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Synchronized 3-2-1 Countdown View
  if (session.stage === 'STARTING') {
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
  if (session.stage === 'PAUSED') {
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
  if (session.stage === 'LEADERBOARD') {
    return (
      <Top5Leaderboard
        rankings={rankings}
        currentQuestionIndex={session.currentQuestionIndex || 0}
        totalQuestions={session.totalQuestions || 1}
        userDisplayName={displayName}
        userParticipantId={participantId}
        sessionType="LIVE_GAME"
      />
    );
  }

  // 5. Final Podium & Results Screen
  if (session.stage === 'FINAL_PODIUM' || session.stage === 'FINAL_SCOREBOARD' || session.stage === 'CLOSED') {
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

  // 6. Active Question & Reveal Views
  const totalQuestions = session.totalQuestions || 1;
  const currentIdx = (session.currentQuestionIndex || 0) + 1;
  const isAnswered = !!studentAnswer;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-6 max-w-2xl mx-auto space-y-5 w-full font-sans">
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              LIVE GAME
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Q {currentIdx} OF {totalQuestions}
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-900 mt-1">{displayName}</h3>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Visual Timer */}
          <div
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-mono font-black text-base ${
              timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4 text-center">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
            {currentQuestion.questionText}
          </h2>
        </div>
      )}

      {/* Touch Options Grid / Lock-In / Feedback Screen */}
      {!isAnswered ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {currentQuestion?.options?.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(i)}
              disabled={submitting || timeLeft <= 0}
              className={`p-6 rounded-2xl border-b-4 font-black text-left text-base transition-transform active:scale-95 flex items-center space-x-4 shadow-lg disabled:opacity-50 ${
                optionColors[i % optionColors.length]
              }`}
            >
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black">
                {optionLetters[i]}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
            </button>
          ))}
        </div>
      ) : session.stage === 'SHOWING_RESULT' ? (
        /* Result Reveal Screen after timer ends */
        <div
          className={`p-8 rounded-3xl border shadow-2xl text-center space-y-6 animate-in zoom-in duration-200 ${
            studentAnswer.isCorrect
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400'
              : studentAnswer.isTimeout
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400'
              : 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white/30">
            {studentAnswer.isCorrect ? (
              <CheckCircle2 className="w-10 h-10 text-white" />
            ) : studentAnswer.isTimeout ? (
              <AlertCircle className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black">
              {studentAnswer.isCorrect ? '✓ CORRECT!' : studentAnswer.isTimeout ? '⌛ TIMEOUT' : '✕ INCORRECT'}
            </h2>
            <p className="text-base font-black tracking-wide">
              {studentAnswer.isCorrect ? `+${studentAnswer.pointsEarned} POINTS` : '+0 POINTS'}
            </p>
          </div>

          {/* Rank Movement Indicator */}
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 max-w-xs mx-auto flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80">CURRENT RANK</p>
              <p className="text-lg font-black font-mono">#{myRank}</p>
            </div>

            <div className="text-right">
              {rankDelta > 0 ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-400 text-slate-950 rounded-lg text-xs font-black">
                  <TrendingUp className="w-4 h-4" />
                  <span>↑ {rankDelta} POSITIONS</span>
                </span>
              ) : rankDelta < 0 ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-400 text-white rounded-lg text-xs font-black">
                  <TrendingDown className="w-4 h-4" />
                  <span>↓ {Math.abs(rankDelta)} POSITIONS</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white/20 text-white rounded-lg text-xs font-black">
                  <Minus className="w-4 h-4" />
                  <span>RANK UNCHANGED</span>
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Answer Locked-In State while other players complete question */
        <div className="p-8 rounded-3xl border border-amber-300 shadow-2xl text-center space-y-6 animate-in zoom-in duration-200 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 text-slate-950">
          <div className="w-16 h-16 rounded-full bg-slate-950/10 flex items-center justify-center mx-auto border-2 border-slate-950/20">
            <CheckCircle2 className="w-10 h-10 text-slate-950" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black">✓ ANSWER LOCKED</h2>
            <p className="text-sm font-bold opacity-90">Waiting for other players to finish...</p>
          </div>

          <div className="bg-slate-950/10 p-4 rounded-2xl backdrop-blur-md border border-slate-950/20 max-w-xs mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-wider">RESPONSE SPEED</p>
            <p className="text-base font-black font-mono mt-0.5">
              {((studentAnswer.responseTimeMs || 1000) / 1000).toFixed(2)} sec
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
