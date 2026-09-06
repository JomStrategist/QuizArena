'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart2,
  Sparkles,
  StopCircle,
  PauseCircle,
  PlayCircle,
  Radio,
  BookOpen,
  Trophy,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { Top5Leaderboard } from './Top5Leaderboard';

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
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const { showToast } = useToast();

  const fetchSyncData = async () => {
    try {
      const res = await fetch(`/api/v1/live-sessions/sync?code=${quizCode}&role=trainer`);
      const json = await res.json();

      if (json.success && json.data) {
        setSessionData(json.data.session);
        setCurrentQuestion(json.data.currentQuestion);
        setLiveStats(json.data.liveStats);

        const qStart = json.data.session.questionStartTimestamp;
        const qTime = json.data.session.questionTime || 20;
        const sTime = json.data.serverTime || Date.now();

        if (qStart && json.data.session.stage === 'QUESTION_ACTIVE') {
          const elapsed = Math.floor((sTime - qStart) / 1000);
          const remaining = Math.max(0, qTime - elapsed);
          setTimeLeft(remaining);
        } else {
          setTimeLeft(qTime);
        }
      }
    } catch (err) {
      console.error('Error syncing live game session:', err);
    }
  };

  useEffect(() => {
    fetchSyncData();
    const interval = setInterval(fetchSyncData, 1000);
    return () => clearInterval(interval);
  }, [quizCode]);

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
        showToast(
          targetAction === 'pause' ? 'Live Game Paused' : 'Live Game Resumed',
          'info'
        );
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

  const totalQuestions = sessionData?.totalQuestions || 1;
  const currentIdx = (sessionData?.currentQuestionIndex || 0) + 1;
  const stage = sessionData?.stage || 'QUESTION_ACTIVE';
  const progressPercent = Math.min(100, Math.round((currentIdx / totalQuestions) * 100));

  const totalAns = liveStats.answeredCount || 0;
  const correctPct = totalAns > 0 ? Math.round((liveStats.correctCount / totalAns) * 100) : 0;
  const isTimeUp = stage === 'SHOWING_RESULT' || stage === 'QUESTION_LOCKED' || (stage === 'QUESTION_ACTIVE' && timeLeft <= 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans">
      {/* Top Banner Header: Projector / Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
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
        {/* Left Column: Timer, Question & Answer Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Header & Timer Box */}
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

            {/* Stage Notice / Timer */}
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
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Question Timer</p>
                <div className="flex items-center justify-center space-x-3 mt-1">
                  <Clock className="w-8 h-8" />
                  <span className="text-4xl md:text-5xl font-black font-mono tracking-tight">{timeLeft}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Question Text & Choices Preview */}
          {currentQuestion && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Question</h3>
              <p className="text-base md:text-lg font-black text-slate-900 leading-snug">
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
          {/* Live Metrics Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-amber-600" />
              <span>Live Response Monitor</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Joined */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500">Students Joined</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {liveStats.totalParticipants} / {sessionData?.maxParticipants || 200}
                </p>
              </div>

              {/* Answered */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-[11px] font-bold text-amber-800">Answered</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{liveStats.answeredCount}</p>
              </div>

              {/* Correct */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-[11px] font-bold text-emerald-700">Correct</p>
                <p className="text-2xl font-black text-emerald-800 mt-1">{liveStats.correctCount}</p>
              </div>

              {/* Incorrect */}
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-[11px] font-bold text-rose-700">Incorrect</p>
                <p className="text-2xl font-black text-rose-800 mt-1">{liveStats.wrongCount}</p>
              </div>
            </div>

            {/* Waiting Count Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500">Waiting for Submission</p>
                <p className="text-lg font-black text-slate-800">{liveStats.waitingCount} Students</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Live Leaderboard Snippet */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Live Leaderboard</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-600">Top 5 Players</span>
            </div>

            <div className="space-y-2">
              {(sessionData?.rankings || []).slice(0, 5).map((p: any, idx: number) => (
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
