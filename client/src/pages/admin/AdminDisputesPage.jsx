import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { AlertTriangle, CheckCircle2, ShieldAlert, DollarSign } from 'lucide-react';

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
        awardedTo: resolution === 'RELEASE_PAYMENT' ? activeDispute.contract?.freelancerId : activeDispute.contract?.clientId,
      });
      alert('Dispute successfully arbitrated, funds released, and decision logged.');
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
      header: 'Disputed Contract',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.contract?.title}</div>
          <div className="text-xs text-gray-400">
            Client: {row.contract?.client?.name} • Freelancer: {row.contract?.freelancer?.name}
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <div>
          <span className="font-medium text-rose-400">{row.reason}</span>
          <p className="text-xs text-gray-400 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'openedBy',
      header: 'Filed By',
      render: (row) => <span className="text-xs text-gray-300">{row.openedBy?.name}</span>,
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
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Arbitrate</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Dispute Arbitration Chamber</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Review evidence, make formal rulings, and authorize escrow releases or refunds.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={disputes}
        loading={loading}
        searchPlaceholder="Search disputes..."
        filterKey="status"
        filterOptions={[
          { label: 'Open', value: 'OPEN' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Resolved', value: 'RESOLVED' },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Admin Arbitration Ruling"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 space-y-1 text-xs text-gray-300">
            <div>
              Contract: <span className="text-white font-semibold">{activeDispute?.contract?.title}</span>
            </div>
            <div>
              Disputed Escrow Value:{' '}
              <span className="text-emerald-400 font-bold">
                ${Number(activeDispute?.contract?.totalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-rose-400 font-medium pt-1">
              Claim: "{activeDispute?.description}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Arbitration Judgment</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="RELEASE_PAYMENT">Release Escrow Funds to Freelancer</option>
              <option value="CANCEL_CONTRACT">Refund Escrow Funds to Client & Cancel Contract</option>
              <option value="MUTUAL_SETTLEMENT">Mutual Settlement (50/50 Split)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Official Resolution Notes</label>
            <textarea
              required
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Detail the basis of the arbitration ruling based on code deliverables, Git history, and timeline expectations..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
            >
              Enforce Ruling & Release Funds
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
