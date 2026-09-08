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
  Bot,
  TrendingUp,
  RotateCcw,
  Shield,
  HelpCircle,
  Edit2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ISolutionChallengeData, ISolutionChallengeCapability, ISolutionChallengeWorkflowStep, ISolutionChallengeAutonomy } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface Activity3AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APPROACHES = ['Generative AI', 'AI Copilot', 'AI Agent', 'Machine Learning', 'Automation'];

export const Activity3AdminModal: React.FC<Activity3AdminModalProps> = ({ isOpen, onClose }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);

  // Form State for editing
  const [title, setTitle] = useState('');
  const [scenarioText, setScenarioText] = useState('');
  const [dept, setDept] = useState('Marketing');
  const [icon, setIcon] = useState('✨');
  const [answer, setAnswer] = useState('Generative AI');
  const [objective, setObjective] = useState('');
  const [constraints, setConstraints] = useState('');
  const [whyApproach, setWhyApproach] = useState('');
  const [why, setWhy] = useState('');

  // Sub-items
  const [capabilities, setCapabilities] = useState<ISolutionChallengeCapability[]>([]);
  const [workflow, setWorkflow] = useState<ISolutionChallengeWorkflowStep[]>([]);
  const [autonomy, setAutonomy] = useState<ISolutionChallengeAutonomy[]>([]);

  // Scoring
  const [approachMarks, setApproachMarks] = useState(20);
  const [capabilityMarks, setCapabilityMarks] = useState(25);
  const [workflowMarks, setWorkflowMarks] = useState(35);
  const [workflowSequenceBonus, setWorkflowSequenceBonus] = useState(5);
  const [humanControlMarks, setHumanControlMarks] = useState(20);

  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchChallenges();
    }
  }, [isOpen]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/trainer/activity3/challenges');
      const json = await res.json();
      if (json.success && json.data) {
        setChallenges(json.data);
        if (json.data.length > 0) {
          loadChallengeForEdit(json.data[0]);
        }
      }
    } catch (err) {
      showToast('Error loading Activity 3 challenges.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadChallengeForEdit = (ch: any) => {
    setSelectedChallenge(ch);
    const data: ISolutionChallengeData = ch.solutionChallengeData || {};
    setTitle(ch.questionText || '');
    setScenarioText(ch.options && ch.options.length > 0 ? ch.options[0] : '');
    setDept(data.dept || ch.category || 'General');
    setIcon(data.icon || '🚀');
    setAnswer(data.answer || 'Generative AI');
    setObjective(data.objective || '');
    setConstraints(data.constraints || '');
    setWhyApproach(data.whyApproach || '');
    setWhy(data.why || ch.explanation || '');

    setCapabilities(data.capabilities ? [...data.capabilities] : []);
    setWorkflow(data.workflow ? [...data.workflow] : []);
    setAutonomy(data.autonomy ? [...data.autonomy] : []);

    setApproachMarks(data.approachMarks ?? 20);
    setCapabilityMarks(data.capabilityMarks ?? 25);
    setWorkflowMarks(data.workflowMarks ?? 35);
    setWorkflowSequenceBonus(data.workflowSequenceBonus ?? 5);
    setHumanControlMarks(data.humanControlMarks ?? 20);
  };

  const handleCreateNew = () => {
    setSelectedChallenge(null);
    setTitle('New AI Solution Challenge');
    setScenarioText('Describe the business scenario here...');
    setDept('Operations');
    setIcon('🚀');
    setAnswer('AI Agent');
    setObjective('');
    setConstraints('');
    setWhyApproach('');
    setWhy('');
    setCapabilities([
      { id: `cap_new_1`, text: 'Sample Correct Capability', isCorrect: true, description: 'Explanation' },
      { id: `cap_new_2`, text: 'Sample Distractor Capability', isCorrect: false, description: 'Irrelevant' },
    ]);
    setWorkflow([
      { id: `wf_new_1`, text: 'Step 1: Initiate Process', isCorrect: true, correctOrder: 1 },
      { id: `wf_new_2`, text: 'Step 2: Complete Action', isCorrect: true, correctOrder: 2 },
      { id: `wf_new_3`, text: 'Distractor Step', isCorrect: false },
    ]);
    setAutonomy([
      { id: `auto_new_1`, title: 'Hybrid Oversight', isCorrect: true, description: 'Balanced human-AI workflow.' },
      { id: `auto_new_2`, title: 'Uncontrolled Autonomy', isCorrect: false, description: 'High risk.' },
    ]);
  };

  const handleSave = async () => {
    if (!title) {
      showToast('Challenge title is required.', 'error');
      return;
    }

    setSaving(true);

    const solutionChallengeData: ISolutionChallengeData = {
      icon,
      dept,
      answer: answer as any,
      objective,
      constraints,
      whyApproach,
      why,
      capabilities,
      workflow,
      autonomy,
      approachMarks,
      capabilityMarks,
      workflowMarks,
      workflowSequenceBonus,
      humanControlMarks,
    };

    const payload = {
      id: selectedChallenge?._id,
      questionText: title,
      scenarioText,
      explanation: why,
      category: dept,
      topic: title,
      difficulty: 'MEDIUM',
      solutionChallengeData,
    };

    try {
      const url = '/api/v1/trainer/activity3/challenges';
      const method = selectedChallenge?._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`Challenge saved successfully!`, 'success');
        await fetchChallenges();
      } else {
        showToast(json.error?.message || 'Failed to save challenge.', 'error');
      }
    } catch (err) {
      showToast('Error saving challenge.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ch: any) => {
    if (!confirm(`Delete challenge "${ch.questionText}"?`)) return;
    try {
      const res = await fetch(`/api/v1/trainer/activity3/challenges?id=${ch._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Challenge deleted.', 'info');
        fetchChallenges();
      }
    } catch (err) {
      showToast('Error deleting challenge.', 'error');
    }
  };

  // Helper manipulators
  const addCapability = () => {
    const newId = `cap_${Date.now()}`;
    setCapabilities([...capabilities, { id: newId, text: 'New Capability', isCorrect: true }]);
  };

  const addWorkflowStep = () => {
    const newId = `wf_${Date.now()}`;
    const nextOrder = workflow.filter((w) => w.isCorrect).length + 1;
    setWorkflow([...workflow, { id: newId, text: 'New Workflow Step', isCorrect: true, correctOrder: nextOrder }]);
  };

  const addAutonomyOption = () => {
    const newId = `auto_${Date.now()}`;
    setAutonomy([...autonomy, { id: newId, title: 'New Control Option', isCorrect: false, description: 'Description' }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Activity 3: Business Challenge Manager</h2>
              <p className="text-xs text-slate-400">Dynamically edit challenges, options, workflows, and scoring backend rules</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Challenge</span>
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
          {/* Left Challenge List Sidebar */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/60 p-4 border-r border-slate-200 dark:border-slate-800 overflow-y-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2">Active Challenges ({challenges.length})</span>
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading challenges...</div>
            ) : (
              challenges.map((ch) => {
                const isSel = selectedChallenge?._id === ch._id;
                const d = ch.solutionChallengeData || {};
                return (
                  <div
                    key={ch._id}
                    onClick={() => loadChallengeForEdit(ch)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between space-x-2 ${
                      isSel
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <span className="text-xl shrink-0">{d.icon || '🚀'}</span>
                      <div className="truncate">
                        <h4 className="font-bold text-xs truncate">{ch.questionText}</h4>
                        <span className={`text-[10px] ${isSel ? 'text-blue-200' : 'text-slate-400'}`}>{d.answer || 'Approach'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ch);
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

          {/* Right Challenge Detail Form */}
          <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedChallenge ? `Edit: ${selectedChallenge.questionText}` : 'Create New Challenge'}
              </h3>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center space-x-2 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Challenge Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                <input
                  type="text"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Correct AI Approach</label>
                <select
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  {APPROACHES.map((app) => (
                    <option key={app} value={app}>
                      {app}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Icon Emoji</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business Scenario Text</label>
              <textarea
                rows={3}
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Why this is the best solution (Rationale)</label>
              <textarea
                rows={3}
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Capabilities Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Capabilities ({capabilities.length})
                </h4>
                <button
                  type="button"
                  onClick={addCapability}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition"
                >
                  ＋ Add Capability
                </button>
              </div>

              <div className="space-y-2">
                {capabilities.map((cap, idx) => (
                  <div key={cap.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl flex items-center space-x-3 text-xs">
                    <input
                      type="checkbox"
                      checked={cap.isCorrect}
                      onChange={(e) => {
                        const updated = [...capabilities];
                        updated[idx].isCorrect = e.target.checked;
                        setCapabilities(updated);
                      }}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <input
                      type="text"
                      value={cap.text}
                      onChange={(e) => {
                        const updated = [...capabilities];
                        updated[idx].text = e.target.value;
                        setCapabilities(updated);
                      }}
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setCapabilities(capabilities.filter((_, i) => i !== idx))}
                      className="text-rose-400 p-1 hover:bg-rose-500/20 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Step Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Workflow Steps ({workflow.length})
                </h4>
                <button
                  type="button"
                  onClick={addWorkflowStep}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-bold transition"
                >
                  ＋ Add Workflow Step
                </button>
              </div>

              <div className="space-y-2">
                {workflow.map((wf, idx) => (
                  <div key={wf.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl flex items-center space-x-3 text-xs">
                    <input
                      type="checkbox"
                      checked={wf.isCorrect}
                      onChange={(e) => {
                        const updated = [...workflow];
                        updated[idx].isCorrect = e.target.checked;
                        setWorkflow(updated);
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    {wf.isCorrect && (
                      <input
                        type="number"
                        title="Correct Sequence Order (1..N)"
                        value={wf.correctOrder || ''}
                        onChange={(e) => {
                          const updated = [...workflow];
                          updated[idx].correctOrder = parseInt(e.target.value) || 1;
                          setWorkflow(updated);
                        }}
                        className="w-12 p-2 bg-white dark:bg-slate-900 border rounded-lg font-mono font-bold text-center text-slate-900 dark:text-white"
                      />
                    )}
                    <input
                      type="text"
                      value={wf.text}
                      onChange={(e) => {
                        const updated = [...workflow];
                        updated[idx].text = e.target.value;
                        setWorkflow(updated);
                      }}
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border rounded-lg font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setWorkflow(workflow.filter((_, i) => i !== idx))}
                      className="text-rose-400 p-1 hover:bg-rose-500/20 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
