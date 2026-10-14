import React, { useState, useEffect } from 'react';
import { contractApi } from '../../api/contractApi.js';
import { milestoneApi } from '../../api/milestoneApi.js';
import apiClient from '../../api/apiClient.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  FileCheck2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedContractId, setExpandedContractId] = useState(null);

  // Dispute modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeContract, setDisputeContract] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractApi.getUserContracts();
      if (res.data) setContracts(res.data.contracts || []);
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleApproveMilestone = async (milestoneId) => {
    if (!window.confirm('Approve this milestone and release escrow payment?')) return;
    try {
      await milestoneApi.approveMilestone(milestoneId);
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Milestone approval failed');
    }
  };

  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!disputeContract) return;

    setDisputeSubmitting(true);
    try {
      await apiClient.post('/disputes', {
        contractId: disputeContract.id,
        reason: disputeReason,
        description: disputeNotes,
      });
      alert('Dispute submitted for administrative review.');
      setDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeNotes('');
      setDisputeContract(null);
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Failed to file dispute');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-full h-36" />
        <Skeleton className="w-full h-36" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>SECURE ESCROW VAULT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Contracts & <span className="gradient-cyber-text">Escrow Management</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
          Review active agreements, verify deliverable milestones, release escrow funds, and resolve issues.
        </p>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No contracts found"
          description="When you accept candidate proposals, active contracts with protected escrow vaults will appear here."
        />
      ) : (
        <div className="space-y-3.5">
          {contracts.map((c) => {
            const isExpanded = expandedContractId === c.id;
            const completedMilestones = c.milestones?.filter((m) => m.status === 'APPROVED').length || 0;
            const totalMilestones = c.milestones?.length || 0;

            return (
              <div
                key={c.id}
                className="cyber-card bg-white dark:bg-[#111726]/85 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{c.title}</h2>
                      <Badge variant={c.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                      Freelancer: <span className="text-slate-800 dark:text-white font-semibold">{c.freelancer?.name}</span> • Project:{' '}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{c.project?.title}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="font-bold text-slate-900 dark:text-emerald-400">
                        ₹{Number(c.totalAmount).toLocaleString('en-IN')} Value
                      </span>
                      <span>•</span>
                      <span>
                        {completedMilestones} of {totalMilestones} Milestones Approved
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {c.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          setDisputeContract(c);
                          setDisputeModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dispute</span>
                      </button>
                    )}
                    <Link
                      to="/client/messages"
                      className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Message Freelancer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                      className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand Milestones'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Milestones Breakdown */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-[#0D1220]/70 border-t border-slate-200/80 dark:border-blue-500/15 p-5 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-blue-400 uppercase tracking-wide">
                      Milestone Schedule:
                    </h3>
                    <div className="space-y-2">
                      {c.milestones?.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200/70 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Phase {idx + 1}:</span>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">{m.title}</span>
                              <Badge variant={m.status} />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{m.description}</p>
                            {m.acceptanceCriteria && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">Criteria: {m.acceptanceCriteria}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-emerald-400">
                              ₹{Number(m.amount).toLocaleString('en-IN')}
                            </span>
                            {m.status === 'SUBMITTED' && (
                              <button
                                onClick={() => handleApproveMilestone(m.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dispute Modal */}
      <Modal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        title="Open Contract Dispute"
      >
        <form onSubmit={handleFileDispute} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Filing a dispute pauses milestone payout releases and flags this contract for arbitration review.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reason / Category</label>
            <input
              type="text"
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g. Incomplete Deliverables / Scope Discrepancy"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-rose-500/30 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Explanation & Evidence</label>
            <textarea
              required
              rows={4}
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              placeholder="Describe the issue with specific milestones, timelines, and communications..."
              className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-rose-500/30 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setDisputeModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disputeSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
            >
              {disputeSubmitting ? 'Filing...' : 'File Dispute'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientContractsPage;
