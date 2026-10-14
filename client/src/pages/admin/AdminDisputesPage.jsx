import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  DollarSign,
  Gavel,
  ShieldCheck,
  Scale,
} from 'lucide-react';

export const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Arbitration modal
  const [activeDispute, setActiveDispute] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resolution, setResolution] = useState('RELEASE_PAYMENT');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDisputes();
      if (res.data?.disputes) setDisputes(res.data.disputes);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeDispute) return;
    setSubmitting(true);

    try {
      await adminApi.resolveDispute(activeDispute.id, {
        resolution,
        resolutionNotes,
        awardedTo:
          resolution === 'RELEASE_PAYMENT'
            ? activeDispute.contract?.freelancerId
            : activeDispute.contract?.clientId,
      });
      setModalOpen(false);
      setResolutionNotes('');
      setActiveDispute(null);
      fetchDisputes();
    } catch (err) {
      alert(err.message || 'Arbitration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'contract',
      header: 'Disputed Contract & Parties',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
            {row.contract?.title || 'Contract'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client: <span className="text-slate-700 dark:text-slate-300 font-medium">{row.contract?.client?.name}</span> • Freelancer:{' '}
            <span className="text-slate-700 dark:text-slate-300 font-medium">{row.contract?.freelancer?.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Claim & Justification',
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-semibold text-rose-600 dark:text-rose-400 text-xs block">
            {row.reason}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: 'openedBy',
      header: 'Petitioner',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.openedBy?.name}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: 'actions',
      header: 'Arbitration',
      render: (row) => (
        <div>
          {row.status !== 'RESOLVED' ? (
            <button
              onClick={() => {
                setActiveDispute(row);
                setModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Arbitrate</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settled</span>
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
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-medium mb-2">
          <Scale className="w-3.5 h-3.5" />
          <span>ESCROW ARBITRATION CHAMBER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Contract Disputes & Mediation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review evidence, audit milestone deliverables, deliver formal rulings, and authorize irreversible escrow disbursement releases.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={disputes}
        loading={loading}
        searchPlaceholder="Search disputes by contract or party..."
        filterKey="status"
        filterOptions={[
          { label: 'Open', value: 'OPEN' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Resolved', value: 'RESOLVED' },
        ]}
      />

      {/* Arbitration Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Admin Arbitration Judgment"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-[#0D1220] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div>
              Contract: <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">{activeDispute?.contract?.title}</span>
            </div>
            <div>
              Disputed Escrow Value:{' '}
              <span className="text-slate-900 dark:text-[#F8FAFC] font-mono font-bold">
                ₹{Number(activeDispute?.contract?.totalAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-rose-600 dark:text-rose-400 font-medium pt-1 italic">
              Claim statement: "{activeDispute?.description}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Arbitration Judgment
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            >
              <option value="RELEASE_PAYMENT">Release Escrow Funds to Freelancer</option>
              <option value="CANCEL_CONTRACT">Refund Escrow Funds to Client & Cancel Contract</option>
              <option value="MUTUAL_SETTLEMENT">Mutual Settlement (50/50 Split)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Resolution Audit Notes
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Detail the technical rationale for this ruling based on repository commit history, milestones, and deliverable specs..."
              className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Enforce Ruling & Release Funds</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDisputesPage;
