import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proposalApi } from '../../api/proposalApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Briefcase, ArrowRight } from 'lucide-react';

export const FreelancerProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const res = await proposalApi.getFreelancerProposals();
        if (res.data) setProposals(res.data.proposals || []);
      } catch (err) {
        console.error('Failed to load proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const columns = [
    {
      key: 'project',
      header: 'Project Title',
      sortable: true,
      render: (row) => (
        <div>
          <Link
            to={`/projects/${row.project?.id}`}
            className="font-semibold text-slate-900 dark:text-[#F8FAFC] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {row.project?.title}
          </Link>
          <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Client: {row.project?.client?.name || 'Verified Client'}
          </div>
        </div>
      ),
    },
    {
      key: 'bidAmount',
      header: 'Your Bid',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-emerald-400">
          ₹{Number(row.bidAmount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'estimatedDuration',
      header: 'Duration',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">
          {row.estimatedDuration || `${row.estimatedDurationDays || 14} days`}
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
      key: 'createdAt',
      header: 'Submitted On',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>OPPORTUNITY PIPELINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Submitted <span className="gradient-cyber-text">Proposals</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Track your bids, client review status, and contract acceptances.
          </p>
        </div>
        <Link
          to="/projects"
          className="btn-electric px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Browse Marketplace</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={proposals}
        loading={loading}
        searchPlaceholder="Filter proposals by project title..."
        filterKey="status"
        filterOptions={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Shortlisted', value: 'SHORTLISTED' },
          { label: 'Accepted', value: 'ACCEPTED' },
          { label: 'Rejected', value: 'REJECTED' },
        ]}
      />
    </div>
  );
};

export default FreelancerProposalsPage;
