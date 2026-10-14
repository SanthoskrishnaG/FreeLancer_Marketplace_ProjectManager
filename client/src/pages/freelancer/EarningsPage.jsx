import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../api/invoiceApi.js';
import { dashboardApi } from '../../api/dashboardApi.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  IndianRupee,
  Download,
  Lock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  FileText,
} from 'lucide-react';

export const EarningsPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, dashRes] = await Promise.all([
          invoiceApi.getUserInvoices(),
          dashboardApi.getFreelancerDashboard(),
        ]);
        if (invRes.data) setInvoices(invRes.data.invoices || []);
        if (dashRes.data?.stats) setStats(dashRes.data.stats);
      } catch (err) {
        console.error('Failed to load earnings data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA]">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'contract',
      header: 'Client & Project',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
            {row.contract?.title || 'Contract'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client: {row.contract?.client?.name || 'Verified Enterprise Client'}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Net Disbursement',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
          ₹{Number(row.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Settlement Status',
      sortable: true,
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Cleared Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Tax Receipt',
      render: (row) => (
        <a
          href={invoiceApi.downloadPdf(row.id)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-700/80 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>PDF Receipt</span>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>FINANCIAL LEDGER & TAX INVOICES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Earnings & Disbursement Statements
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review cleared payments deposited, escrow funds currently allocated for in-flight milestones, and tax compliance records.
        </p>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Cleared Earnings"
          value={`₹${Number(stats.totalEarnings || 0).toLocaleString('en-IN')}`}
          subtitle="Net payouts deposited"
          icon={IndianRupee}
          color="emerald"
        />
        <MetricCard
          title="Escrow Vault Holdings"
          value={`₹${Number(stats.pendingEscrowEarnings || 0).toLocaleString('en-IN')}`}
          subtitle="Funded for active deliverables"
          icon={Lock}
          color="amber"
        />
        <MetricCard
          title="Completed Deliverables"
          value={stats.completedProjects || 0}
          subtitle="Milestones accepted & paid"
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* Payouts Table */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search payout invoices by number or client..."
        filterKey="status"
        filterOptions={[
          { label: 'Paid', value: 'PAID' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
      />
    </div>
  );
};

export default EarningsPage;
