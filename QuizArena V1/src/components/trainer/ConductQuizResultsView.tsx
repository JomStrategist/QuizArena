'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  Users,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Download,
  Loader2,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '../ui/ToastNotification';

interface ConductQuizResultsViewProps {
  quizCode: string;
  onClose: () => void;
}

export const ConductQuizResultsView: React.FC<ConductQuizResultsViewProps> = ({ quizCode, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<any>(null);
  const { showToast } = useToast();

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/live-sessions/results?code=${quizCode}`);
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        throw new Error(json.error?.message || 'Failed to load session report.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizCode) fetchResults();
  }, [quizCode]);

  const handleExportCSV = () => {
    if (!result || !result.rankings) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Rank,Student Name,Email,Total Score,Correct Answers,Wrong Answers,Accuracy (%)\n';

    result.rankings.forEach((r: any) => {
      const correct = r.correctAnswers || 0;
      const wrong = r.wrongAnswers || 0;
      const total = correct + wrong;
      const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
      csvContent += `${r.rank},"${r.displayName}","${r.email || ''}",${r.totalScore || 0},${correct},${wrong},${acc}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ConductQuiz_Report_${quizCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Conduct Quiz CSV Report downloaded successfully.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-blue-600 font-bold text-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Generating Conduct Quiz Report...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900">Report Not Found</h2>
          <p className="text-xs text-slate-500">Could not find results for Quiz Code: {quizCode}</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const rankings = result.rankings || [];
  const questionStats = result.questionStats || [];
  const totalParticipants = result.totalParticipants || rankings.length || 0;
  const averageScore = result.averageScore || 0;
  const highestScore = rankings.length > 0 ? rankings[0].totalScore || 0 : 0;

  let overallCorrectSum = 0;
  let overallTotalSum = 0;
  let overallAvgResponseTimeMs = 0;

  questionStats.forEach((qs: any) => {
    overallCorrectSum += qs.correctCount || 0;
    overallTotalSum += (qs.correctCount || 0) + (qs.wrongCount || 0);
    overallAvgResponseTimeMs += qs.avgResponseTimeMs || 0;
  });

  const overallAccuracy = overallTotalSum > 0 ? Math.round((overallCorrectSum / overallTotalSum) * 100) : 0;
  const overallAvgSpeedSec =
    questionStats.length > 0 ? ((overallAvgResponseTimeMs / questionStats.length) / 1000).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full font-sans">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                CONDUCT QUIZ REPORT
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">CODE: {result.quizCode}</span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 mt-0.5">{result.quizTitle}</h1>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT RESULTS (CSV)</span>
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Participants */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Trainees</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalParticipants}</p>
        </div>

        {/* Average Score */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{averageScore}</p>
        </div>

        {/* Highest Score */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Highest Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{highestScore}</p>
        </div>

        {/* Accuracy */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overallAccuracy}%</p>
        </div>

        {/* Average Speed */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Speed</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overallAvgSpeedSec}s</p>
        </div>
      </div>

      {/* Section 1: Question Performance Analytics */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <span>Question-by-Question Performance Breakdown</span>
        </h3>

        {questionStats.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 text-center">No detailed question metrics recorded.</p>
        ) : (
          <div className="space-y-3">
            {questionStats.map((qs: any, idx: number) => {
              const correct = qs.correctCount || 0;
              const wrong = qs.wrongCount || 0;
              const totalAns = correct + wrong;
              const pctCorrect = totalAns > 0 ? Math.round((correct / totalAns) * 100) : 0;
              const avgSpeed = ((qs.avgResponseTimeMs || 0) / 1000).toFixed(1);

              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black flex-shrink-0">
                        Q{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{qs.questionText}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-bold text-slate-600">
                      <span className="text-emerald-600">{pctCorrect}% Correct</span>
                      <span>Avg Speed: {avgSpeed}s</span>
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pctCorrect}%` }} />
                    <div className="bg-rose-400 h-full transition-all" style={{ width: `${100 - pctCorrect}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Complete Participant Rankings */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Full Participant Ranking List</span>
        </h3>

        {rankings.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 text-center">No participant responses recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Trainee Name</th>
                  <th className="py-3 px-4">Total Score</th>
                  <th className="py-3 px-4">Correct</th>
                  <th className="py-3 px-4">Wrong</th>
                  <th className="py-3 px-4">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((r: any, idx: number) => {
                  const correct = r.correctAnswers || 0;
                  const wrong = r.wrongAnswers || 0;
                  const total = correct + wrong;
                  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition font-semibold text-slate-800">
                      <td className="py-3.5 px-4 font-mono font-black text-blue-600">#{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.displayName}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{r.totalScore || 0} pts</td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">{correct}</td>
                      <td className="py-3.5 px-4 text-rose-500 font-bold">{wrong}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
