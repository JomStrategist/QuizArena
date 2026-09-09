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
  Heart,
  Edit3,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { Top5Leaderboard } from './Top5Leaderboard';
import { LiveLobbyTrainer } from './LiveLobbyTrainer';
import { LivePodiumFinale } from './LivePodiumFinale';
import { QuestionRenderer } from '../common/QuestionRenderer';
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
  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);
  const [isFullLeaderboardOpen, setIsFullLeaderboardOpen] = useState<boolean>(false);

  // Control Toggles State
  const [showCorrectAnswerToggle, setShowCorrectAnswerToggle] = useState<boolean>(false);
  const [showLeaderboardToggle, setShowLeaderboardToggle] = useState<boolean>(true);
  const [playSoundToggle, setPlaySoundToggle] = useState<boolean>(true);

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
      console.error('Error syncing trainer session:', err);
    }
  };

  // Smooth local timer countdown synchronized with questionStartTimestamp
  const targetQuestionTime = currentQuestion?.timeLimit || sessionData?.questionTime || 30;

  useEffect(() => {
    if (sessionData?.stage !== 'QUESTION_ACTIVE' || !sessionData?.questionStartTimestamp) {
      setTimeLeft(targetQuestionTime);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionData.questionStartTimestamp) / 1000);
      const remaining = Math.max(0, targetQuestionTime - elapsed);
      setTimeLeft(remaining);

      soundManager.updateQuizState({
        stage: sessionData.stage,
        timeLeft: remaining,
        questionTimeLimit: targetQuestionTime,
      });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 500);

    return () => clearInterval(timerInterval);
  }, [sessionData?.stage, sessionData?.questionStartTimestamp, targetQuestionTime]);

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
          if (
            data.type === 'PARTICIPANT_JOINED' ||
            data.type === 'ANSWER_SUBMITTED' ||
            data.type === 'STAGE_CHANGED'
          ) {
            fetchSyncData();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [quizCode, playSoundToggle]);

  const handleNextQuestion = async () => {
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
    }
  };

  const handleStartQuiz = async () => {
    try {
      if (playSoundToggle) soundManager.playStartBeep(true);
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
    setPlaySoundToggle(!muted);
  };

  const handleCopyCode = () => {
    const url = `${window.location.origin}/quiz/join?code=${quizCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Session URL copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleScoreboardVisibility = async () => {
    if (!sessionData) return;
    const currentVisibility = sessionData.scoreboardVisibility || 'EVERYONE';
    const nextVisibility = currentVisibility === 'TRAINER_ONLY' ? 'EVERYONE' : 'TRAINER_ONLY';
    try {
      const res = await fetch('/api/v1/live-sessions/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode, scoreboardVisibility: nextVisibility }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          `Scoreboard visibility: ${nextVisibility === 'EVERYONE' ? 'Show to Everyone 👥' : 'Trainer Screen Only 🔒'}`,
          'info'
        );
        fetchSyncData();
      }
    } catch (err) {
      showToast('Error updating scoreboard visibility.', 'error');
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
    if (
      !confirm(
        'Are you sure you want to close this Live Game session? Students will no longer be able to answer.'
      )
    ) {
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
        onClose={onCloseSession}
      />
    );
  }

  // 2. LEADERBOARD SCREEN
  if (stage === 'LEADERBOARD' || (stage === 'PAUSED' && sessionData?.previousStage === 'LEADERBOARD')) {
    return (
      <Top5Leaderboard
        rankings={rankings}
        currentQuestionIndex={sessionData?.currentQuestionIndex || 0}
        totalQuestions={sessionData?.totalQuestions || 1}
        sessionType="LIVE_GAME"
        isTrainer={true}
        isPaused={sessionData?.stage === 'PAUSED'}
        onTogglePause={handlePauseResumeToggle}
        onNextQuestion={handleNextQuestion}
        timerDurationSec={3}
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
        isTrainer={true}
      />
    );
  }

  const totalQuestions = sessionData?.totalQuestions || 5;
  const currentIdx = (sessionData?.currentQuestionIndex || 0) + 1;
  const progressPercent = Math.min(100, Math.round((currentIdx / totalQuestions) * 100));
  const isTimeUp =
    stage === 'SHOWING_RESULT' ||
    stage === 'QUESTION_LOCKED' ||
    (stage === 'QUESTION_ACTIVE' && timeLeft <= 0);

  // Circular timer SVG specs
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const totalTime = targetQuestionTime;
  const timeRatio = Math.max(0, Math.min(1, timeLeft / Math.max(1, totalTime)));
  const strokeDashoffset = circumference * (1 - timeRatio);

  // Timer Color-Coding (Green -> Yellow -> Red)
  let timerColorClass = 'text-emerald-400';
  if (timeRatio <= 0.25) {
    timerColorClass = 'text-rose-500 animate-pulse';
  } else if (timeRatio <= 0.5) {
    timerColorClass = 'text-amber-400';
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-col justify-start p-3 sm:p-6 space-y-5 w-full font-sans">
      
      {/* Top Controls & Game Code Bar (Clean Header without extra logo) */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: LIVE Badge & Activity Title */}
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-full text-xs font-extrabold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE</span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-white leading-tight truncate max-w-xs sm:max-w-md">
            {quizTitle}
          </h1>
        </div>

        {/* Center: Glowing Game Code Box (Prominent & Extra Large) */}
        <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-blue-950/80 border-2 border-cyan-400/60 px-8 py-3 rounded-2xl shadow-xl shadow-cyan-500/20">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-cyan-400 shrink-0">
            GAME CODE
          </span>
          <span className="text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            {quizCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 text-cyan-400 hover:text-cyan-200 hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>

        {/* Right Controls: Next Question, Pause, End Game */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleNextQuestion}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handlePauseResumeToggle}
            disabled={actionLoading}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
              stage === 'PAUSED'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 text-white'
            }`}
          >
            {stage === 'PAUSED' ? (
              <>
                <PlayCircle className="w-4 h-4 fill-current text-white" />
                <span>Resume Game</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4" />
                <span>Pause Game</span>
              </>
            )}
          </button>

          <button
            onClick={handleCloseClick}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-rose-600/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <StopCircle className="w-4 h-4" />
            <span>End Game</span>
          </button>
        </div>
      </div>

      {/* Main Column: Progress, Timer, Active Question */}
      <div className="w-full space-y-5">
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          
          {/* Question Progress Bar & Color-Coded Circular Timer */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-6">
            
            {/* Progress Bar & Counter */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-black tracking-wide text-slate-300">
                <span>Question {currentIdx} of {totalQuestions}</span>
                <span className="text-cyan-400 font-extrabold">{progressPercent}% Completed</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-md shadow-cyan-500/30"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Clean Color-Coded Circular Timer Ring (No text clutter next to it) */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="5"
                  className={`${timerColorClass} transition-all duration-1000 ease-linear`}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-base font-black font-mono text-white drop-shadow">
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Active Question Box wrapped in clean card */}
          <div className="pt-1">
            <QuestionRenderer
              question={currentQuestion}
              mode="trainer"
              showCorrectAnswer={isTimeUp || showCorrectAnswerToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
