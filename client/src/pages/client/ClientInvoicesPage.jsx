import React, { useState, useEffect, useMemo } from 'react';
import { invoiceApi } from '../../api/invoiceApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { Download, FileText, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

export const ClientInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await invoiceApi.getUserInvoices();
        if (res.data) setInvoices(res.data.invoices || []);
      } catch (err) {
        console.error('Failed to load invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const summary = useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const pendingAmount = invoices
      .filter((inv) => inv.status !== 'PAID')
      .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    return { totalBilled, totalPaid, pendingAmount };
  }, [invoices]);

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-cyan-400">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'contract',
      header: 'Contract & Freelancer',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.contract?.title || 'Contract'}</div>
          <div className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Freelancer: {row.contract?.freelancer?.name || 'Assigned Specialist'}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-emerald-400">
          ₹{Number(row.amount).toLocaleString('en-IN')}
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
      header: 'Issued Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-blue-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-blue-500/30 shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>PDF Receipt</span>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>FINANCIAL LEDGER</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Billing & <span className="gradient-cyber-text">Invoices</span></h1>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Review milestone payments, tax statements, and download official PDF receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced"
          value={`₹${summary.totalBilled.toLocaleString('en-IN')}`}
          subtitle="All contract billing"
          icon={FileText}
          color="indigo"
        />
        <MetricCard
          title="Settled Payments"
          value={`₹${summary.totalPaid.toLocaleString('en-IN')}`}
          subtitle="Cleared milestone disbursements"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Pending Settlement"
          value={`₹${summary.pendingAmount.toLocaleString('en-IN')}`}
          subtitle="Awaiting milestone release"
          icon={Clock}
          color="amber"
        />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search invoices by number or title..."
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

export default ClientInvoicesPage;

