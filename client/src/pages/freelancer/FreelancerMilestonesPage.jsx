import React, { useState, useEffect } from 'react';
import { contractApi } from '../../api/contractApi.js';
import { milestoneApi } from '../../api/milestoneApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CheckCircle2, Upload, DollarSign, Send } from 'lucide-react';

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
            all.push({ ...m, contractTitle: c.title, clientName: c.client?.name });
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
      alert('Work submitted successfully!');
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
      header: 'Milestone Title',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.title}</div>
          <div className="text-xs text-gray-400">
            Contract: {row.contractTitle} • Client: {row.clientName}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Escrow Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-400">
          ${Number(row.amount).toLocaleString()}
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
      header: 'Action',
      render: (row) => (
        <div>
          {row.status !== 'APPROVED' ? (
            <button
              onClick={() => {
                setActiveMilestone(row);
                setModalOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Submit Work</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid Out</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Milestones & Deliverables</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Submit completed deliverables, code artifacts, and review client revision feedback.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={milestones}
        loading={loading}
        searchPlaceholder="Filter milestones..."
        filterKey="status"
        filterOptions={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Submitted', value: 'SUBMITTED' },
          { label: 'Revision Requested', value: 'REVISION_REQUESTED' },
          { label: 'Approved', value: 'APPROVED' },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Deliverable for Client Approval"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-400">
            Submitting for: <span className="text-white font-semibold">{activeMilestone?.title}</span> ($
            {Number(activeMilestone?.amount || 0).toLocaleString()})
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Deliverable Notes & Testing Instructions
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain what was built, how to test, credentials, or API documentation..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Artifact Link (PR, repo, deployed demo URL)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/org/repo or demo"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
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
