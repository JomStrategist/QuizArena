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

  const totalAns = liveStats.answeredCount || 0;
  const correctPct = totalAns > 0 ? Math.round((liveStats.correctCount / totalAns) * 100) : 83;
  const wrongPct = totalAns > 0 ? Math.round((liveStats.wrongCount / totalAns) * 100) : 17;

  // Circular timer SVG specs
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const totalTime = sessionData?.questionTime || 20;
  const timePercent = Math.max(0, Math.min(1, timeLeft / totalTime));
  const strokeDashoffset = circumference * (1 - timePercent);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-start p-2 sm:p-4 space-y-6 w-full font-sans text-slate-900">
      




      {/* Top Session Live Banner Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left Activity Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
            {quizTitle}
          </h1>
        </div>

        {/* Center: Game Code Card (Fills Center Space) */}
        <div className="flex-1 max-w-xl mx-auto md:mx-6 bg-slate-950 text-white px-8 py-3 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap hidden sm:inline">
              GAME CODE
            </span>
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono tracking-[0.2em] text-amber-400">
              {quizCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition cursor-pointer flex items-center"
            title="Copy URL"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* Right Controls: Next Question, Pause, End Game */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleNextQuestion}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handlePauseResumeToggle}
            disabled={actionLoading}
            className={`px-5 py-3 rounded-2xl font-black text-xs transition flex items-center space-x-2 shadow-xs ${
              stage === 'PAUSED'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
            }`}
          >
            {stage === 'PAUSED' ? (
              <>
                <PlayCircle className="w-4 h-4 fill-current" />
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
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl transition shadow-md shadow-rose-600/20 flex items-center space-x-2"
          >
            <StopCircle className="w-4 h-4" />
            <span>End Game</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid Layout */}
      <div className="grid grid-cols-1 gap-6 items-start">
        
        {/* Main Column: Progress, Timer, Active Question & Controls (Full Width) */}
        <div className="w-full space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Question Progress Header & Timer Box (Sticky on Scroll) */}
            <div className="sticky top-2 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
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
                      className="text-orange-100"
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

            {/* Active Question Content Box */}
            <div className="pt-2">
              <QuestionRenderer
                question={currentQuestion}
                mode="trainer"
                showCorrectAnswer={isTimeUp || showCorrectAnswerToggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
