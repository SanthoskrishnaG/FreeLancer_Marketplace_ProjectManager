import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import {
  generateAIMilestonesApi,
  saveBatchMilestonesApi,
  AIGeneratedMilestone,
} from '../api/project.api.js';

interface AIMilestoneModalProps {
  projectId: string;
  projectTitle: string;
  projectBudget: number;
  existingRequirements?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMilestonesSaved: () => void;
}

export const AIMilestoneGeneratorModal: React.FC<AIMilestoneModalProps> = ({
  projectId,
  projectTitle,
  projectBudget,
  existingRequirements,
  isOpen,
  onClose,
  onMilestonesSaved,
}) => {
  const [step, setStep] = useState<'prompt' | 'loading' | 'review'>('prompt');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'generating'>('analyzing');
  const [summary, setSummary] = useState('');
  const [milestones, setMilestones] = useState<AIGeneratedMilestone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setError(null);
    setStep('loading');
    setLoadingStage('analyzing');

    // Smooth visual feedback for stage transitions
    setTimeout(() => {
      setLoadingStage('generating');
    }, 1200);

    try {
      const res = await generateAIMilestonesApi(projectId, customPrompt || undefined);
      setSummary(res.summary);
      setMilestones(res.milestones);
      setStep('review');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate milestones');
      setStep('prompt');
    }
  };

  const handleMilestoneChange = (index: number, field: keyof AIGeneratedMilestone, value: any) => {
    const updated = [...milestones];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // If budget percentage changed, update amount
    if (field === 'budgetPercentage') {
      const pct = Number(value) || 0;
      updated[index].amount = Math.round(((projectBudget * pct) / 100) * 100) / 100;
    }

    setMilestones(updated);
  };

  const handleAddMilestone = () => {
    const newOrder = milestones.length + 1;
    const newMilestone: AIGeneratedMilestone = {
      title: 'New Project Milestone',
      description: 'Milestone description and scope breakdown',
      deliverables: ['Key Deliverable 1'],
      estimatedDuration: '1 week',
      budgetPercentage: 10,
      amount: Math.round(((projectBudget * 10) / 100) * 100) / 100,
      dependencies: [],
      acceptanceCriteria: ['Client review and signoff'],
      order: newOrder,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleDeleteMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    const updated = milestones
      .filter((_, i) => i !== index)
      .map((m, i) => ({ ...m, order: i + 1 }));
    setMilestones(updated);
  };

  const handleSaveMilestones = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveBatchMilestonesApi(
        projectId,
        milestones.map((m) => ({
          title: m.title,
          description: m.description,
          deliverables: m.deliverables,
          estimatedDuration: m.estimatedDuration,
          budgetPercentage: m.budgetPercentage,
          amount: m.amount,
          dependencies: m.dependencies,
          acceptanceCriteria: m.acceptanceCriteria,
          order: m.order,
        }))
      );
      onMilestonesSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save milestones');
    } finally {
      setIsSaving(false);
    }
  };

  const totalPercentage = milestones.reduce((acc, m) => acc + Number(m.budgetPercentage || 0), 0);
  const totalCalculatedAmount = milestones.reduce((acc, m) => acc + Number(m.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Project Milestone Generator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                  Intelligent Analysis
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                Target: {projectTitle} (${Number(projectBudget).toLocaleString()})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Stages */}
        <div className="flex-1 overflow-y-auto pr-1">
          {step === 'prompt' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-slate-300">Existing Requirements Base</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {existingRequirements ||
                    'No specific requirements entered yet. AI will analyze the title and description.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom Focus / Additional Prompt (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Prioritize security, Stripe checkout in Milestone 2, and mobile responsiveness in first 2 weeks..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Interactive Review & Editing</p>
                  <p className="text-slate-400">
                    Generated milestones will be displayed as suggestions. You can edit every title,
                    reorder deliverables, adjust percentages, or add custom milestones before
                    saving.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-16 text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-emerald-400 absolute animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {loadingStage === 'analyzing'
                    ? 'Analyzing project scope & requirements...'
                    : 'Generating structured milestone breakdown...'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizing architectural dependencies, deliverables, and budget distribution.
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              {summary && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <span className="font-semibold text-brand-400">Executive Summary: </span>
                  {summary}
                </div>
              )}

              {/* Milestones Editable List */}
              <div className="space-y-4">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                          className="bg-transparent border-b border-slate-700 hover:border-brand-500 focus:border-brand-500 font-bold text-sm text-white focus:outline-none flex-1 py-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={m.estimatedDuration}
                            onChange={(e) =>
                              handleMilestoneChange(idx, 'estimatedDuration', e.target.value)
                            }
                            className="bg-transparent text-xs text-slate-300 w-16 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs">
                          <input
                            type="number"
                            value={m.budgetPercentage}
                            onChange={(e) =>
                              handleMilestoneChange(idx, 'budgetPercentage', e.target.value)
                            }
                            className="bg-transparent text-xs text-brand-400 font-semibold w-10 text-right focus:outline-none"
                          />
                          <span className="text-slate-400">%</span>
                        </div>

                        <div className="flex items-center text-xs font-bold text-emerald-400 w-20 justify-end">
                          <DollarSign className="w-3.5 h-3.5 -mr-1" />
                          {Number(m.amount).toLocaleString()}
                        </div>

                        {milestones.length > 1 && (
                          <button
                            onClick={() => handleDeleteMilestone(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={m.description}
                      onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                      placeholder="Milestone description..."
                      className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />

                    {/* Deliverables & Criteria */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                        <p className="font-semibold text-slate-400 mb-1 flex items-center gap-1">
                          <ListChecks className="w-3 h-3 text-brand-400" /> Deliverables
                        </p>
                        <p className="text-slate-300 line-clamp-2">
                          {Array.isArray(m.deliverables)
                            ? m.deliverables.join(' • ')
                            : m.deliverables}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                        <p className="font-semibold text-slate-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Acceptance Criteria
                        </p>
                        <p className="text-slate-300 line-clamp-2">
                          {Array.isArray(m.acceptanceCriteria)
                            ? m.acceptanceCriteria.join(' • ')
                            : m.acceptanceCriteria}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Milestone Button */}
              <button
                onClick={handleAddMilestone}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-brand-500/60 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-400" /> Add Custom Milestone
              </button>

              {/* Total Summary Row */}
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <div className="text-slate-400">
                  Total Budget Allocated:{' '}
                  <span className="font-bold text-white">
                    ${totalCalculatedAmount.toLocaleString()}
                  </span>{' '}
                  / ${Number(projectBudget).toLocaleString()}
                </div>
                <div
                  className={`font-semibold ${
                    totalPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  Total: {totalPercentage}% {totalPercentage !== 100 && '(Adjustment recommended)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {step === 'review' ? (
            <>
              <button
                onClick={() => setStep('prompt')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Re-generate
              </button>

              <button
                onClick={handleSaveMilestones}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Milestones...
                  </>
                ) : (
                  <>
                    Confirm & Save {milestones.length} Milestones <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerate}
                disabled={step === 'loading'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> Generate AI Breakdown
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
