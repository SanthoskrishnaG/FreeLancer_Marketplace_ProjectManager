import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDisputeApi } from '../api/dispute.api.js';
import { AlertTriangle, X, Loader2, Scale } from 'lucide-react';

interface RaiseDisputeModalProps {
  contractId: string;
  contractTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onDisputeCreated?: () => void;
}

export const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({
  contractId,
  contractTitle,
  isOpen,
  onClose,
  onDisputeCreated,
}) => {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Dispute reason must be at least 5 characters');
      return;
    }
    if (description.trim().length < 15) {
      setError('Please provide at least 15 characters describing the dispute issue');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const evidence = evidenceUrl.trim() ? [evidenceUrl.trim()] : [];
      const dispute = await createDisputeApi({
        contractId,
        reason: reason.trim(),
        description: description.trim(),
        evidence,
      });

      if (onDisputeCreated) onDisputeCreated();
      onClose();
      navigate(`/disputes/${dispute.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to open dispute. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Raise Contract Dispute</h3>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{contractTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Dispute Category / Summary Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Deliverables do not match specifications, deadline breach"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Detailed Case Explanation
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the timeline, milestone deliverables, expectations, and why you are seeking arbitration..."
              rows={4}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Evidence Link / Artifact URL (Optional)
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://drive.google.com/... or cloud storage URL"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Opening a dispute places the contract into DISPUTED status. An administrator will review all evidence and mediate a binding resolution.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || reason.length < 5 || description.length < 15}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening Dispute...
                </>
              ) : (
                'Open Formal Dispute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
