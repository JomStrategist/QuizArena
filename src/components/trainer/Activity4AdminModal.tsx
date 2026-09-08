'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  ListOrdered,
  RotateCcw,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ISequenceItem } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface Activity4AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Activity4AdminModal: React.FC<Activity4AdminModalProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [scenarioText, setScenarioText] = useState('');
  const [instruction, setInstruction] = useState('');
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('Sequence Challenge');
  const [points, setPoints] = useState(1000);
  const [timeLimit, setTimeLimit] = useState(30);

  const [items, setItems] = useState<ISequenceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/trainer/activity4/challenges');
      const json = await res.json();
      if (json.success && json.data) {
        setQuestions(json.data);
        if (json.data.length > 0) {
          loadQuestionForEdit(json.data[0]);
        }
      }
    } catch (err) {
      showToast('Error loading Activity 4 sequence challenges.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionForEdit = (q: any) => {
    setSelectedQuestion(q);
    const seqData = q.sequenceData || {};
    setQuestionText(q.questionText || '');
    setScenarioText(seqData.scenarioText || q.explanation || '');
    setInstruction(seqData.instruction || 'Arrange the steps in the correct order.');
    setExplanation(q.explanation || seqData.feedback || '');
    setCategory(q.category || 'Sequence Challenge');
    setPoints(q.points || 1000);
    setTimeLimit(q.timeLimit || 30);

    let rawItems: ISequenceItem[] = seqData.items || [];
    if (!rawItems || rawItems.length === 0) {
      const opts: string[] = q.options || [];
      rawItems = opts.map((optText: string, idx: number) => ({
        id: `seq_${q._id}_${idx + 1}`,
        text: optText,
        correctPosition: idx + 1,
      }));
    }

    // Sort items by correct position in admin editor
    const sorted = [...rawItems].sort((a, b) => a.correctPosition - b.correctPosition);
    setItems(sorted);
  };

  const handleCreateNew = () => {
    setSelectedQuestion(null);
    setQuestionText('New Sequence Exercise');
    setScenarioText('Describe the scenario requiring logical ordering...');
    setInstruction('Arrange the steps in the correct logical execution order.');
    setExplanation('');
    setCategory('Sequence Challenge');
    setPoints(1000);
    setTimeLimit(30);

    setItems([
      { id: `seq_${Date.now()}_1`, text: 'First Step: Initiate Process', correctPosition: 1 },
      { id: `seq_${Date.now()}_2`, text: 'Second Step: Perform Validation', correctPosition: 2 },
      { id: `seq_${Date.now()}_3`, text: 'Third Step: Complete Output', correctPosition: 3 },
    ]);
  };

  const handleSave = async () => {
    if (!questionText) {
      showToast('Exercise title is required.', 'error');
      return;
    }
    if (items.length < 2) {
      showToast('At least 2 sequence items are required.', 'error');
      return;
    }

    setSaving(true);

    // Update correctPosition according to current list order in admin UI
    const updatedItems = items.map((it, idx) => ({
      ...it,
      correctPosition: idx + 1,
    }));

    const correctSequenceIds = updatedItems.map((it) => it.id);

    const payload = {
      id: selectedQuestion?._id,
      questionText,
      scenarioTitle: questionText,
      scenarioText,
      instruction,
      explanation,
      category,
      points,
      timeLimit,
      sequenceData: {
        scenarioTitle: questionText,
        scenarioText,
        instruction,
        items: updatedItems,
        correctSequenceIds,
        feedback: explanation,
      },
    };

    try {
      const url = '/api/v1/trainer/activity4/challenges';
      const method = selectedQuestion?._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Sequence challenge saved successfully!', 'success');
        await fetchQuestions();
      } else {
        showToast(json.error?.message || 'Failed to save sequence challenge.', 'error');
      }
    } catch (err) {
      showToast('Error saving sequence challenge.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: any) => {
    if (!confirm(`Delete sequence exercise "${q.questionText}"?`)) return;
    try {
      const res = await fetch(`/api/v1/trainer/activity4/challenges?id=${q._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Sequence exercise deleted.', 'info');
        fetchQuestions();
      }
    } catch (err) {
      showToast('Error deleting sequence exercise.', 'error');
    }
  };

  // Move items in Admin Editor to set correct sequence
  const moveItem = (fromIdx: number, delta: number) => {
    const toIdx = fromIdx + delta;
    if (toIdx < 0 || toIdx >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setItems(updated);
  };

  const addItem = () => {
    const newId = `seq_${Date.now()}`;
    setItems([...items, { id: newId, text: `New Sequence Step ${items.length + 1}`, correctPosition: items.length + 1 }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Activity 4: Sequence / Ordering Manager</h2>
              <p className="text-xs text-slate-400">Manage sequence challenges, reorder correct sequence items, and update explanations</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Exercise</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Sequence Question List Sidebar */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/60 p-4 border-r border-slate-200 dark:border-slate-800 overflow-y-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2">
              Sequence Exercises ({questions.length})
            </span>
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading sequence exercises...</div>
            ) : (
              questions.map((q) => {
                const isSel = selectedQuestion?._id === q._id;
                return (
                  <div
                    key={q._id}
                    onClick={() => loadQuestionForEdit(q)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between space-x-2 ${
                      isSel
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <ListOrdered className="w-4 h-4 shrink-0 text-purple-400" />
                      <div className="truncate">
                        <h4 className="font-bold text-xs truncate">{q.questionText}</h4>
                        <span className={`text-[10px] ${isSel ? 'text-purple-200' : 'text-slate-400'}`}>
                          {q.options?.length || 0} steps
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(q);
                      }}
                      className={`p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition ${isSel ? 'text-white' : ''}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sequence Question Detail Form */}
          <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedQuestion ? `Edit: ${selectedQuestion.questionText}` : 'Create New Sequence Exercise'}
              </h3>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center space-x-2 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Sequence'}</span>
              </button>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exercise Title</label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Scenario Description</label>
              <textarea
                rows={2}
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Learner Instruction</label>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Correct Sequence Reordering Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Correct Sequence Order ({items.length} Steps)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Arrange the items in the EXACT correct order (1 to {items.length}). The learner will see them shuffled.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-xs font-bold transition"
                >
                  ＋ Add Step
                </button>
              </div>

              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={it.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl flex items-center space-x-3 text-xs">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={it.text}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].text = e.target.value;
                        setItems(updated);
                      }}
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold text-slate-900 dark:text-white"
                    />

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-purple-600 hover:text-white disabled:opacity-30"
                        title="Move Step Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-purple-600 hover:text-white disabled:opacity-30"
                        title="Move Step Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="text-rose-400 p-1 hover:bg-rose-500/20 rounded ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Explanation & Rationale Feedback</label>
              <textarea
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
