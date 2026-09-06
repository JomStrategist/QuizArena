'use client';

import React, { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { IAssignment } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface StudentDashboardProps {
  onJoinLiveQuiz: (quizCode: string, displayName: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onJoinLiveQuiz }) => {
  const [quizCodeInput, setQuizCodeInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState('student1@example.com');

  const { showToast } = useToast();

  const fetchStudentAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/assignments?email=${encodeURIComponent(studentEmail)}`);
      const json = await res.json();
      if (json.success) {
        setAssignments(json.data);
      }
    } catch (err) {
      showToast('Error loading assigned quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAssignments();
  }, [studentEmail]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCodeInput.trim() || quizCodeInput.trim().length !== 6) {
      showToast('Please enter a valid 6-digit Quiz Code (e.g. 482915)', 'warning');
      return;
    }
    if (!displayNameInput.trim()) {
      showToast('Please enter your name to join.', 'warning');
      return;
    }

    onJoinLiveQuiz(quizCodeInput.trim(), displayNameInput.trim());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* JOIN LIVE QUIZ HERO BOX */}
      <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-6 md:p-8 rounded-3xl text-slate-950 shadow-xl space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 animate-spin" />
          <h2 className="text-2xl font-black tracking-tight">JOIN LIVE QUIZ</h2>
        </div>

        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="Enter your name..."
                className="w-full p-3 bg-white/95 border border-amber-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                6-Digit Quiz Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={quizCodeInput}
                onChange={(e) => setQuizCodeInput(e.target.value)}
                placeholder="e.g. 482915"
                className="w-full p-3 bg-white/95 border border-amber-200 rounded-2xl text-center text-lg font-black tracking-widest text-slate-900 placeholder:text-slate-400 shadow-inner uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-base rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg shadow-slate-950/20 active:scale-[0.99]"
          >
            <Play className="w-5 h-5 fill-current text-amber-400" />
            <span>JOIN LIVE GAME</span>
          </button>
        </form>
      </div>

      {/* MY ASSIGNMENTS SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">My Assignments</h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Identity:</span>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No pending quiz assignments found for <span className="font-semibold">{studentEmail}</span>.
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div
                key={a._id}
                className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 rounded-2xl transition flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-900">{a.title}</span>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Due:{' '}
                        {(() => {
                          if (!a.dueDate) return 'No due date';
                          try {
                            const d = new Date(a.dueDate);
                            return isNaN(d.getTime()) ? 'No due date' : d.toLocaleDateString();
                          } catch (e) {
                            return 'No due date';
                          }
                        })()}
                      </span>
                    </span>
                    <span>• {a.quizSnapshot?.questions?.length || 0} Questions</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast(`Starting assignment "${a.title}"`, 'info')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
