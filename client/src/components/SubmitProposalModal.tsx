import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProposalApi } from '../api/proposal.api.js';
import {
  Send,
  X,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Project } from '../types/index.js';

const proposalFormSchema = z.object({
  bidAmount: z.coerce.number().positive('Bid amount must be greater than zero'),
  estimatedDuration: z.string().min(2, 'Please specify an estimated duration'),
  coverLetter: z
    .string()
    .min(30, 'Cover letter must be at least 30 characters')
    .max(5000, 'Cover letter is too long'),
});

type ProposalFormData = z.infer<typeof proposalFormSchema>;

interface SubmitProposalModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitProposalModal: React.FC<SubmitProposalModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [milestones, setMilestones] = useState<
    Array<{ title: string; amount: number; duration: string }>
  >(
    project.milestones && project.milestones.length > 0
      ? project.milestones.map((m) => ({
          title: m.title,
          amount: Number(m.amount),
          duration: m.estimatedDuration || '1 week',
        }))
      : [
          {
            title: 'Phase 1: Architecture & Development',
            amount: Math.round(Number(project.budget) * 0.5),
            duration: '1-2 weeks',
          },
          {
            title: 'Phase 2: Final Testing & Deployment',
            amount: Math.round(Number(project.budget) * 0.5),
            duration: '1 week',
          },
        ]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      bidAmount: Number(project.budget),
      estimatedDuration: '2-3 weeks',
      coverLetter: '',
    },
  });

  const proposalMutation = useMutation({
    mutationFn: (data: any) => createProposalApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['myProposals'] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? Number(value) : value,
    };
    setMilestones(updated);

    // Recalculate total bid amount
    const total = updated.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    setValue('bidAmount', total);
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        amount: 500,
        duration: '1 week',
      },
    ]);
  };

  const handleDeleteMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
    const total = updated.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    setValue('bidAmount', total);
  };

  const onSubmit = (formData: ProposalFormData) => {
    proposalMutation.mutate({
      projectId: project.id,
      coverLetter: formData.coverLetter,
      bidAmount: formData.bidAmount,
      estimatedDuration: formData.estimatedDuration,
      milestonePricing: milestones,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Submit Freelance Proposal</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                Project: {project.title} (Client Budget: ${Number(project.budget).toLocaleString()})
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

        {proposalMutation.isError && (
          <div className="flex items-center gap-2.5 p-3.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {(proposalMutation.error as any)?.response?.data?.message ||
                'Failed to submit proposal'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Bid & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-400" /> Proposed Total Price ($) *
              </label>
              <input
                type="number"
                {...register('bidAmount')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-brand-400 focus:outline-none focus:border-brand-500"
              />
              {errors.bidAmount && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.bidAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Estimated Duration *
              </label>
              <input
                type="text"
                {...register('estimatedDuration')}
                placeholder="e.g. 2 weeks or 1 month"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.estimatedDuration.message}</p>
              )}
            </div>
          </div>

          {/* Milestone Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Milestone Pricing Breakdown
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Phase
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                >
                  <span className="w-5 h-5 rounded-md bg-slate-900 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    placeholder="Milestone description"
                    className="bg-transparent border-b border-slate-800 focus:border-brand-500 flex-1 px-2 py-1 text-slate-200 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-slate-500">$</span>
                    <input
                      type="number"
                      value={m.amount}
                      onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                      className="bg-transparent border-b border-slate-800 focus:border-brand-500 w-full px-1 py-1 text-emerald-400 font-semibold focus:outline-none"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-400" /> Cover Letter & Pitch *
            </label>
            <textarea
              rows={5}
              {...register('coverLetter')}
              placeholder="Explain why you are the best fit for this project, relevant past projects, and technical methodology..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
            {errors.coverLetter && (
              <p className="mt-1 text-xs text-rose-400">{errors.coverLetter.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={proposalMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {proposalMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Send Proposal <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
