'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandHeader } from '@/components/branding/BrandHeader';
import {
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  GraduationCap,
  BookOpen,
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Hash,
  Play,
  ListChecks,
  LogIn,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastNotification';

export default function PublicLandingPage() {
  // Trainer Login State
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [trainerLoading, setTrainerLoading] = useState(false);

  // Student Quick Join State
  const [studentName, setStudentName] = useState('');
  const [quizCode, setQuizCode] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  // Handle Trainer Direct Login
  const handleTrainerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerEmail.trim()) {
      showToast('Please enter your trainer email address.', 'warning');
      return;
    }

    setTrainerLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trainerEmail.trim(),
          password: trainerPassword.trim(),
          role: 'TRAINER',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Authentication failed.');
      }

      showToast(`Welcome back, ${json.data.user.name}!`, 'success');
      window.location.href = '/trainer/dashboard';
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setTrainerLoading(false);
    }
  };

  // Handle Student Live Session Join
  const handleStudentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast('Please enter your name to join.', 'warning');
      return;
    }
    if (!quizCode.trim() || quizCode.trim().length !== 6) {
      showToast('Please enter a valid 6-digit Quiz Code (e.g. 482915).', 'warning');
      return;
    }

    setStudentLoading(true);
    showToast(`Joining Live Quiz Session #${quizCode}...`, 'info');
    router.push(`/quiz/join?code=${quizCode.trim()}&name=${encodeURIComponent(studentName.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <BrandHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ================= LEFT COLUMN: HERO & FEATURES & ILLUSTRATION (6 cols) ================= */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 bg-white/60 p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Learn. Play. <span className="text-blue-600">Compete.</span> Grow.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                QuizArena is an internal training and assessment platform for <strong className="text-slate-900 font-bold">KVJ Analytics</strong> designed to make learning engaging, interactive, and impactful.
              </p>
            </div>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {/* Feature 1 */}
              <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/70 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Create & Manage Quizzes</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">Build engaging content with ease</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/70 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Assign & Assess</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">Assign quizzes & track progress</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/70 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Live Game Mode</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">Real-time games for ~200 students</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/70 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Analytics & Reports</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">Gain insights & measure outcomes</p>
                </div>
              </div>
            </div>

            {/* Illustration with Callout Overlays */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md group mt-2">
              <img
                src="/classroom_trainer_illustration.jpg"
                alt="QuizArena Classroom Presentation"
                className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              
              {/* Overlay Callout Left */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-black italic bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Knowledge Builds Brighter Futures
                </span>
              </div>

              {/* Overlay Callout Right */}
              <div className="absolute top-3 right-3 bg-blue-600/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/80 shadow-sm">
                <span className="text-[11px] font-bold">
                  Same Classroom, Bigger Possibilities
                </span>
              </div>
            </div>
          </div>

          {/* ================= CENTER COLUMN: TRAINER LOGIN CARD (3 cols) ================= */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Header Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
                  <img
                    src="/QuizArena Icon.png"
                    alt="QuizArena Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Trainer Login</h2>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Create, manage and deliver amazing learning experiences
                  </p>
                </div>
              </div>

              {/* Trainer Login Form */}
              <form onSubmit={handleTrainerLogin} className="space-y-3 pt-1">
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={trainerEmail}
                      onChange={(e) => setTrainerEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={trainerPassword}
                      onChange={(e) => setTrainerPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trainerLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5"
                >
                  {trainerLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login as Trainer</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Contact Admin Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">New Trainer?</p>
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-2.5 flex items-center space-x-2 text-blue-800">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px]">
                  <p className="font-bold leading-tight">Contact Administrator</p>
                  <p className="text-[10px] text-blue-600 font-medium">for access credentials</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STUDENT ACCESS CARD (3 cols) ================= */}
          <div className="lg:col-span-3 bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-amber-100/40 rounded-3xl border border-amber-200/80 shadow-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Header Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-orange-100/80 text-orange-600 flex items-center justify-center mx-auto border border-orange-200 shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Access</h2>
                  <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                    Join assignments and live quizzes to test your knowledge
                  </p>
                </div>
              </div>

              {/* Student Join Form */}
              <form onSubmit={handleStudentJoin} className="space-y-3 pt-1">
                <div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 pl-1">
                    Use your full name (as per registration)
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={quizCode}
                      onChange={(e) => setQuizCode(e.target.value)}
                      placeholder="Enter 6-digit Quiz Code"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 pl-1">
                    Example: 482915
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={studentLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl transition shadow-md shadow-orange-500/20 flex items-center justify-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Join Live Quiz</span>
                </button>
              </form>
            </div>

            {/* Go to Student Dashboard Button */}
            <div className="pt-3 border-t border-amber-200/60 text-center space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">OR</span>
              <button
                type="button"
                onClick={() => router.push('/auth/student')}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-amber-200/90 font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center space-x-2"
              >
                <ListChecks className="w-4 h-4 text-amber-600" />
                <div className="text-left leading-tight">
                  <p className="text-xs font-black text-slate-900">Go to Student Dashboard</p>
                  <p className="text-[10px] text-slate-500 font-medium">View your assignments & results</p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ================= BOTTOM FOOTER BANNER (No KVJ Analytics logo on bottom right per request) ================= */}
      <footer className="w-full bg-white border-t border-slate-200 py-3.5 px-4 sm:px-8 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          
          {/* Left Stylized Typography */}
          <div className="flex items-center space-x-1 text-slate-500">
            <span className="font-extrabold italic bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Powered by People. Driven by Knowledge.
            </span>
          </div>

          {/* Middle 4 Feature Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-[11px]">
            {/* Feature 1 */}
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Secure & Reliable</p>
                <p className="text-[10px] text-slate-500">Your data is safe with us</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Real-Time Experience</p>
                <p className="text-[10px] text-slate-500">Engage, Compete, Learn</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">For Up to 200 Students</p>
                <p className="text-[10px] text-slate-500">Built for classrooms</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Insights & Analytics</p>
                <p className="text-[10px] text-slate-500">Track progress & performance</p>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
