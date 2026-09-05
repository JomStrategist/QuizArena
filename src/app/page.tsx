'use client';

import React, { useState } from 'react';
import { BrandHeader } from '@/components/branding/BrandHeader';
import { TrainerDashboard } from '@/components/trainer/TrainerDashboard';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { LiveLobbyTrainer } from '@/components/live/LiveLobbyTrainer';
import { LiveGameStudent } from '@/components/live/LiveGameStudent';
import { LivePodiumFinale } from '@/components/live/LivePodiumFinale';
import { ILiveParticipant, IQuestion } from '@/types';
import { Shield, User, Play, Sparkles } from 'lucide-react';

export default function Home() {
  const [userRole, setUserRole] = useState<'TRAINER' | 'STUDENT'>('TRAINER');
  
  // Live Game Execution State Machine
  const [viewState, setViewState] = useState<'DASHBOARD' | 'TRAINER_LOBBY' | 'GAME_PLAY' | 'PODIUM'>('DASHBOARD');
  const [activeQuizCode, setActiveQuizCode] = useState('');
  const [activeQuizTitle, setActiveQuizTitle] = useState('Python Business Analytics');
  const [studentDisplayName, setStudentDisplayName] = useState('');

  // Sample live questions for simulation
  const [questions, setQuestions] = useState<IQuestion[]>([
    {
      _id: 'q1',
      trainerId: 't1',
      questionText: 'What is the capital of France?',
      questionType: 'MCQ',
      options: ['London', 'Paris', 'Rome', 'Berlin'],
      correctOptionIndex: 1,
      timeLimit: 15,
      points: 1000,
      explanation: 'Paris is the official capital and largest city of France.',
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
    {
      _id: 'q3',
      trainerId: 't1',
      questionText: 'What is the output of len(["Python", "QuizArena", "KVJ"]) in Python?',
      questionType: 'MCQ',
      options: ['2', '3', '4', 'Error'],
      correctOptionIndex: 1,
      timeLimit: 15,
      points: 1000,
      explanation: 'The list contains 3 string elements.',
      category: 'Python',
      difficulty: 'EASY',
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
  ]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Live participants
  const [participants, setParticipants] = useState<ILiveParticipant[]>([
    { socketId: 's1', displayName: 'Rahul', score: 2840, rank: 1, previousRank: 1, correctAnswers: 3, wrongAnswers: 0, unansweredCount: 0 },
    { socketId: 's2', displayName: 'Anjali', score: 2650, rank: 2, previousRank: 2, correctAnswers: 3, wrongAnswers: 0, unansweredCount: 0 },
    { socketId: 's3', displayName: 'Arjun', score: 2320, rank: 3, previousRank: 3, correctAnswers: 2, wrongAnswers: 1, unansweredCount: 0 },
    { socketId: 's4', displayName: 'Manu', score: 1980, rank: 4, previousRank: 4, correctAnswers: 2, wrongAnswers: 1, unansweredCount: 0 },
  ]);

  // Handler to launch Live Session from Trainer Dashboard
  const handleStartLiveSession = (quizCode: string) => {
    setActiveQuizCode(quizCode);
    setViewState('TRAINER_LOBBY');
  };

  // Handler for student joining Live Quiz
  const handleJoinLiveQuiz = (quizCode: string, displayName: string) => {
    setActiveQuizCode(quizCode);
    setStudentDisplayName(displayName);

    // Add student to live participants if not already present
    const exists = participants.some((p) => p.displayName.toLowerCase() === displayName.toLowerCase());
    if (!exists) {
      setParticipants((prev) => [
        ...prev,
        {
          socketId: Math.random().toString(),
          displayName,
          score: 0,
          rank: prev.length + 1,
          previousRank: prev.length + 1,
          correctAnswers: 0,
          wrongAnswers: 0,
          unansweredCount: 0,
        },
      ]);
    }

    setViewState('GAME_PLAY');
  };

  // Trainer starts live game
  const handleStartGame = () => {
    setCurrentQuestionIdx(0);
    setViewState('GAME_PLAY');
  };

  // Student submits answer
  const handleAnswerSubmitted = (selectedIdx: number, scoreEarned: number, responseTimeMs: number) => {
    if (studentDisplayName) {
      setParticipants((prev) => {
        const updated = prev.map((p) => {
          if (p.displayName.toLowerCase() === studentDisplayName.toLowerCase()) {
            return {
              ...p,
              score: p.score + scoreEarned,
              correctAnswers: selectedIdx === questions[currentQuestionIdx].correctOptionIndex ? p.correctAnswers + 1 : p.correctAnswers,
              wrongAnswers: selectedIdx !== questions[currentQuestionIdx].correctOptionIndex ? p.wrongAnswers + 1 : p.wrongAnswers,
            };
          }
          return p;
        });

        // Re-sort rank
        return updated.sort((a, b) => b.score - a.score).map((p, idx) => ({ ...p, rank: idx + 1 }));
      });
    }

    // Auto-advance to next question or finale after delay
    setTimeout(() => {
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
      } else {
        setViewState('PODIUM');
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* Brand Header */}
      {viewState === 'DASHBOARD' && (
        <BrandHeader subtitle="Internal Training & Assessment Platform" />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {viewState === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Role Switcher Toolbar */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">View Experience:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setUserRole('TRAINER')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    userRole === 'TRAINER'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Trainer Dashboard</span>
                </button>
                <button
                  onClick={() => setUserRole('STUDENT')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    userRole === 'STUDENT'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>
              </div>
            </div>

            {/* Render Role View */}
            {userRole === 'TRAINER' ? (
              <TrainerDashboard onStartLiveSession={handleStartLiveSession} />
            ) : (
              <StudentDashboard onJoinLiveQuiz={handleJoinLiveQuiz} />
            )}
          </div>
        )}

        {/* Live Lobby Trainer View */}
        {viewState === 'TRAINER_LOBBY' && (
          <LiveLobbyTrainer
            quizCode={activeQuizCode}
            quizTitle={activeQuizTitle}
            participants={participants}
            onStartGame={handleStartGame}
          />
        )}

        {/* Live Game Active Gameplay */}
        {viewState === 'GAME_PLAY' && (
          <LiveGameStudent
            question={questions[currentQuestionIdx]}
            questionNumber={currentQuestionIdx + 1}
            totalQuestions={questions.length}
            displayName={studentDisplayName || 'Student Player'}
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        )}

        {/* Final Podium Celebration */}
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
