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
  Maximize2,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  Edit3,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { LiveLobbyTrainer } from './LiveLobbyTrainer';
import { LivePodiumFinale } from './LivePodiumFinale';
import { soundManager } from '@/lib/game/soundManager';

interface ConductQuizTrainerControlProps {
  quizCode: string;
  quizTitle: string;
  onCloseSession: () => void;
}

export const ConductQuizTrainerControl: React.FC<ConductQuizTrainerControlProps> = ({
  quizCode,
  quizTitle,
  onCloseSession,
}) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>({
    totalParticipants: 3,
    answeredCount: 3,
    correctCount: 2,
    wrongCount: 1,
    waitingCount: 0,
  });
  const [rankings, setRankings] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(16);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
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
        setRankings(json.data.rankings || []);
        if (json.data.liveStats) setLiveStats(json.data.liveStats);

        const qStart = sess.questionStartTimestamp;
        const qTime = sess.questionTime || 30;
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
      console.error('Error syncing conduct quiz session:', err);
    }
  };

  useEffect(() => {
    fetchSyncData();
    const interval = setInterval(fetchSyncData, 1000);
    return () => clearInterval(interval);
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
        showToast('Conduct Quiz Started!', 'success');
        fetchSyncData();
      }
    } catch (err) {
      showToast('Error starting quiz.', 'error');
    }
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
        showToast(targetAction === 'pause' ? 'Quiz Paused' : 'Quiz Resumed', 'info');
        fetchSyncData();
      }
    } catch (err) {
      showToast('Error toggling pause state.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevealAnswer = async () => {
    try {
      const res = await fetch('/api/v1/live-sessions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode, action: 'reveal' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Revealing Correct Answer & Results!', 'info');
        fetchSyncData();
      }
    } catch (err) {
      showToast('Error revealing answer.', 'error');
    }
  };

  const handleCloseClick = async () => {
    if (!confirm('Are you sure you want to end this Conduct Quiz session?')) {
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
        showToast('Conduct Quiz Session closed.', 'info');
        onCloseSession();
      }
    } catch (err) {
      showToast('Error closing session.', 'error');
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const stage = sessionData?.stage || 'LOBBY';

  // 1. LOBBY SCREEN
  if (stage === 'LOBBY') {
    return (
      <LiveLobbyTrainer
        quizCode={quizCode}
        quizTitle={quizTitle}
        sessionType="CONDUCT"
        participants={rankings}
        onStartGame={handleStartQuiz}
        onClose={onCloseSession}
      />
    );
  }

  // 2. FINAL PODIUM SCREEN
  if (stage === 'FINAL_PODIUM' || stage === 'FINAL_SCOREBOARD' || stage === 'CLOSED') {
    return (
      <LivePodiumFinale
        quizTitle={quizTitle}
        rankings={rankings}
        onBackToDashboard={onCloseSession}
      />
    );
  }

  const totalQuestions = sessionData?.totalQuestions || 5;
  const currentIdx = (sessionData?.currentQuestionIndex || 0) + 1;
  const progressPercent = Math.min(100, Math.round((currentIdx / totalQuestions) * 100));

  const totalAns = liveStats.answeredCount || 3;
  const correctCount = liveStats.correctCount || 2;
  const wrongCount = liveStats.wrongCount || 1;
  const accuracyPct = totalAns > 0 ? Math.round((correctCount / totalAns) * 100) : 67;

  // Circular timer SVG specs
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const totalTime = sessionData?.questionTime || 30;
  const timePercent = Math.max(0, Math.min(1, timeLeft / totalTime));
  const strokeDashoffset = circumference * (1 - timePercent);

  // ==========================================
  // TRAINER SCREEN 4: QUESTION RESULT VIEW
  // ==========================================
  if (stage === 'SHOWING_RESULT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-6 max-w-5xl mx-auto w-full font-sans text-slate-900 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/QuizArena Icon.png" alt="QuizArena" className="w-8 h-8 object-contain" />
            <span className="font-black text-xl text-slate-900 tracking-tight">
              Quiz<span className="text-blue-600">Arena</span>
            </span>
          </div>

          <button onClick={handleToggleMute} className="p-2 bg-slate-100 rounded-xl text-slate-600">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Result Banner: Correct Answer! A. Role / Persona */}
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-center space-y-2 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-emerald-950">
            Correct Answer! <span className="text-emerald-700">A. Role / Persona</span>
          </h1>
        </div>

        {/* Stat Summary Grid (4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
            <span className="text-3xl font-black text-emerald-600 block">{correctCount}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
            <span className="text-3xl font-black text-rose-600 block">{wrongCount}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incorrect</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
            <span className="text-3xl font-black text-blue-600 block">{accuracyPct}%</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl shadow-2xs flex items-center justify-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Average Response Time
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">4.2 seconds</span>
            </div>
          </div>
        </div>

        {/* Top Performers (This Question) Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Top Performers (This Question)</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2 text-right">Score</th>
                  <th className="pb-2 text-right">Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(rankings.length > 0
                  ? rankings.slice(0, 3)
                  : [
                      { displayName: 'Ajay', score: 1000, time: '3.1s' },
                      { displayName: 'Maria', score: 850, time: '4.0s' },
                      { displayName: 'Rahul', score: 720, time: '5.2s' },
                    ]
                ).map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 font-black text-slate-700">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                        idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-slate-900">{p.displayName}</td>
                    <td className="py-3 text-right font-black text-amber-600 font-mono">
                      {(p.score || 1000).toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-500 font-mono">
                      {p.time || `${(3.1 + idx * 0.9).toFixed(1)}s`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="space-y-1.5 text-center">
          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 font-semibold">
            Next question will start automatically in 5s...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // TRAINER SCREEN 3: CONDUCT QUIZ (LIVE)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans text-slate-900">
      
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-9 h-9 object-contain" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                LIVE CONDUCT
              </span>
              <span className="text-xs font-bold text-slate-400">
                STATUS: <strong className="text-slate-900 font-extrabold uppercase">{stage}</strong>
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 leading-tight mt-0.5">
              {quizTitle}
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end">
          <button
            onClick={handleToggleMute}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={handleCloseClick}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl transition shadow-md shadow-rose-600/20 flex items-center space-x-1.5"
          >
            <StopCircle className="w-4 h-4" />
            <span>End Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Main Section: Question & Timer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Question Progress Header & Timer Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Question {currentIdx} of {totalQuestions}</span>
                  <span className="text-blue-600 font-extrabold">{progressPercent}% Completed</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Countdown Circular Timer Ring */}
              <div className="bg-orange-50/80 border border-orange-200 px-4 py-2 rounded-2xl flex items-center space-x-3 shrink-0">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                    <circle
                      cx="30"
                      cy="30"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-orange-200"
                      fill="transparent"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-orange-500 transition-all duration-1000 ease-linear"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Clock className="w-4 h-4 text-orange-600 absolute" />
                </div>
                <div>
                  <span className="text-xl font-black font-mono text-slate-900 leading-none block">
                    {timeLeft}s
                  </span>
                  <span className="text-[10px] font-extrabold text-orange-700 uppercase tracking-wider">
                    Time Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Active Question Box */}
            <div className="space-y-4 pt-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>Multiple Choice</span>
              </div>

              <h2 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                {currentQuestion?.questionText ||
                  'Which element of the RCTOF prompt engineering framework defines WHO the AI should act as during response generation?'}
              </h2>

              {/* 2x2 Option Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {(currentQuestion?.options || [
                  'Role / Persona',
                  'Context',
                  'Task',
                  'Output Format',
                ]).map((opt: string, i: number) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = i === 0;

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border text-sm font-bold flex items-center space-x-3 transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {letters[i]}
                      </span>
                      <span className="flex-1 font-extrabold">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                disabled={currentIdx <= 1}
                className="px-4 py-2 bg-slate-100 text-slate-400 rounded-2xl text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleStartQuiz}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center space-x-2 shadow-md shadow-blue-600/20 transition"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePauseResumeToggle}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-2xl text-xs font-extrabold transition flex items-center space-x-1.5"
              >
                <PauseCircle className="w-4 h-4 text-amber-700" />
                <span>Pause</span>
              </button>

              <button
                onClick={handleRevealAnswer}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-extrabold transition flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Reveal Answer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Live Response Monitor & Answer Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Response Monitor (2x2 Grid) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Live Response Monitor</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {liveStats.totalParticipants || 3}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Joined</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {liveStats.answeredCount || 3}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Answered</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {correctCount}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Correct ({accuracyPct}%)</span>
                </div>
              </div>

              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {wrongCount}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700">Incorrect (33%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Distribution Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Answer Distribution</span>
            </h3>

            {/* Visual Bar Chart per Option A, B, C, D */}
            <div className="grid grid-cols-4 gap-3 items-end h-40 pt-4 px-2">
              
              {/* Option A (2, 67%) */}
              <div className="flex flex-col items-center space-y-2 h-full justify-end">
                <span className="text-[10px] font-extrabold text-emerald-700">2 (67%)</span>
                <div className="w-full bg-emerald-500 rounded-t-xl h-[67%] shadow-xs" />
                <span className="text-xs font-black text-slate-900">A</span>
              </div>

              {/* Option B (1, 33%) */}
              <div className="flex flex-col items-center space-y-2 h-full justify-end">
                <span className="text-[10px] font-extrabold text-rose-600">1 (33%)</span>
                <div className="w-full bg-rose-400 rounded-t-xl h-[33%] shadow-xs" />
                <span className="text-xs font-black text-slate-900">B</span>
              </div>

              {/* Option C (0, 0%) */}
              <div className="flex flex-col items-center space-y-2 h-full justify-end">
                <span className="text-[10px] font-extrabold text-slate-400">0 (0%)</span>
                <div className="w-full bg-slate-200 rounded-t-xl h-[4%]" />
                <span className="text-xs font-black text-slate-900">C</span>
              </div>

              {/* Option D (0, 0%) */}
              <div className="flex flex-col items-center space-y-2 h-full justify-end">
                <span className="text-[10px] font-extrabold text-slate-400">0 (0%)</span>
                <div className="w-full bg-slate-200 rounded-t-xl h-[4%]" />
                <span className="text-xs font-black text-slate-900">D</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
