import React, { useState, useEffect } from 'react';
import { contractApi } from '../../api/contractApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  DollarSign,
  MessageSquare,
  Clock,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

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

  const totalValue = contracts.reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const totalMilestones = contracts.reduce((sum, c) => sum + (c.milestones?.length || 0), 0);
  const approvedMilestones = contracts.reduce(
    (sum, c) => sum + (c.milestones?.filter((m) => m.status === 'APPROVED').length || 0),
    0
  );

  const columns = [
    {
      key: 'title',
      header: 'Contract & Client',
      sortable: true,
      render: (row) => (
        <div>
          <Link
            to={`/freelancer/contracts/${row.id}`}
            className="font-semibold text-slate-900 dark:text-[#F8FAFC] hover:text-[#3B82F6] dark:hover:text-[#60A5FA] transition-colors flex items-center gap-1.5"
          >
            <span>{row.title}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client: <span className="text-slate-700 dark:text-slate-300 font-medium">{row.client?.name || 'Enterprise Client'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Contract Value',
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
      render: (row) => {
        const total = row.milestones?.length || 0;
        const approved = row.milestones?.filter((m) => m.status === 'APPROVED').length || 0;
        const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
        return (
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {approved} / {total} Done
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/freelancer/contracts/${row.id}`}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-700/60 transition-colors"
            title="View Contract Roadmap"
          >
            <Layers className="w-4 h-4" />
          </Link>
          <Link
            to="/freelancer/time-tracking"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-700/60 transition-colors"
            title="Log Time on Stopwatch"
          >
            <Clock className="w-4 h-4" />
          </Link>
          <Link
            to="/freelancer/messages"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-700/60 transition-colors"
            title="Direct Message Client"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ESCROW PROTECTED CONTRACTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Active Engineering Contracts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor client agreements, milestone completion phases, billable tracking, and escrow releases.
          </p>
        </div>

        <Link
          to="/projects"
          className="btn-electric self-start sm:self-auto flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse Projects</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Contracts"
          value={activeContracts}
          subtitle="Currently underway"
          icon={FileCheck2}
          color="indigo"
        />
        <MetricCard
          title="Total Contract Value"
          value={`₹${totalValue.toLocaleString('en-IN')}`}
          subtitle="Cumulative pipeline"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Milestone Delivery"
          value={`${approvedMilestones} / ${totalMilestones}`}
          subtitle="Approved deliverables"
          icon={Layers}
          color="sky"
        />
        <MetricCard
          title="Escrow Security"
          value="100% Locked"
          subtitle="Funds held in safe escrow"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Contracts DataTable */}
      <DataTable
        columns={columns}
        data={contracts}
        loading={loading}
        searchPlaceholder="Filter contracts by title or client..."
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

export default FreelancerContractsPage;
