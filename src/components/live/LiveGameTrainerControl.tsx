'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  BarChart2,
  StopCircle,
  PauseCircle,
  PlayCircle,
  Radio,
  BookOpen,
  Trophy,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { Top5Leaderboard } from './Top5Leaderboard';
import { LiveLobbyTrainer } from './LiveLobbyTrainer';
import { LivePodiumFinale } from './LivePodiumFinale';
import { soundManager } from '@/lib/game/soundManager';

interface LiveGameTrainerControlProps {
  quizCode: string;
  quizTitle: string;
  onCloseSession: () => void;
}

export const LiveGameTrainerControl: React.FC<LiveGameTrainerControlProps> = ({
  quizCode,
  quizTitle,
  onCloseSession,
}) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>({
    totalParticipants: 0,
    answeredCount: 0,
    correctCount: 0,
    wrongCount: 0,
    waitingCount: 0,
  });
  const [rankings, setRankings] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  const { showToast } = useToast();

  const fetchSyncData = async () => {
    try {
      const res = await fetch(`/api/v1/live-sessions/sync?code=${quizCode}&role=trainer`);
      const json = await res.json();

      if (json.success && json.data) {
        const sess = json.data.session;
        setSessionData(sess);
        setCurrentQuestion(json.data.currentQuestion);
        setLiveStats(json.data.liveStats);
        setRankings(json.data.rankings || []);

        const qStart = sess.questionStartTimestamp;
        const qTime = sess.questionTime || 20;
        const sTime = json.data.serverTime || Date.now();

        if (qStart && sess.stage === 'QUESTION_ACTIVE') {
          const elapsed = Math.floor((sTime - qStart) / 1000);
          const remaining = Math.max(0, qTime - elapsed);
          setTimeLeft(remaining);

          if (remaining <= 5 && remaining > 0) {
            soundManager.playTickSound();
          }
        } else {
          setTimeLeft(qTime);
        }
      }
    } catch (err) {
      console.error('Error syncing trainer session:', err);
    }
  };

  useEffect(() => {
    fetchSyncData();
    const interval = setInterval(fetchSyncData, 1000);

    // SSE Real-Time Event Listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/v1/live-sessions/stream?code=${quizCode}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PARTICIPANT_JOINED' || data.type === 'ANSWER_SUBMITTED' || data.type === 'STAGE_CHANGED') {
            fetchSyncData();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [quizCode]);

  const handleStartQuiz = async () => {
    try {
      soundManager.playStartBeep(true);
      const res = await fetch('/api/v1/live-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Live Game Started!', 'success');
        fetchSyncData();
      }
    } catch (err) {
      showToast('Error starting quiz.', 'error');
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopied(true);
    showToast('Session Quiz Code copied!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePauseResumeToggle = async () => {
    if (!sessionData) return;
    setActionLoading(true);
    const targetAction = sessionData.stage === 'PAUSED' ? 'resume' : 'pause';
    try {
      const res = await fetch('/api/v1/live-sessions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode, action: targetAction }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(targetAction === 'pause' ? 'Live Game Paused' : 'Live Game Resumed', 'info');
        fetchSyncData();
      } else {
        showToast(json.error?.message || 'Action failed.', 'error');
      }
    } catch (err) {
      showToast('Error toggling pause state.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseClick = async () => {
    if (!confirm('Are you sure you want to close this Live Game session? Students will no longer be able to answer.')) {
      return;
    }
    try {
      const res = await fetch('/api/v1/live-sessions/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Live Game Session closed.', 'info');
        onCloseSession();
      }
    } catch (err) {
      showToast('Error closing session.', 'error');
    }
  };

  const stage = sessionData?.stage || 'LOBBY';

  // 1. LOBBY SCREEN
  if (stage === 'LOBBY') {
    return (
      <LiveLobbyTrainer
        quizCode={quizCode}
        quizTitle={quizTitle}
        sessionType="LIVE_GAME"
        participants={rankings}
        onStartGame={handleStartQuiz}
      />
    );
  }

  // 2. LEADERBOARD SCREEN
  if (stage === 'LEADERBOARD') {
    return (
      <Top5Leaderboard
        rankings={rankings}
        currentQuestionIndex={sessionData?.currentQuestionIndex || 0}
        totalQuestions={sessionData?.totalQuestions || 1}
        sessionType="LIVE_GAME"
      />
    );
  }

  // 3. FINAL PODIUM SCREEN
  if (stage === 'FINAL_PODIUM' || stage === 'FINAL_SCOREBOARD' || stage === 'CLOSED') {
    return (
      <LivePodiumFinale
        quizTitle={quizTitle}
        rankings={rankings}
        onBackToDashboard={onCloseSession}
      />
    );
  }

  const totalQuestions = sessionData?.totalQuestions || 1;
  const currentIdx = (sessionData?.currentQuestionIndex || 0) + 1;
  const progressPercent = Math.min(100, Math.round((currentIdx / totalQuestions) * 100));
  const isTimeUp = stage === 'SHOWING_RESULT' || stage === 'QUESTION_LOCKED' || (stage === 'QUESTION_ACTIVE' && timeLeft <= 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-10 h-10 object-contain" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                LIVE GAME SESSION
              </span>
              <span className="text-xs font-bold text-slate-400">
                STATUS: <strong className="text-slate-900 font-extrabold uppercase">{stage}</strong>
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{quizTitle}</h1>
          </div>
        </div>

        {/* 6-Digit Code & Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>

          {/* Quiz Code Badge */}
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-slate-900 text-amber-400 rounded-2xl font-mono font-black text-lg tracking-widest flex items-center space-x-2 shadow-md hover:bg-slate-800 transition"
          >
            <span>{quizCode}</span>
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={handlePauseResumeToggle}
            disabled={actionLoading}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-sm ${
              stage === 'PAUSED'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            {stage === 'PAUSED' ? (
              <>
                <PlayCircle className="w-4 h-4 fill-current" />
                <span>RESUME GAME</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4" />
                <span>PAUSE GAME</span>
              </>
            )}
          </button>

          {/* Close Game Button */}
          <button
            onClick={handleCloseClick}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-rose-600/20 flex items-center space-x-1.5"
          >
            <StopCircle className="w-4 h-4" />
            <span>CLOSE GAME</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timer, Question & Choices (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>
                  QUESTION {currentIdx} OF {totalQuestions}
                </span>
              </div>
              <span className="text-xs font-black text-amber-600">{progressPercent}% Completed</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Timer Box */}
            {stage === 'PAUSED' ? (
              <div className="p-6 rounded-2xl border bg-amber-50 border-amber-300 text-amber-900 text-center animate-pulse">
                <p className="text-xs font-black uppercase tracking-widest">GAME PAUSED BY TRAINER</p>
                <p className="text-sm font-semibold mt-1">Students are waiting for session to resume.</p>
              </div>
            ) : stage === 'STARTING' ? (
              <div className="p-6 rounded-2xl border bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-center font-black">
                <p className="text-xs uppercase tracking-widest">GET READY!</p>
                <p className="text-4xl font-black mt-1">3 ... 2 ... 1 ... GO!</p>
              </div>
            ) : (
              <div
                className={`p-6 rounded-2xl border text-center transition-colors ${
                  timeLeft <= 5
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 border-amber-300'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-widest opacity-80">
                  Question Time Limit ({sessionData?.questionTime || 20}s)
                </p>
                <div className="flex items-center justify-center space-x-3 mt-1">
                  <Clock className="w-8 h-8" />
                  <span className="text-4xl md:text-5xl font-black font-mono tracking-tight">{timeLeft}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Question Text & Choices */}
          {currentQuestion && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Question Content</h3>
              <p className="text-base md:text-xl font-black text-slate-900 leading-snug">
                {currentQuestion.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options?.map((opt: string, i: number) => {
                  const isCorrectChoice = isTimeUp && i === currentQuestion.correctOptionIndex;
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-3 transition-all ${
                        isCorrectChoice
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          isCorrectChoice ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letters[i]}
                      </span>
                      <span className="flex-1 text-sm">{opt}</span>
                      {isCorrectChoice && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Statistics & Leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-amber-600" />
              <span>Live Response Monitor</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500">Students Joined</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {liveStats.totalParticipants} / {sessionData?.maxParticipants || 200}
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-[11px] font-bold text-amber-800">Answered</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{liveStats.answeredCount}</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-[11px] font-bold text-emerald-700">Correct</p>
                <p className="text-2xl font-black text-emerald-800 mt-1">{liveStats.correctCount}</p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-[11px] font-bold text-rose-700">Incorrect</p>
                <p className="text-2xl font-black text-rose-800 mt-1">{liveStats.wrongCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Live Leaderboard</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-600">Top 5 Players</span>
            </div>

            <div className="space-y-2">
              {rankings.slice(0, 5).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-black flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900">{p.displayName}</span>
                  </div>
                  <span className="font-black text-amber-600 font-mono">{(p.score || 0).toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
