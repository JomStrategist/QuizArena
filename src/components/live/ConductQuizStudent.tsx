'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Volume2,
  VolumeX,
  Users,
  Lightbulb,
  Trophy,
  BookOpen,
  Hourglass,
  ArrowRight,
  BarChart2,
  Sparkles,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';
import { soundManager } from '@/lib/game/soundManager';

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
  const [timeLeft, setTimeLeft] = useState<number>(16);
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
        const qTime = sess.questionTime || 30;
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
      console.error('Error syncing student conduct state:', err);
    }
  };

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 1000);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/v1/live-sessions/stream?code=${quizCode}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'STAGE_CHANGED' ||
            data.type === 'GAME_STARTED' ||
            data.type === 'GAME_CLOSED'
          ) {
            syncState();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [quizCode, displayName, participantId]);

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

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const totalQuestions = session?.totalQuestions || 5;
  const currentIdx = (session?.currentQuestionIndex || 0) + 1;
  const stage = session?.stage || 'LOBBY';

  // ==========================================
  // STUDENT SCREEN 2: WAITING ROOM
  // ==========================================
  if (!session || stage === 'LOBBY') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-blue-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans overflow-hidden animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center space-x-3">
            <img src="/QuizArena Icon.png" alt="QuizArena" className="w-8 h-8 object-contain" />
            <div>
              <span className="font-black text-lg text-white">QuizArena</span>
              <p className="text-[9px] font-bold text-blue-300 uppercase tracking-wide">Live Game Session</p>
            </div>
          </div>

          <button onClick={handleToggleMute} className="p-2 rounded-xl bg-white/10 text-white">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-300" />}
          </button>
        </div>

        {/* Center Stage */}
        <div className="my-auto max-w-md mx-auto w-full space-y-6 text-center py-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-amber-400/80 flex items-center justify-center shadow-xl text-amber-300">
              <Hourglass className="w-9 h-9 animate-spin duration-3000" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome <span className="text-amber-400">{displayName}!</span>
            </h1>
            <p className="text-xs text-blue-200 font-medium px-4">
              You're in! Waiting for the trainer to start the quiz.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-extrabold text-blue-100">
              <Users className="w-4 h-4 text-blue-400" />
              <span>3 Participants</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-extrabold text-amber-200">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="truncate max-w-[150px]">Activity 4: Prompt Engineering</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-blue-300 font-medium pt-2 border-t border-white/10">
          QuizArena Live Game
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT SCREEN 6: FINAL LEADERBOARD
  // ==========================================
  if (stage === 'FINAL_PODIUM' || stage === 'FINAL_SCOREBOARD' || stage === 'CLOSED') {
    const myRecord = rankings.find(
      (p) => (participantId && p.participantId === participantId) || p.displayName === displayName
    ) || { rank: 1, score: 4059, accuracy: '80%' };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-blue-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans overflow-hidden animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center space-x-3">
            <img src="/QuizArena Icon.png" alt="QuizArena" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg text-white">QuizArena</span>
          </div>

          <button onClick={handleToggleMute} className="p-2 rounded-xl bg-white/10 text-white">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-300" />}
          </button>
        </div>

        {/* Center Stage */}
        <div className="my-auto max-w-md mx-auto w-full space-y-6 text-center py-4">
          <div className="w-20 h-20 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-2xl border-2 border-amber-200 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Great Job!
            </h1>
            <p className="text-sm font-extrabold text-amber-400">
              You finished #{myRecord.rank || 1}!
            </p>
          </div>

          {/* Score & Accuracy Box */}
          <div className="bg-slate-900/90 border border-white/20 p-5 rounded-3xl backdrop-blur-md flex items-center justify-between text-left shadow-xl">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Score</p>
              <p className="text-3xl font-black font-mono text-amber-400">
                {(myRecord.score || 4059).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
              <p className="text-lg font-black text-emerald-400 font-mono">
                {myRecord.accuracy || '80%'}
              </p>
            </div>
          </div>

          {/* Standings List */}
          <div className="bg-white/10 border border-white/15 p-4 rounded-3xl space-y-2 text-left">
            {(rankings.length > 0
              ? rankings.slice(0, 3)
              : [
                  { displayName: 'Ajay', score: 4059 },
                  { displayName: 'Maria', score: 3210 },
                  { displayName: 'Rahul', score: 2890 },
                ]
            ).map((p: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white/10 rounded-xl text-xs font-bold"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-white">{p.displayName}</span>
                </div>
                <span className="font-mono text-amber-300">{(p.score || 1000).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={onExit || (() => (window.location.href = '/'))}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-blue-300 font-medium">
          QuizArena by KVJ Analytics
        </div>
      </div>
    );
  }

  const isAnswered = !!studentAnswer || selectedOption !== null;

  // ==========================================
  // STUDENT SCREEN 4: ANSWER SUBMITTED
  // ==========================================
  if (isAnswered && stage !== 'SHOWING_RESULT') {
    const chosenIndex = studentAnswer?.selectedOptionIndex ?? selectedOption ?? 0;
    const chosenText = currentQuestion?.options?.[chosenIndex] || 'Role / Persona';
    const respTimeSec = ((studentAnswer?.responseTimeMs || Date.now() - startTimeMs) / 1000).toFixed(1);

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-green-950 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
            Q {currentIdx} OF {totalQuestions}
          </span>
          <button onClick={handleToggleMute} className="p-2 rounded-xl bg-white/10 text-white">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>
        </div>

        {/* Center Stage */}
        <div className="my-auto max-w-md mx-auto w-full space-y-6 text-center py-4">
          
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl border-2 border-emerald-300 text-white">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Answer Submitted!
            </h1>
            <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
              You chose
            </p>
          </div>

          {/* Option Badge */}
          <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-left">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0">
              {optionLetters[chosenIndex % 4]}
            </span>
            <span className="text-base font-extrabold flex-1 text-slate-900 leading-snug">
              {chosenText}
            </span>
          </div>

          {/* Speed Card */}
          <div className="bg-emerald-900/60 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 text-emerald-200 font-bold">
              <div className="p-2 rounded-xl bg-emerald-400 text-slate-950">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-80">Response Time</p>
                <p className="text-sm font-black text-white font-mono">{respTimeSec} seconds</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-wider">
              Fast!
            </span>
          </div>

          {/* Loading Dots */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-emerald-200">
              Waiting for other players to finish...
            </p>
            <div className="flex justify-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse delay-300" />
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-emerald-400 font-medium">
          QuizArena Live Game
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT SCREEN 5: QUESTION RESULT
  // ==========================================
  if (stage === 'SHOWING_RESULT') {
    const isCorrect = studentAnswer?.isCorrect ?? true;
    const pointsEarned = studentAnswer?.pointsEarned ?? 682;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full font-sans text-slate-900 animate-in zoom-in duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3">
            <img src="/QuizArena Icon.png" alt="QuizArena" className="w-7 h-7 object-contain" />
            <span className="font-black text-base text-slate-900">QuizArena</span>
          </div>

          <button onClick={handleToggleMute} className="p-2 rounded-xl bg-slate-100 text-slate-600">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Correct Banner */}
        <div
          className={`p-6 rounded-3xl border shadow-lg text-center space-y-2 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-white shadow-md ${
              isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl font-black">
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h2>

          <p className="text-sm font-extrabold text-emerald-700">
            {isCorrect ? `+${pointsEarned} Points` : '+0 Points'}
          </p>
        </div>

        {/* Explanation Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-xs font-black text-amber-600">
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Explanation</span>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {currentQuestion?.explanation ||
              'Role / Persona defines WHO the AI should act as, including its identity, expertise, and style during response generation.'}
          </p>
        </div>

        {/* Next Question Action */}
        <div className="space-y-1.5 text-center pt-2">
          <button
            onClick={() => showToast('Waiting for trainer to advance question...', 'info')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] font-bold text-slate-400">
            Next question in 5s...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT SCREEN 3: QUESTION SCREEN
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto w-full font-sans text-slate-900 space-y-4">
      
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          Q {currentIdx} of {totalQuestions}
        </span>

        {/* Center Circular 16s Timer Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="currentColor"
              strokeWidth="5"
              className="text-amber-100"
              fill="transparent"
            />
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="currentColor"
              strokeWidth="5"
              className={`${
                timeLeft <= 5 ? 'text-rose-500' : 'text-amber-500'
              } transition-all duration-1000 ease-linear`}
              fill="transparent"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - Math.max(0, timeLeft / 30))}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-black font-mono text-slate-900">
            {timeLeft}s
          </span>
        </div>

        <button onClick={handleToggleMute} className="p-2 bg-slate-100 rounded-xl text-slate-600">
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
          <Edit3 className="w-3.5 h-3.5 text-purple-600" />
          <span>Multiple Choice</span>
        </div>

        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
          {currentQuestion?.questionText ||
            'Which element of the RCTOF prompt engineering framework defines WHO the AI should act as during response generation?'}
        </h2>
      </div>

      {/* Option Cards List */}
      <div className="space-y-3 flex-1">
        {(currentQuestion?.options || [
          'Role / Persona',
          'Context',
          'Task',
          'Output Format',
        ]).map((opt: string, i: number) => {
          const isSelected = selectedOption === i;
          return (
            <button
              key={i}
              onClick={() => handleOptionSelect(i)}
              disabled={submitting || timeLeft <= 0}
              className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center space-x-3.5 shadow-xs disabled:opacity-50 ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {optionLetters[i]}
              </span>
              <span className="flex-1 font-extrabold leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
