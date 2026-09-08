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
  Tv,
  Info,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { LivePodiumFinale } from './LivePodiumFinale';
import { ProjectorViewModal } from './ProjectorViewModal';
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
  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 w-full max-w-[96%] mx-auto font-sans text-slate-900 space-y-6">
      
      {/* Full Screen Projector View Modal */}
      <ProjectorViewModal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        quizCode={quizCode}
        quizTitle={quizTitle}
        currentQuestion={currentQuestion}
        currentIdx={currentIdx}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        totalTime={sessionData.questionTime || 30}
        totalParticipants={liveStats.totalParticipants}
      />

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-10 h-10 object-contain" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl text-slate-900">QuizArena</span>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 rounded-md flex items-center space-x-1">
                <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                <span>CONDUCT QUIZ SESSION</span>
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
              {quizTitle}
            </h1>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Game Code Display */}
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">CODE:</span>
            <span className="text-xl font-black font-mono tracking-wider text-blue-700">{quizCode}</span>
          </div>

          {/* Projector View Button */}
          <button
            onClick={() => setIsProjectorOpen(true)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-extrabold transition flex items-center space-x-1.5"
          >
            <Tv className="w-4 h-4 text-indigo-600" />
            <span>Projector View</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(soundManager.toggleMute())}
            className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause / Resume */}
          <button
            onClick={handlePauseResume}
            disabled={actionLoading}
            className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl text-xs font-bold hover:bg-amber-100 transition flex items-center space-x-1.5"
          >
            {sessionData.stage === 'PAUSED' ? (
              <>
                <PlayCircle className="w-4 h-4 text-amber-600" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Close Session */}
          <button
            onClick={handleCloseSession}
            disabled={actionLoading}
            className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black hover:bg-rose-100 transition flex items-center space-x-1.5"
          >
            <StopCircle className="w-4 h-4 text-rose-600" />
            <span>CLOSE QUIZ</span>
          </button>
        </div>
      </div>

      {/* Automatic Progression Info Banner */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-center space-x-3 text-xs text-blue-900 font-extrabold shadow-2xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Automatic Progression: Questions advance automatically when the timer reaches 00.</span>
      </div>

      {/* Question Progress & Synchronized Timer Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Progress Bar Card (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              QUESTION {currentIdx} OF {totalQuestions}
            </span>
            <span className="text-sm font-black text-blue-600">{progressPercent}% Completed</span>
          </div>

          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
            <span>Stage: <strong className="text-slate-900">{sessionData.stage}</strong></span>
            <span>Speed Scoring: <strong className="text-emerald-600">Active</strong></span>
          </div>
        </div>

        {/* Synchronized Timer Card (4 cols) */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            TIME REMAINING
          </span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-5xl font-black font-mono tracking-tight ${
              timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
            }`}>
              {timeLeft}
            </span>
            <span className="text-sm font-black text-slate-400">s</span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">Synced with server</span>
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

      {/* Answer Accuracy Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Correct Rate</span>
          <span className="font-mono text-emerald-600 font-black">{correctRatePercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${correctRatePercentage}%` }}
          />
        </div>
      </div>

      {/* Current Question Display (Trainer Monitoring Mode) */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 pl-1">
          CURRENT QUESTION MONITOR
        </h3>
        <QuestionRenderer question={currentQuestion} mode="trainer" />
      </div>

      {/* Standings / Leaderboard Overview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>LIVE LEADERBOARD STANDINGS ({rankings.length})</span>
          </h3>
        </div>

        {rankings.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No player scores recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rankings.slice(0, 6).map((rankItem, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-extrabold text-slate-900">{rankItem.displayName}</span>
                </div>
                <span className="font-black font-mono text-blue-600">{rankItem.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
