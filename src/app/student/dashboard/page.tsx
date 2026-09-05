'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { LivePodiumFinale } from '@/components/live/LivePodiumFinale';
import { ILiveParticipant, IQuestion } from '@/types';
import { useToast } from '@/components/ui/ToastNotification';
import { Loader2 } from 'lucide-react';

export default function ProtectedStudentDashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const [viewState, setViewState] = useState<'DASHBOARD' | 'GAME_PLAY' | 'PODIUM'>('DASHBOARD');
  const [activeQuizCode, setActiveQuizCode] = useState('');

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
  ]);

  const [participants] = useState<ILiveParticipant[]>([
    { socketId: 's1', displayName: 'Rahul', score: 2840, rank: 1, previousRank: 1, correctAnswers: 2, wrongAnswers: 0, unansweredCount: 0 },
    { socketId: 's2', displayName: 'Anjali', score: 2650, rank: 2, previousRank: 2, correctAnswers: 2, wrongAnswers: 0, unansweredCount: 0 },
  ]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/v1/auth/me');
        const json = await res.json();
        if (!res.ok || !json.success) {
          showToast('Student authentication required.', 'error');
          router.push('/auth/student');
          return;
        }
        setUser(json.data);
      } catch (err) {
        router.push('/auth/student');
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
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span>Verifying Student Portal Access...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <BrandHeader
        subtitle="Student Portal"
        user={user}
        onLogout={() => router.push('/')}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {viewState === 'DASHBOARD' && (
          <StudentDashboard
            onJoinLiveQuiz={(code, name) => {
              setActiveQuizCode(code);
              setViewState('GAME_PLAY');
            }}
          />
        )}

        {viewState === 'GAME_PLAY' && (
          <LiveGameStudent
            question={questions[0]}
            questionNumber={1}
            totalQuestions={1}
            displayName={user.name}
            onAnswerSubmitted={() => {
              setTimeout(() => setViewState('PODIUM'), 2000);
            }}
          />
        )}

        {viewState === 'PODIUM' && (
          <LivePodiumFinale
            quizTitle="Live Quiz Session"
            rankings={participants}
            onBackToDashboard={() => setViewState('DASHBOARD')}
          />
        )}
      </main>
    </div>
  );
}
