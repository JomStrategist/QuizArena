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
  Info,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { LivePodiumFinale } from './LivePodiumFinale';
import { QuestionRenderer } from '../common/QuestionRenderer';
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
    totalParticipants: 0,
    answeredCount: 0,
    correctCount: 0,
    wrongCount: 0,
    waitingCount: 0,
  });
  const [rankings, setRankings] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

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

          soundManager.updateQuizState({
            stage: sess.stage,
            timeLeft: remaining,
            questionTimeLimit: qTime,
          });
        } else {
          setTimeLeft(qTime);
          soundManager.updateQuizState({
            stage: sess.stage,
            timeLeft: qTime,
            questionTimeLimit: qTime,
          });
        }
      }
    } catch (err) {
      console.error('Error syncing conduct quiz trainer control:', err);
    }
  };

  useEffect(() => {
    fetchSyncData();
    const interval = setInterval(fetchSyncData, 1000);
    return () => clearInterval(interval);
  }, [quizCode]);

  const handleNextQuestion = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/live-sessions/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Advanced to next stage!', 'info');
        fetchSyncData();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseResume = async () => {
    setActionLoading(true);
    try {
      const endpoint = sessionData?.stage === 'PAUSED' ? 'resume' : 'pause';
      const res = await fetch(`/api/v1/live-sessions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          sessionData?.stage === 'PAUSED' ? 'Quiz Session Resumed' : 'Quiz Session Paused',
          'info'
        );
        fetchSyncData();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!confirm('Are you sure you want to end this Conduct Quiz session?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/live-sessions/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Conduct Quiz Session Closed', 'info');
        onCloseSession();
      }
    } catch (err) {
      showToast('Failed to close session', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!sessionData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500 font-bold text-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing Conduct Quiz Session...</span>
        </div>
      </div>
    );
  }

  // Show Podium Finale if session ended
  if (sessionData.stage === 'FINAL_PODIUM' || sessionData.stage === 'FINAL_SCOREBOARD') {
    return (
      <LivePodiumFinale
        quizTitle={quizTitle}
        rankings={rankings}
        onBackToDashboard={onCloseSession}
      />
    );
  }

  const currentIdx = (sessionData.currentQuestionIndex || 0) + 1;
  const totalQuestions = sessionData.totalQuestions || 5;
  const progressPercent = Math.round((currentIdx / totalQuestions) * 100);

  const answeredPercentage =
    liveStats.totalParticipants > 0
      ? Math.round((liveStats.answeredCount / liveStats.totalParticipants) * 100)
      : 0;

  const correctRatePercentage =
    liveStats.answeredCount > 0
      ? Math.round((liveStats.correctCount / liveStats.answeredCount) * 100)
      : 0;
  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrevQuestion = () => {
    showToast('Navigation is controlled by live session sequence', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 w-full font-sans text-slate-900 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: LIVE Badge + Title */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <Radio className="w-3.5 h-3.5 text-rose-600" />
              <span>LIVE</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {quizTitle}
          </h1>
        </div>

        {/* Right: GAME CODE + Full Screen + End Game */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Game Code Display Badge */}
          <div className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl flex items-center space-x-3 shadow-md">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">GAME CODE</div>
              <div className="text-2xl font-black font-mono tracking-widest text-amber-400">{quizCode}</div>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1.5 text-slate-400 hover:text-white transition"
              title="Copy Game Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Full Screen Toggle */}
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen?.().catch(() => {});
              } else {
                document.documentElement.requestFullscreen?.().catch(() => {});
              }
            }}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
            title="Toggle Native Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(soundManager.toggleMute())}
            className="p-3 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* End Game Button (Red Pill) */}
          <button
            onClick={handleCloseSession}
            disabled={actionLoading}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm rounded-full transition flex items-center space-x-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
          >
            <StopCircle className="w-5 h-5" />
            <span>End Game</span>
          </button>
        </div>
      </div>

      {/* Main Question Card Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Top Card Row: Question X of Y + Progress Bar + % Completed + Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider">
              <span>Question {currentIdx} of {totalQuestions}</span>
              <span className="text-blue-600 font-bold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Time Remaining Badge Card */}
          <div className="px-5 py-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-2xl font-black font-mono leading-none ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                {timeLeft}s
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-amber-700 pt-0.5">TIME REMAINING</div>
            </div>
          </div>
        </div>

        {/* Current Question View */}
        <div className="pt-2">
          <QuestionRenderer
            question={currentQuestion}
            mode="trainer"
            showCorrectAnswer={showAnswer}
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrevQuestion}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black transition flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{showAnswer ? 'Hide Answer' : 'Show Answer'}</span>
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition flex items-center space-x-2 shadow-md shadow-blue-600/25 active:scale-95 disabled:opacity-50"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Students Joined */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Students Joined</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {liveStats.totalParticipants}
          </p>
        </div>

        {/* Answered */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Answered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {liveStats.answeredCount}
            </p>
            <span className="text-xs font-bold text-slate-400">({answeredPercentage}%)</span>
          </div>
        </div>

        {/* Correct / Incorrect */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Correct / Wrong</span>
            <BarChart2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center space-x-2 text-sm font-black font-mono">
            <span className="text-emerald-600">{liveStats.correctCount} ✓</span>
            <span className="text-slate-300">/</span>
            <span className="text-rose-500">{liveStats.wrongCount} ✗</span>
          </div>
        </div>

        {/* Waiting for Submission */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Waiting</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {liveStats.waitingCount}
          </p>
        </div>
      </div>
    </div>
  );
};
