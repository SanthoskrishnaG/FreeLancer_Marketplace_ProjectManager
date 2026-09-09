import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../api/invoiceApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DollarSign, Download, FileText } from 'lucide-react';

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

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-400">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'contract',
      header: 'Contract',
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.contract?.title}</div>
          <div className="text-xs text-gray-400">
            Freelancer: {row.contract?.freelancer?.name}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
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
      header: 'Issued Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'PDF',
      render: (row) => (
        <a
          href={invoiceApi.downloadPdf(row.id)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 hover:text-white border border-gray-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Invoices & Billing Statements</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Download PDF receipts, track escrow settlements, and review payments.
        </p>
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
