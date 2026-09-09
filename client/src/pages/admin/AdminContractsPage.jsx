import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FileCheck2, DollarSign } from 'lucide-react';

export const AdminContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getContracts();
        if (res.data?.contracts) setContracts(res.data.contracts);
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
      header: 'Contract & Parties',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.title}</div>
          <div className="text-xs text-gray-400">
            Client: <span className="text-gray-200">{row.client?.name}</span> • Freelancer:{' '}
            <span className="text-gray-200">{row.freelancer?.name}</span>
          </div>
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
      header: 'Milestone Progress',
      render: (row) => (
        <span className="text-xs text-gray-300">
          {row.milestones?.filter((m) => m.status === 'APPROVED').length || 0} /{' '}
          {row.milestones?.length || 0} Approved
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Signed Date',
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
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Contracts Oversight</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Audit legally binding developer contracts and observe milestone escrow allocations.
        </p>
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
