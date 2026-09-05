'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Search, BookOpen } from 'lucide-react';
import { IQuestion, IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface QuizCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizCreated: (quiz: IQuiz) => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({ isOpen, onClose, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Python');
  const [availableQuestions, setAvailableQuestions] = useState<IQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableQuestions();
    }
  }, [isOpen]);

  const fetchAvailableQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/questions');
      const json = await res.json();
      if (json.success) {
        setAvailableQuestions(json.data);
      }
    } catch (err) {
      showToast('Failed to fetch questions from bank', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelect = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide a quiz title.', 'warning');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      showToast('Please select at least 1 question for the quiz.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          questionIds: selectedQuestionIds,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create quiz.');
      }

      showToast(`Quiz "${title}" created successfully!`, 'success');
      onQuizCreated(json.data);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error creating quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Build New Quiz</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Quiz Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Python Business Analytics Module 1"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the assessment goals..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">
                Select Questions from Bank ({selectedQuestionIds.length} Selected)
              </label>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading questions...</div>
            ) : availableQuestions.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                No questions in Question Bank yet. Please import or create questions first.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto p-2 bg-slate-50/50 border border-slate-200 rounded-xl">
                {availableQuestions.map((q) => {
                  const isSelected = selectedQuestionIds.includes(q._id);
                  return (
                    <div
                      key={q._id}
                      onClick={() => toggleQuestionSelect(q._id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-medium'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="pr-3">
                        <p className="text-xs font-bold">{q.questionText}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {q.category} • {q.timeLimit}s • {q.points} pts
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || selectedQuestionIds.length === 0}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/20"
          >
            Save Quiz ({selectedQuestionIds.length} Questions)
          </button>
        </div>
      </form>
    </div>
  );
};
