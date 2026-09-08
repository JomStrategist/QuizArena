'use client';

import React, { useState } from 'react';
import { X, Send, Mail, Calendar, Hash } from 'lucide-react';
import { IQuiz } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface AssignQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizzes: IQuiz[];
  onAssignmentCreated: () => void;
}

export const AssignQuizModal: React.FC<AssignQuizModalProps> = ({
  isOpen,
  onClose,
  quizzes,
  onAssignmentCreated,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes?.[0]?._id || '');
  const [emailsText, setEmailsText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      showToast('Please select a quiz to assign.', 'warning');
      return;
    }
    if (!emailsText.trim()) {
      showToast('Please enter at least one student email address.', 'warning');
      return;
    }
    if (!dueDate) {
      showToast('Please set a valid due date.', 'warning');
      return;
    }

    // Split emails by newline or comma
    const rawEmails = emailsText.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
    
    // Basic email validation regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = rawEmails.filter((e) => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
      showToast(`Invalid email address format found: ${invalidEmails[0]}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuizId,
          studentEmails: rawEmails,
          dueDate,
          maxAttempts,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create assignment.');
      }

      showToast(`Quiz assigned to ${rawEmails.length} student(s) successfully!`, 'success');
      onAssignmentCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Assignment creation error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-2xl cursor-default"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Assign Quiz to Students</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Quiz</label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
            >
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.questions?.length || 0} Questions)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Student Email Addresses (Comma or Line Separated)
            </label>
            <textarea
              required
              rows={4}
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder="student1@example.com&#10;student2@example.com"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Attempts</label>
              <input
                type="number"
                min={1}
                max={5}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
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
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Confirm & Dispatch Assignment</span>
          </button>
        </div>
      </form>
    </div>
  );
};
