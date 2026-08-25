import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveMilestoneApi, requestMilestoneRevisionApi } from '../api/milestone.api.js';
import { Milestone } from '../types/index.js';
import {
  CheckCircle2,
  XCircle,
  X,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ReviewMilestoneModalProps {
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewMilestoneModal: React.FC<ReviewMilestoneModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [reviewMode, setReviewMode] = useState<'approve' | 'revision'>('approve');
  const [feedback, setFeedback] = useState('');
  const [requestedChanges, setRequestedChanges] = useState<string[]>(['']);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const latestSubmission =
    milestone.submissions && milestone.submissions.length > 0 ? milestone.submissions[0] : null;

  const approveMutation = useMutation({
    mutationFn: () => approveMilestoneApi(milestone.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', milestone.contractId] });
      queryClient.invalidateQueries({ queryKey: ['milestoneHistory', milestone.id] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to approve milestone');
    },
  });

  const revisionMutation = useMutation({
    mutationFn: (data: any) => requestMilestoneRevisionApi(milestone.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', milestone.contractId] });
      queryClient.invalidateQueries({ queryKey: ['milestoneHistory', milestone.id] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to request revision');
    },
  });

  if (!isOpen) return null;

  const handleAddChange = () => {
    setRequestedChanges([...requestedChanges, '']);
  };

  const handleUpdateChange = (index: number, val: string) => {
    const updated = [...requestedChanges];
    updated[index] = val;
    setRequestedChanges(updated);
  };

  const handleRemoveChange = (index: number) => {
    setRequestedChanges(requestedChanges.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reviewMode === 'approve') {
      approveMutation.mutate();
    } else {
      const validChanges = requestedChanges.map((c) => c.trim()).filter(Boolean);
      if (!feedback.trim()) {
        setError('Please provide feedback explaining the requested revisions');
        return;
      }
      if (validChanges.length === 0) {
        setError('Please provide at least one specific requested change');
        return;
      }

      revisionMutation.mutate({
        feedback,
        requestedChanges: validChanges,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Review Milestone Deliverables</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {milestone.title} • Released Amount: ${Number(milestone.amount).toLocaleString()}
            </p>
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

        {/* Content */}
        <div className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Latest Submission Preview */}
          {latestSubmission && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Submitted Deliverables
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(latestSubmission.submittedAt).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {latestSubmission.description}
              </p>

              {/* Links */}
              {latestSubmission.links && latestSubmission.links.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Deliverable Links:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {latestSubmission.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        {link} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {latestSubmission.files && latestSubmission.files.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Attached Files:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {latestSubmission.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-200"
                      >
                        <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="truncate flex-1">{file.originalName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Choice Tabs */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReviewMode('approve')}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                reviewMode === 'approve'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Sign Off
            </button>

            <button
              type="button"
              onClick={() => setReviewMode('revision')}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                reviewMode === 'revision'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4" /> Request Revisions
            </button>
          </div>

          {/* Revision Form Details */}
          {reviewMode === 'revision' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Client Revision Feedback *
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain why revisions are requested and general feedback..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              {/* Specific Changes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Specific Required Changes
                  </label>
                  <button
                    type="button"
                    onClick={handleAddChange}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {requestedChanges.map((change, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={change}
                        onChange={(e) => handleUpdateChange(idx, e.target.value)}
                        placeholder={`Change item ${idx + 1}...`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                      {requestedChanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChange(idx)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Revision Target Due Date
                  (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full sm:w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={approveMutation.isPending || revisionMutation.isPending}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
              reviewMode === 'approve'
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-emerald-500/20'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20'
            }`}
          >
            {approveMutation.isPending || revisionMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : reviewMode === 'approve' ? (
              <>
                Confirm Approval <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Send Revision Request <XCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
