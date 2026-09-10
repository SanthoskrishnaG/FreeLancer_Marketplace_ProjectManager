import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startMilestoneApi } from '../api/milestone.api.js';
import { Milestone, Contract } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Clock, Play, Send, Eye, History, Layers, ListChecks, CheckCircle2 } from 'lucide-react';
import { SubmitMilestoneModal } from './SubmitMilestoneModal.js';
import { ReviewMilestoneModal } from './ReviewMilestoneModal.js';
import { MilestoneHistoryDrawer } from './MilestoneHistoryDrawer.js';

interface MilestoneTimelineProps {
  contract: Contract;
  milestones: Milestone[];
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ contract, milestones }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [submittingMilestone, setSubmittingMilestone] = useState<Milestone | null>(null);
  const [reviewingMilestone, setReviewingMilestone] = useState<Milestone | null>(null);
  const [historyMilestone, setHistoryMilestone] = useState<Milestone | null>(null);

  const startMutation = useMutation({
    mutationFn: (id: string) => startMilestoneApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contract.id] });
    },
  });

  const isClient = user && contract.client?.user?.id === user.id;
  const isFreelancer = user && contract.freelancerProfile?.user?.id === user.id;

  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const completedCount = milestones.filter(
    (m) => m.status === 'APPROVED' || m.status === 'COMPLETED'
  ).length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Metric Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" /> Milestone Execution Progress
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedCount} of {milestones.length} milestones approved & completed
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs text-slate-400">Total Contract Value</p>
              <p className="text-lg font-extrabold text-white">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <span className="text-base font-extrabold text-brand-400">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'APPROVED' || milestone.status === 'COMPLETED';
          const isSubmitted =
            milestone.status === 'SUBMITTED' || milestone.status === 'UNDER_REVIEW';
          const isRevision = milestone.status === 'REVISION_REQUESTED';
          const isInProgress = milestone.status === 'IN_PROGRESS';
          const isPending = milestone.status === 'PENDING';

          const hasHistory =
            (milestone.submissions && milestone.submissions.length > 0) ||
            (milestone.revisions && milestone.revisions.length > 0);

          return (
            <div
              key={milestone.id}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isSubmitted
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : isRevision
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : isInProgress
                              ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-white">{milestone.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isSubmitted
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : isRevision
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : isInProgress
                                  ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {milestone.status}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80 shrink-0">
                  <p className="text-base font-extrabold text-white">
                    ${Number(milestone.amount).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {milestone.estimatedDuration || '1 week'}
                  </p>
                </div>
              </div>

              {/* Deliverables Checklist */}
              {milestone.deliverables && milestone.deliverables.length > 0 && (
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-brand-400" /> Expected Deliverables:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                    {milestone.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {hasHistory && (
                    <button
                      onClick={() => setHistoryMilestone(milestone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" /> View History
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Freelancer actions */}
                  {isFreelancer && isPending && (
                    <button
                      onClick={() => startMutation.mutate(milestone.id)}
                      disabled={startMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Milestone
                    </button>
                  )}

                  {isFreelancer && (isInProgress || isRevision) && (
                    <button
                      onClick={() => setSubmittingMilestone(milestone)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-md shadow-brand-500/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Deliverables
                    </button>
                  )}

                  {/* Client actions */}
                  {isClient && isSubmitted && (
                    <button
                      onClick={() => setReviewingMilestone(milestone)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review Deliverables
                    </button>
                  )}

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals & Drawers */}
      {submittingMilestone && (
        <SubmitMilestoneModal
          milestone={submittingMilestone}
          isOpen={!!submittingMilestone}
          onClose={() => setSubmittingMilestone(null)}
        />
      )}

      {reviewingMilestone && (
        <ReviewMilestoneModal
          milestone={reviewingMilestone}
          isOpen={!!reviewingMilestone}
          onClose={() => setReviewingMilestone(null)}
        />
      )}

      {historyMilestone && (
        <MilestoneHistoryDrawer
          milestoneId={historyMilestone.id}
          milestoneTitle={historyMilestone.title}
          isOpen={!!historyMilestone}
          onClose={() => setHistoryMilestone(null)}
        />
      )}
    </div>
  );
};
