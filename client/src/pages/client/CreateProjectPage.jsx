import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import {
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const CreateProjectPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('3500');
  const [durationWeeks, setDurationWeeks] = useState('4');
  const [categoryId, setCategoryId] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');
  const [categories, setCategories] = useState([]);

  // AI Milestone state
  const [milestones, setMilestones] = useState([]);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await projectApi.getCategories();
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setCategoryId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // AI Milestone Generation trigger
  const handleGenerateAiMilestones = async () => {
    if (!description.trim()) {
      setError('Please provide a project description first for the AI to scope.');
      return;
    }
    setError('');
    setAnalyzingAi(true);

    try {
      const res = await projectApi.generateAiMilestones({
        title: title || 'Full Application Project',
        description,
        budget: Number(budget) || 2000,
        durationWeeks: Number(durationWeeks) || 4,
      });

      if (res.data?.milestones) {
        setMilestones(
          res.data.milestones.map((m, idx) => ({
            order: idx + 1,
            title: m.title,
            description: m.description,
            amount: m.amount,
            acceptanceCriteria: m.acceptanceCriteria || '',
          }))
        );
      }
    } catch (err) {
      setError(err.message || 'AI milestone generation failed.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleAddManualMilestone = () => {
    setMilestones([
      ...milestones,
      {
        order: milestones.length + 1,
        title: `Milestone ${milestones.length + 1}`,
        description: 'Detailed deliverable requirements...',
        amount: Math.round(Number(budget) / (milestones.length + 1) || 500),
        acceptanceCriteria: 'Functional testing and review approval',
      },
    ]);
  };

  const handleUpdateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        budget: Number(budget),
        categoryId,
        experienceLevel,
        milestones: milestones.map((m, idx) => ({
          title: m.title,
          description: m.description,
          amount: Number(m.amount),
          acceptanceCriteria: m.acceptanceCriteria,
          order: idx + 1,
        })),
      };

      const res = await projectApi.createProject(payload);
      navigate('/client/projects');
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalMilestonesAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Project Architect</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create & Scope New Project
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Provide your core project vision, then let our intelligent scoping engine draft verifiable milestones and budget allocations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Core Details */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>1. Core Project Specifications</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Project Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Medical Appointment Booking Platform"
                className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Target Budget ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert / Principal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Detailed Requirements & Scope of Work
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product requirements, user roles, integrations, desired frontend/backend stack, and core goals..."
                className="w-full p-4 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* AI Milestone Generator Block */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-6 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>2. AI Milestone Architecture</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Decompose your scope into phase-based milestones with acceptance tests and escrow shares.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiMilestones}
              disabled={analyzingAi}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {analyzingAi ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Analyzing Scope...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Generate with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Milestone List */}
          {milestones.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>{milestones.length} Milestones Configured</span>
                <span className={totalMilestonesAmount > Number(budget) ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  Total: ${totalMilestonesAmount.toLocaleString()} / Target: ${Number(budget).toLocaleString()}
                </span>
              </div>

              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                      placeholder="Milestone Title"
                      className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        value={m.amount}
                        onChange={(e) => handleUpdateMilestone(idx, 'amount', e.target.value)}
                        className="w-24 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={m.description}
                    onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                    placeholder="Deliverable Description"
                    className="w-full px-3 py-1.5 bg-gray-800/80 border border-gray-700/60 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
                  />

                  <input
                    type="text"
                    value={m.acceptanceCriteria}
                    onChange={(e) => handleUpdateMilestone(idx, 'acceptanceCriteria', e.target.value)}
                    placeholder="Acceptance Criteria (e.g. Pass all unit tests, Figma fidelity)"
                    className="w-full px-3 py-1.5 bg-gray-800/80 border border-gray-700/60 rounded-lg text-xs text-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddManualMilestone}
                className="w-full py-2.5 rounded-xl border border-dashed border-gray-700 hover:border-indigo-500 text-xs font-semibold text-gray-400 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone Manually</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/client/projects')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Publish Project to Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
