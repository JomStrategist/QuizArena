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
  Radio,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';

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
  const [timeLeft, setTimeLeft] = useState<number>(30);
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
        const qTime = json.data.session.questionTime || 30;
        const sTime = json.data.serverTime || Date.now();

        if (qStart && json.data.session.stage === 'QUESTION_ACTIVE') {
          const elapsed = Math.floor((sTime - qStart) / 1000);
          const remaining = Math.max(0, qTime - elapsed);
          setTimeLeft(remaining);
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

  const handleCloseClick = async () => {
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

  const totalQuestions = sessionData?.totalQuestions || 1;
  const currentIdx = (sessionData?.currentQuestionIndex || 0) + 1;
  const stage = sessionData?.stage || 'QUESTION_ACTIVE';
  const progressPercent = Math.min(100, Math.round((currentIdx / totalQuestions) * 100));

  const totalAns = liveStats.answeredCount || 0;
  const correctPct = totalAns > 0 ? Math.round((liveStats.correctCount / totalAns) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full">
                CONDUCT QUIZ SESSION
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">CODE: {quizCode}</span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 leading-tight mt-0.5">{quizTitle}</h1>
          </div>
        </div>

        <button
          onClick={handleCloseClick}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-rose-600/20 flex items-center space-x-2"
        >
          <StopCircle className="w-4 h-4" />
          <span>CLOSE QUIZ</span>
        </button>
      </div>

      {/* Main Grid: Control Stats & Live Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Progress & Current Question (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Header & Live Countdown Timer Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>
                  QUESTION {currentIdx} OF {totalQuestions}
                </span>
              </div>
              <span className="text-xs font-black text-blue-600">{progressPercent}% Completed</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Countdown Timer Display */}
            <div
              className={`p-6 rounded-2xl border text-center transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500'
              }`}
            >
              <p className="text-xs font-extrabold uppercase tracking-widest opacity-80">Time Remaining</p>
              <div className="flex items-center justify-center space-x-3 mt-1">
                <Clock className="w-8 h-8" />
                <span className="text-4xl md:text-5xl font-black font-mono tracking-tight">{timeLeft}s</span>
              </div>
            </div>

            {/* Auto Progression Info Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center space-x-2 text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="font-semibold leading-tight">
                Automatic Progression: Questions advance automatically when the timer reaches 00.
              </p>
            </div>
          </div>

          {/* Current Question Content Box */}
          {currentQuestion && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Question</h3>
              <p className="text-base md:text-lg font-black text-slate-900 leading-snug">
                {currentQuestion.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options?.map((opt: string, i: number) => {
                  const isCorrectChoice = i === currentQuestion.correctOptionIndex;
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center space-x-3 ${
                        isCorrectChoice
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          isCorrectChoice ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {letters[i]}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Statistics Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Metrics Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Live Response Monitor</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Joined */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-500">Students Joined</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{liveStats.totalParticipants}</p>
              </div>

              {/* Answered */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-[11px] font-bold text-blue-700">Answered</p>
                <p className="text-2xl font-black text-blue-800 mt-1">{liveStats.answeredCount}</p>
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
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Response Breakdown Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Answer Accuracy</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Correct Rate</span>
                <span className="text-emerald-600">{correctPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${correctPct}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${100 - correctPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
