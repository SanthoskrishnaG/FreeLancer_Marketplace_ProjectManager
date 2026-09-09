import React, { useState, useEffect } from 'react';
import { contractApi } from '../../api/contractApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Link } from 'react-router-dom';
import { FileCheck2, DollarSign, MessageSquare, Clock } from 'lucide-react';

export const FreelancerContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchContracts();
  }, []);

  const columns = [
    {
      key: 'title',
      header: 'Contract Title',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.title}</div>
          <div className="text-xs text-gray-400">Client: {row.client?.name}</div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Value',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-400">
          ${Number(row.totalAmount).toLocaleString()}
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
      key: 'milestones',
      header: 'Milestones',
      render: (row) => (
        <span className="text-xs text-gray-300">
          {row.milestones?.filter((m) => m.status === 'APPROVED').length || 0} /{' '}
          {row.milestones?.length || 0} Done
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to="/freelancer/time-tracking"
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Track Time"
          >
            <Clock className="w-4 h-4" />
          </Link>
          <Link
            to="/freelancer/messages"
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Message Client"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Active Contracts</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your active client contracts and delivery milestones</p>
      </div>

      <DataTable
        columns={columns}
        data={contracts}
        loading={loading}
        searchPlaceholder="Search contracts..."
        filterKey="status"
        filterOptions={[
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Disputed', value: 'DISPUTED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
      />
    </div>
  );
};
