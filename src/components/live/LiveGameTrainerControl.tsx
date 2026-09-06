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
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { Top5Leaderboard } from './Top5Leaderboard';
import { LiveLobbyTrainer } from './LiveLobbyTrainer';
import { LivePodiumFinale } from './LivePodiumFinale';
import { ProjectorViewModal } from './ProjectorViewModal';
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

          if (remaining <= 5 && remaining > 0 && playSoundToggle) {
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans text-slate-900">
      
      {/* Projector View Full-Screen Modal */}
      <ProjectorViewModal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        quizCode={quizCode}
        quizTitle={quizTitle}
        currentQuestion={currentQuestion}
        currentIdx={currentIdx}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        totalTime={totalTime}
        totalParticipants={liveStats.totalParticipants || 28}
      />

      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between px-2 py-1">
        {/* Left Logo Identity */}
        <div className="flex items-center space-x-3">
          <img src="/QuizArena Icon.png" alt="QuizArena" className="w-9 h-9 object-contain" />
          <div className="flex items-center space-x-2">
            <span className="font-black text-xl text-slate-900 tracking-tight">
              Quiz<span className="text-blue-600">Arena</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-md">
              PRO
            </span>
          </div>
        </div>

        {/* Right Action Controls (NOTE: NO Admin/Trainer user avatar dropdown as requested) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleMute}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200 shadow-xs"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setIsProjectorOpen(true)}
            className="px-4 py-2 bg-white hover:bg-blue-50/50 text-blue-600 border border-blue-200 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-2xs"
          >
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span>Projector View</span>
          </button>
        </div>
      </header>

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

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>{totalQuestions} Questions</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl">
              <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{sessionData?.quizSnapshot?.category || 'Prompt Engineering'}</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Started at 10:24 AM</span>
            </span>
          </div>
        </div>

        {/* Center: Game Code Card */}
        <div className="bg-slate-950 text-white px-6 py-3 rounded-2xl border border-slate-800 shadow-md flex items-center space-x-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Game Code
            </p>
            <p className="text-3xl font-black font-mono tracking-widest text-amber-400">
              {quizCode}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Controls: Participants, Pause, End Game */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-bold text-xs">
            <Users className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-black text-sm block leading-none">{liveStats.totalParticipants || 28}</span>
              <span className="text-[10px] text-blue-500">Participants</span>
            </div>
          </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Progress, Timer, Active Question & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
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

            {/* Active Question Content Box */}
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
                  const isSelected = i === 0; // Role / Persona selected state in design
                  const isCorrectChoice = (isTimeUp || showCorrectAnswerToggle) && i === (currentQuestion?.correctOptionIndex || 0);

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border text-sm font-bold flex items-center space-x-3 transition-all ${
                        isCorrectChoice
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-md'
                          : isSelected
                          ? 'bg-blue-50/70 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                          isCorrectChoice
                            ? 'bg-emerald-600 text-white'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {letters[i]}
                      </span>
                      <span className="flex-1 font-extrabold">{opt}</span>
                      {isCorrectChoice && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Question Controls Bar */}
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

            {/* Interactive Control Toggles */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-700">
              
              {/* Show Correct Answer Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <span className="text-slate-600">Show Correct Answer</span>
                <input
                  type="checkbox"
                  checked={showCorrectAnswerToggle}
                  onChange={(e) => setShowCorrectAnswerToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative" />
              </label>

              {/* Show Leaderboard Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none border-l border-slate-200 pl-4">
                <span className="text-slate-600">Show Leaderboard</span>
                <input
                  type="checkbox"
                  checked={showLeaderboardToggle}
                  onChange={(e) => setShowLeaderboardToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative" />
              </label>

              {/* Play Sound Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none border-l border-slate-200 pl-4">
                <span className="text-slate-600">Play Sound</span>
                <input
                  type="checkbox"
                  checked={playSoundToggle}
                  onChange={(e) => setPlaySoundToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative" />
              </label>

              <button className="p-1 text-slate-400 hover:text-slate-700">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Response Monitor & Leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Response Monitor Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Live Response Monitor</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Joined */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {liveStats.totalParticipants || 28}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Joined</span>
                </div>
              </div>

              {/* Answered */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {liveStats.answeredCount || 24}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Answered</span>
                </div>
              </div>

              {/* Correct */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {liveStats.correctCount || 20}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Correct ({correctPct}%)</span>
                </div>
              </div>

              {/* Incorrect */}
              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {liveStats.wrongCount || 4}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700">Incorrect ({wrongPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Leaderboard Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Live Leaderboard</span>
              </div>
              <span className="text-xs font-bold text-blue-600">
                Top 5 of {rankings.length || 28} →
              </span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 px-2">
              <span className="col-span-1">#</span>
              <span className="col-span-6">Name</span>
              <span className="col-span-3 text-right">Score</span>
              <span className="col-span-2 text-right">Response Time</span>
            </div>

            {/* Top 5 Ranked Players */}
            <div className="space-y-2">
              {(rankings.length > 0
                ? rankings.slice(0, 5)
                : [
                    { displayName: 'Ajay', score: 1000, time: '3.2s' },
                    { displayName: 'Maria Thomas', score: 850, time: '4.1s' },
                    { displayName: 'Rahul Mehta', score: 760, time: '4.8s' },
                    { displayName: 'Sneha Iyer', score: 720, time: '5.4s' },
                    { displayName: 'Vikram Patel', score: 700, time: '6.1s' },
                  ]
              ).map((p: any, idx: number) => {
                const isFirst = idx === 0;
                const avatarColors = [
                  'bg-blue-600 text-white',
                  'bg-indigo-600 text-white',
                  'bg-purple-600 text-white',
                  'bg-pink-600 text-white',
                  'bg-rose-600 text-white',
                ];

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 items-center p-3 rounded-2xl text-xs transition-all ${
                      isFirst
                        ? 'bg-amber-50/80 border border-amber-200/80 text-amber-950 font-bold shadow-2xs'
                        : 'bg-slate-50/80 border border-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="col-span-1 font-black flex items-center justify-center">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </span>

                    <div className="col-span-6 flex items-center space-x-2.5 pl-1">
                      <span
                        className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                          avatarColors[idx % avatarColors.length]
                        }`}
                      >
                        {p.displayName?.charAt(0) || 'A'}
                      </span>
                      <span className="font-extrabold truncate text-slate-900">
                        {p.displayName}
                      </span>
                    </div>

                    <span className="col-span-3 text-right font-black text-slate-900 font-mono">
                      {(p.score || 1000).toLocaleString()}
                    </span>

                    <span className="col-span-2 text-right font-semibold text-slate-500 text-[11px]">
                      {p.time || `${(3.2 + idx * 0.9).toFixed(1)}s`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* View Full Leaderboard Button */}
            <button
              onClick={() => setIsFullLeaderboardOpen(true)}
              className="w-full py-2.5 bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200 text-blue-700 rounded-2xl text-xs font-extrabold transition flex items-center justify-center space-x-1.5 shadow-2xs mt-2"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Slogan */}
      <footer className="w-full flex items-center justify-end text-xs text-slate-400 font-medium pt-2">
        <p className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Play • Learn • Compete • Grow Together</span>
        </p>
      </footer>
    </div>
  );
};
