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
} from 'lucide-react';

export const ContractDetailsPage = () => {
  const { id } = useParams();
  const { isClient, isFreelancer } = useAuth();

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
      alert('Work submitted successfully!');
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
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-full h-40" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-gray-400">
        <h2 className="text-xl font-bold text-white mb-2">Contract Not Found</h2>
        <Link to={isClient ? '/client/contracts' : '/freelancer/contracts'} className="text-indigo-400 hover:underline">
          Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link
        to={isClient ? '/client/contracts' : '/freelancer/contracts'}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contracts
      </Link>

      {/* Contract Header Card */}
      <div className="glass-card p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5">
              <Badge variant={contract.status} />
              <span className="text-xs text-gray-400">Contract ID: {contract.id?.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{contract.title}</h1>
            <p className="text-xs text-gray-400">
              Project: <span className="text-gray-200 font-semibold">{contract.project?.title}</span> • Client:{' '}
              <span className="text-gray-200 font-semibold">{contract.client?.name}</span> • Freelancer:{' '}
              <span className="text-gray-200 font-semibold">{contract.freelancer?.name}</span>
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-gray-700/60 text-center bg-gray-900/60 shrink-0 min-w-[180px]">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Escrow</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ${Number(contract.totalAmount).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="glass-card p-8 rounded-3xl border border-gray-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
          <span>Milestone Execution Schedule</span>
        </h2>

        <div className="space-y-4">
          {contract.milestones?.map((m, idx) => (
            <div
              key={m.id || idx}
              className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={m.status} />
                      <span className="text-xs font-bold text-emerald-400">
                        ${Number(m.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isFreelancer && m.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        setActiveMilestone(m);
                        setSubmitModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Deliverable</span>
                    </button>
                  )}

                  {isClient && m.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleApproveMilestone(m.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Release</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300 pl-10 leading-relaxed">{m.description}</p>
              {m.acceptanceCriteria && (
                <div className="pl-10 text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-300">Criteria:</span> {m.acceptanceCriteria}
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
          <p className="text-xs text-gray-400">
            Submit code, repository links, or testing instructions for:{' '}
            <span className="text-white font-semibold">{activeMilestone?.title}</span>.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Notes & Walkthrough</label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail the completed deliverable features and testing guidelines..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Artifact / Repo URL</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Send Submission
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
