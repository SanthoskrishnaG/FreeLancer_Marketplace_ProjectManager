import React, { useState, useEffect } from 'react';
import { contractApi } from '../../api/contractApi.js';
import { milestoneApi } from '../../api/milestoneApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  CheckCircle2,
  Upload,
  Send,
  IndianRupee,
  Layers,
  Sparkles,
  Link as LinkIcon,
  FileCode2,
  AlertCircle,
} from 'lucide-react';

export const FreelancerMilestonesPage = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await contractApi.getUserContracts();
      if (res.data?.contracts) {
        // Flatten all milestones from contracts
        const all = [];
        res.data.contracts.forEach((c) => {
          c.milestones?.forEach((m) => {
            all.push({
              ...m,
              contractTitle: c.title,
              clientName: c.client?.name || 'Client',
              contractId: c.id,
            });
          });
        });
        setMilestones(all);
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('notes', notes);
      if (fileUrl) formData.append('fileUrl', fileUrl);

      await milestoneApi.submitMilestoneWork(activeMilestone.id, formData);
      setModalOpen(false);
      setNotes('');
      setFileUrl('');
      setActiveMilestone(null);
      fetchMilestones();
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Milestone & Contract',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-1.5">
            <span>{row.title}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contract: <span className="text-slate-700 dark:text-slate-300 font-medium">{row.contractTitle}</span> • Client:{' '}
            <span className="text-slate-700 dark:text-slate-300 font-medium">{row.clientName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Escrow Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
          ₹{Number(row.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Deliverable Status',
      sortable: true,
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <div>
          {row.status !== 'APPROVED' ? (
            <button
              onClick={() => {
                setActiveMilestone(row);
                setModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Submit Work</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid Out</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8B5CF6] dark:text-[#A78BFA] text-xs font-mono font-medium mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>DELIVERABLES & ROADMAP PHASES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Milestones & Deliverable Submissions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hand off completed code repositories, staging demonstrations, and deliverables for client verification and automated escrow releases.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={milestones}
        loading={loading}
        searchPlaceholder="Filter milestones by name or client..."
        filterKey="status"
        filterOptions={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Submitted', value: 'SUBMITTED' },
          { label: 'Revision Requested', value: 'REVISION_REQUESTED' },
          { label: 'Approved', value: 'APPROVED' },
        ]}
      />

      {/* Modal for Deliverable Submission */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Deliverable for Client Verification"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
              Active Milestone
            </span>
            <div className="font-bold text-slate-900 dark:text-[#F8FAFC] text-sm">
              {activeMilestone?.title}
            </div>
            <div className="text-xs text-[#3B82F6] dark:text-[#60A5FA] font-mono font-bold mt-1">
              Escrow Value: ₹{Number(activeMilestone?.amount || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deliverable Summary & Testing Notes
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain features implemented, environment credentials, reproduction steps, or swagger docs..."
              className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Artifact Link (PR, Git Repository, Vercel/Fly.io preview)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
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
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FreelancerMilestonesPage;
