'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, FileSpreadsheet, Eye, Trash2, Tag, Clock, Award, X } from 'lucide-react';
import { IQuestion } from '@/types';
import { useToast } from '../ui/ToastNotification';
import { ImportWizard } from './ImportWizard';

export const QuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<IQuestion | null>(null);

  // Manual Question creation form state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newCategory, setNewCategory] = useState('Python');
  const [newTimeLimit, setNewTimeLimit] = useState(20);
  const [newPoints, setNewPoints] = useState(1000);
  const [newExplanation, setNewExplanation] = useState('');

  const { showToast } = useToast();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCategory) query.append('category', selectedCategory);

      const res = await fetch(`/api/v1/questions?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
      }
    } catch (err) {
      showToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, selectedCategory]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some((o) => !o.trim())) {
      showToast('Please fill in question text and all options.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/v1/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: newQuestionText,
          options: newOptions,
          correctOptionIndex: newCorrectIndex,
          category: newCategory,
          timeLimit: newTimeLimit,
          points: newPoints,
          explanation: newExplanation,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Question created successfully!', 'success');
        setIsCreateOpen(false);
        setNewQuestionText('');
        setNewOptions(['', '', '', '']);
        fetchQuestions();
      }
    } catch (err) {
      showToast('Failed to create question', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Question Bank</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and organize reusable assessment questions</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center space-x-2 border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel/Word</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center space-x-2 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by text, topic, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            <option value="Python">Python</option>
            <option value="Power BI">Power BI</option>
            <option value="Excel">Excel</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Question Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No questions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or import questions from an Excel/Word document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <div
              key={q._id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-card-hover transition-all duration-200 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {q.category || 'General'}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{q.timeLimit}s</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{q.points} pts</span>
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900 line-clamp-2">{q.questionText}</p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border truncate ${
                        i === q.correctOptionIndex
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-black mr-1 text-slate-400">
                        {String.fromCharCode(65 + i)}:
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setPreviewQuestion(q)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Wizard Modal */}
      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchQuestions()}
      />

      {/* Question Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Question Preview ({previewQuestion.category})
              </span>
              <button onClick={() => setPreviewQuestion(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">{previewQuestion.questionText}</h3>
              <div className="space-y-2">
                {previewQuestion.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-sm font-medium ${
                      idx === previewQuestion.correctOptionIndex
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>
                      <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong>
                      {opt}
                    </span>
                    {idx === previewQuestion.correctOptionIndex && (
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {previewQuestion.explanation && (
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                  <p className="font-bold text-blue-950">Explanation:</p>
                  <p>{previewQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateQuestion}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Create New Question</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter the question statement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Answer Choices (Select Correct Radio)</label>
                <div className="space-y-2">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={newCorrectIndex === i}
                        onChange={() => setNewCorrectIndex(i)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="font-bold text-slate-500 w-4">{String.fromCharCode(65 + i)}:</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const copy = [...newOptions];
                          copy[i] = e.target.value;
                          setNewOptions(copy);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Limit (Sec)</label>
                  <input
                    type="number"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Optional Explanation</label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explanation shown after answer reveal..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
