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
      alert('Dispute opened and submitted for Admin review.');
      setDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeNotes('');
      setDisputeContract(null);
      fetchContracts();
    } catch (err) {
      alert(err.message || 'Failed to submit dispute');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-full h-40" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Contracts & Escrow Management</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Review active development contracts, verify submitted code, release milestone escrow, or file disputes.
        </p>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No active contracts found"
          description="When you accept proposals from freelancers, contracts and escrow vaults will be initialized here."
        />
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => {
            const isExpanded = expandedContractId === c.id;
            const completedMilestones = c.milestones?.filter((m) => m.status === 'APPROVED').length || 0;
            const totalMilestones = c.milestones?.length || 0;

            return (
              <div
                key={c.id}
                className="glass-card rounded-2xl border border-gray-800 overflow-hidden transition-colors"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-white">{c.title}</h3>
                      <Badge variant={c.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      Freelancer: <span className="text-gray-200 font-medium">{c.freelancer?.name}</span> • Project:{' '}
                      <span className="text-gray-300">{c.project?.title}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        ${Number(c.totalAmount).toLocaleString()} Contract Value
                      </span>
                      <span>•</span>
                      <span>
                        {completedMilestones} / {totalMilestones} Milestones Approved
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
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dispute</span>
                      </button>
                    )}
                    <Link
                      to="/client/messages"
                      className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                      title="Message Freelancer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand Milestones'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Milestones Breakdown */}
                {isExpanded && (
                  <div className="bg-gray-900/40 border-t border-gray-800 p-6 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Contract Milestones Breakdown:
                    </h4>
                    <div className="space-y-2.5">
                      {c.milestones?.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-300">#{idx + 1}</span>
                              <span className="text-sm font-semibold text-white">{m.title}</span>
                              <Badge variant={m.status} />
                            </div>
                            <p className="text-xs text-gray-400">{m.description}</p>
                            {m.acceptanceCriteria && (
                              <p className="text-[11px] text-gray-500">Criteria: {m.acceptanceCriteria}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-emerald-400">
                              ${Number(m.amount).toLocaleString()}
                            </span>
                            {m.status === 'SUBMITTED' && (
                              <button
                                onClick={() => handleApproveMilestone(m.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
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
          <p className="text-xs text-gray-400">
            Filing a dispute pauses milestone payments and flags this contract for administrative arbitration.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Reason / Category</label>
            <input
              type="text"
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g. Incomplete Deliverables / Missed Deadline / Non-responsive"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Detailed Explanation & Evidence</label>
            <textarea
              required
              rows={4}
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              placeholder="Describe the issue with specific milestones, timelines, and communications..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDisputeModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disputeSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
            >
              Submit Dispute
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
