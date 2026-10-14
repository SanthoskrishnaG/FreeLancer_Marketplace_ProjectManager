import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contractApi } from '../../api/contractApi.js';
import { milestoneApi } from '../../api/milestoneApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  FileCheck2,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Upload,
  ShieldCheck,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const ContractDetailsPage = () => {
  const { id } = useParams();
  const { isClient, isFreelancer, user } = useAuth();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submit deliverable modal
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchContract = async () => {
    try {
      const res = await contractApi.getContractById(id);
      if (res.data) setContract(res.data);
    } catch (err) {
      console.error('Failed to load contract details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  const handleApproveMilestone = async (milestoneId) => {
    if (!window.confirm('Approve this milestone deliverable and release escrow payment?')) return;
    try {
      await milestoneApi.approveMilestone(milestoneId);
      fetchContract();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('notes', notes);
      if (fileUrl) formData.append('fileUrl', fileUrl);

      await milestoneApi.submitMilestoneWork(activeMilestone.id, formData);
      setSubmitModalOpen(false);
      setNotes('');
      setFileUrl('');
      setActiveMilestone(null);
      fetchContract();
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="w-1/4 h-5" />
        <Skeleton className="w-full h-36" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-500">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] mb-2">Contract Not Found</h2>
        <Link
          to={isClient ? '/client/contracts' : '/freelancer/contracts'}
          className="text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA] hover:underline"
        >
          ← Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to={isClient ? '/client/contracts' : '/freelancer/contracts'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Contracts</span>
      </Link>

      {/* Contract Header Card */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <Badge variant={contract.status} />
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                REF: {contract.id?.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {contract.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Project:{' '}
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{contract.project?.title}</span>{' '}
              • Client:{' '}
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{contract.client?.name}</span>{' '}
              • Freelancer:{' '}
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{contract.freelancer?.name}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-semibold">
              CONTRACT ESCROW VALUE
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] font-mono mt-1">
              ₹{Number(contract.totalAmount).toLocaleString('en-IN')}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow Funded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Schedule */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Milestone Delivery Schedule
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {contract.milestones?.filter((m) => m.status === 'APPROVED').length || 0} /{' '}
            {contract.milestones?.length || 0} Milestones Cleared
          </span>
        </div>

        <div className="space-y-4">
          {contract.milestones?.map((m, idx) => (
            <div
              key={m.id || idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200/90 dark:border-slate-800 space-y-3 transition-all hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={m.status} />
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(m.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isFreelancer && m.status !== 'COMPLETED' && m.status !== 'APPROVED' && (
                    <button
                      onClick={() => {
                        setActiveMilestone(m);
                        setSubmitModalOpen(true);
                      }}
                      className="btn-electric px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Deliverable</span>
                    </button>
                  )}

                  {isClient && m.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleApproveMilestone(m.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Release Payment</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 pl-10 leading-relaxed">
                {m.description}
              </p>
              {m.acceptanceCriteria && (
                <div className="pl-10 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Acceptance Criteria:
                  </span>{' '}
                  {m.acceptanceCriteria}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable submission modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Milestone Deliverables"
      >
        <form onSubmit={handleSubmitDeliverable} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Submit completed deliverables for verification:{' '}
            <span className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{activeMilestone?.title}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deliverable Notes & Walkthrough
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail testing URLs, API documentation, accounts, or changes made..."
              className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deliverable URL / Git Repository
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-electric px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Deliverable</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContractDetailsPage;
