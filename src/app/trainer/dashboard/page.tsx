'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { TrainerDashboard } from '@/components/trainer/TrainerDashboard';
import { LiveLobbyTrainer } from '@/components/live/LiveLobbyTrainer';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { LivePodiumFinale } from '@/components/live/LivePodiumFinale';
import { ConductQuizTrainerControl } from '@/components/live/ConductQuizTrainerControl';
import { ILiveParticipant, IQuestion } from '@/types';
import { useToast } from '@/components/ui/ToastNotification';
import { Loader2 } from 'lucide-react';

export default function ProtectedTrainerDashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Session management states
  const [viewState, setViewState] = useState<
    'DASHBOARD' | 'LIVE_LOBBY' | 'CONDUCT_LOBBY' | 'CONDUCT_RUNNING' | 'GAME_PLAY' | 'PODIUM'
  >('DASHBOARD');
  const [activeQuizCode, setActiveQuizCode] = useState('');
  const [activeQuizTitle, setActiveQuizTitle] = useState('');
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [participants, setParticipants] = useState<ILiveParticipant[]>([]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/v1/auth/me');
        const json = await res.json();
        if (!res.ok || !json.success || (json.data.role !== 'TRAINER' && json.data.role !== 'ADMIN')) {
          showToast('Trainer authentication required.', 'error');
          router.push('/auth/trainer');
          return;
        }
        setUser(json.data);
      } catch (err) {
        router.push('/auth/trainer');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Polling participant list during lobby
  useEffect(() => {
    if ((viewState === 'LIVE_LOBBY' || viewState === 'CONDUCT_LOBBY') && activeQuizCode) {
      const fetchLobby = async () => {
        try {
          const res = await fetch(`/api/v1/live-sessions/sync?code=${activeQuizCode}&role=trainer`);
          const json = await res.json();
          if (json.success && json.data) {
            setParticipants(json.data.rankings || []);
          }
        } catch (err) {
          console.error('Lobby sync error:', err);
        }
      };

      fetchLobby();
      const timer = setInterval(fetchLobby, 1500);
      return () => clearInterval(timer);
    }
  }, [viewState, activeQuizCode]);

  const handleStartConductQuizSession = async () => {
    try {
      const res = await fetch('/api/v1/live-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizCode: activeQuizCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to start Conduct Quiz session.');
      }
      showToast('Conduct Quiz session started!', 'success');
      setViewState('CONDUCT_RUNNING');
    } catch (err: any) {
      showToast(err.message || 'Error starting session', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500 font-bold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Verifying Trainer Authorization...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <BrandHeader
        subtitle="Trainer Dashboard"
        user={user}
        onLogout={() => router.push('/')}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {viewState === 'DASHBOARD' && (
          <TrainerDashboard
            onStartLiveSession={(code, title, liveQuestions) => {
              setActiveQuizCode(code);
              setActiveQuizTitle(title);
              if (liveQuestions && liveQuestions.length > 0) {
                setQuestions(liveQuestions);
              }
              setViewState('LIVE_LOBBY');
            }}
            onStartConductQuiz={(code, title, time, snapshot) => {
              setActiveQuizCode(code);
              setActiveQuizTitle(title);
              if (snapshot?.questions && snapshot.questions.length > 0) {
                setQuestions(snapshot.questions);
              }
              setViewState('CONDUCT_LOBBY');
            }}
          />
        )}

        {viewState === 'LIVE_LOBBY' && (
          <LiveLobbyTrainer
            quizCode={activeQuizCode}
            quizTitle={activeQuizTitle}
            participants={participants}
            onStartGame={handleStartConductQuizSession}
          />
        )}

        {viewState === 'CONDUCT_LOBBY' && (
          <LiveLobbyTrainer
            quizCode={activeQuizCode}
            quizTitle={activeQuizTitle}
            participants={participants}
            onStartGame={handleStartConductQuizSession}
          />
        )}

        {viewState === 'CONDUCT_RUNNING' && (
          <ConductQuizTrainerControl
            quizCode={activeQuizCode}
            quizTitle={activeQuizTitle}
            onCloseSession={() => setViewState('DASHBOARD')}
          />
        )}

        {viewState === 'GAME_PLAY' && (
          <LiveGameStudent
            question={questions[0]}
            questionNumber={1}
            totalQuestions={questions.length}
            displayName={user.name}
            onAnswerSubmitted={() => {
              setTimeout(() => setViewState('PODIUM'), 2000);
            }}
          />
        )}

        {viewState === 'PODIUM' && (
          <LivePodiumFinale
            quizTitle={activeQuizTitle}
            rankings={participants}
            onBackToDashboard={() => setViewState('DASHBOARD')}
          />
        )}
      </main>
    </div>
  );
}
