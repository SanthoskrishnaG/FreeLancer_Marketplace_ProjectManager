import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proposalApi } from '../../api/proposalApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Briefcase, DollarSign, Clock, ExternalLink } from 'lucide-react';

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
          <Link to={`/projects/${row.project?.id}`} className="font-semibold text-white hover:text-purple-400">
            {row.project?.title}
          </Link>
          <div className="text-xs text-gray-400">Client: {row.project?.client?.name}</div>
        </div>
      ),
    },
    {
      key: 'bidAmount',
      header: 'Your Bid',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-400">
          ${Number(row.bidAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'estimatedDurationDays',
      header: 'Duration',
      render: (row) => <span>~{row.estimatedDurationDays || 30} days</span>,
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
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Submitted Proposals</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track submitted bids and client invitations</p>
        </div>
        <Link
          to="/projects"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
        >
          Explore Projects
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={proposals}
        loading={loading}
        searchPlaceholder="Filter proposals..."
        filterKey="status"
        filterOptions={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Accepted', value: 'ACCEPTED' },
          { label: 'Rejected', value: 'REJECTED' },
        ]}
      />
    </div>
  );
};
