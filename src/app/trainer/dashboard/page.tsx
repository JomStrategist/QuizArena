'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { TrainerDashboard } from '@/components/trainer/TrainerDashboard';
import { LiveLobbyTrainer } from '@/components/live/LiveLobbyTrainer';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { LivePodiumFinale } from '@/components/live/LivePodiumFinale';
import { ILiveParticipant, IQuestion } from '@/types';
import { useToast } from '@/components/ui/ToastNotification';
import { Loader2 } from 'lucide-react';

export default function ProtectedTrainerDashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Live session management states
  const [viewState, setViewState] = useState<'DASHBOARD' | 'TRAINER_LOBBY' | 'GAME_PLAY' | 'PODIUM'>('DASHBOARD');
  const [activeQuizCode, setActiveQuizCode] = useState('');
  const [activeQuizTitle, setActiveQuizTitle] = useState('Python Business Analytics');

  const [questions] = useState<IQuestion[]>([
    {
      _id: 'q1',
      trainerId: 't1',
      questionText: 'What is the capital of France?',
      questionType: 'MCQ',
      options: ['London', 'Paris', 'Rome', 'Berlin'],
      correctOptionIndex: 1,
      timeLimit: 15,
      points: 1000,
      explanation: 'Paris is the capital of France.',
      category: 'Geography',
      difficulty: 'EASY',
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      _id: 'q2',
      trainerId: 't1',
      questionText: 'Which data structure follows First-In, First-Out (FIFO)?',
      questionType: 'MCQ',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      correctOptionIndex: 1,
      timeLimit: 20,
      points: 1000,
      explanation: 'Queues process elements in FIFO order.',
      category: 'Computer Science',
      difficulty: 'MEDIUM',
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
  ]);

  const [participants, setParticipants] = useState<ILiveParticipant[]>([
    { socketId: 's1', displayName: 'Rahul', score: 2840, rank: 1, previousRank: 1, correctAnswers: 2, wrongAnswers: 0, unansweredCount: 0 },
    { socketId: 's2', displayName: 'Anjali', score: 2650, rank: 2, previousRank: 2, correctAnswers: 2, wrongAnswers: 0, unansweredCount: 0 },
    { socketId: 's3', displayName: 'Arjun', score: 2320, rank: 3, previousRank: 3, correctAnswers: 1, wrongAnswers: 1, unansweredCount: 0 },
  ]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/v1/auth/me');
        const json = await res.json();
        if (!res.ok || !json.success || json.data.role !== 'TRAINER') {
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
            onStartLiveSession={(code) => {
              setActiveQuizCode(code);
              setViewState('TRAINER_LOBBY');
            }}
          />
        )}

        {viewState === 'TRAINER_LOBBY' && (
          <LiveLobbyTrainer
            quizCode={activeQuizCode}
            quizTitle={activeQuizTitle}
            participants={participants}
            onStartGame={() => setViewState('GAME_PLAY')}
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
