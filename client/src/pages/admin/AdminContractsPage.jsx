import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FileCheck2, DollarSign, ShieldCheck, Layers, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client: <span className="text-slate-700 dark:text-slate-300 font-medium">{row.client?.name}</span> • Freelancer:{' '}
            <span className="text-slate-700 dark:text-slate-300 font-medium">{row.freelancer?.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
          ₹{Number(row.totalAmount).toLocaleString('en-IN')}
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
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
          {row.milestones?.filter((m) => m.status === 'APPROVED').length || 0} /{' '}
          {row.milestones?.length || 0} Cleared
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Signed Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>ESCROW CONTRACT GOVERNANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Platform Contracts Oversight
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit legally binding engineering contracts, inspect escrow funding status, and observe milestones across active teams.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={contracts}
        loading={loading}
        searchPlaceholder="Search contracts by title or party..."
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

export default AdminContractsPage;
