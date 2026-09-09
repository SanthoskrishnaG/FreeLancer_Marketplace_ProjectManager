import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../api/invoiceApi.js';
import { dashboardApi } from '../../api/dashboardApi.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DollarSign, Download, Lock, CheckCircle2 } from 'lucide-react';

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
        <span className="font-mono text-xs font-semibold text-purple-400">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'contract',
      header: 'Client & Project',
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.contract?.title}</div>
          <div className="text-xs text-gray-400">Client: {row.contract?.client?.name}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Net Amount',
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
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Receipt',
      render: (row) => (
        <a
          href={invoiceApi.downloadPdf(row.id)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 hover:text-white border border-gray-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>PDF</span>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Earnings & Payout Invoices</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          View cleared payouts, pending escrow allocations, and download official PDF tax invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Cleared Earnings"
          value={`$${Number(stats.totalEarnings || 0).toLocaleString()}`}
          subtitle="Directly deposited / withdrawn"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Pending in Escrow"
          value={`$${Number(stats.pendingEscrowEarnings || 0).toLocaleString()}`}
          subtitle="Funded by clients for active milestones"
          icon={Lock}
          color="amber"
        />
        <MetricCard
          title="Paid Milestones"
          value={stats.completedProjects || 0}
          subtitle="Successfully delivered"
          icon={CheckCircle2}
          color="purple"
        />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search invoices..."
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
