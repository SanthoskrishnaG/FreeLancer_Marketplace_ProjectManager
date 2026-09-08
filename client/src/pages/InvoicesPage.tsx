import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getInvoicesApi, getFinancialMetricsApi, downloadInvoicePdfApi } from '../api/invoice.api.js';
import { Invoice, InvoiceStatus } from '../types/index.js';
import { PaymentCheckoutModal } from '../components/PaymentCheckoutModal.js';
import { useAuth } from '../context/AuthContext.js';
import {
  FileText,
  Download,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ['invoices', selectedStatus],
    queryFn: () =>
      getInvoicesApi({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      }),
  });

  const { data: metrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['invoice-metrics'],
    queryFn: () => getFinancialMetricsApi(),
  });

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      await downloadInvoicePdfApi(invoice.id, invoice.invoiceNumber);
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const isClient = user?.role === 'CLIENT';

  const invoices = invoicesData?.invoices || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Escrow & Billing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Invoicing & Financial Hub
          </h1>
          <p className="text-xs text-slate-400">
            Automated milestone invoicing, professional PDF exports, and secure settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/payments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <CreditCard className="w-4 h-4 text-brand-400" /> Payment History
          </Link>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Total Invoices</p>
            <FileText className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {metrics?.totalInvoices ?? invoices.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Lifecycle bills issued</p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Paid & Settled</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            ${Number(metrics?.totalPaid ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{metrics?.paidCount ?? 0} invoices paid</p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Pending Clearance</p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            ${Number(metrics?.totalPending ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{metrics?.pendingCount ?? 0} invoices awaiting payment</p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Overdue / Delinquent</p>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">
            ${Number(metrics?.totalOverdue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Past scheduled due date</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {(['ALL', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === status
                ? 'bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/20 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {invoicesLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading invoice records...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No invoices found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Invoices are generated upon completion of project milestones or contracts.
          </p>
          <Link
            to="/contracts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
          >
            Go to Active Contracts
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const isSettled = invoice.status === 'PAID';
            const isClientUser = isClient;
            const partyLabel = isClientUser
              ? `Freelancer: ${invoice.freelancerProfile?.user?.firstName} ${invoice.freelancerProfile?.user?.lastName}`
              : `Client: ${invoice.client?.companyName || invoice.client?.user?.firstName + ' ' + invoice.client?.user?.lastName}`;

            return (
              <div
                key={invoice.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isSettled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : invoice.status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white">
                        {invoice.invoiceNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isSettled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : invoice.status === 'OVERDUE'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-200 truncate">
                      {invoice.project?.title || 'Contract Deliverables'}
                    </p>

                    <p className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>{partyLabel}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <p className="text-[11px] text-slate-400">Total Due</p>
                    <p className="text-lg font-extrabold text-white">
                      ${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                      title="Download PDF"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
                    >
                      {downloadingId === invoice.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {isClient && !isSettled && (
                      <button
                        onClick={() => setPayingInvoice(invoice)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentCheckoutModal
          invoice={payingInvoice}
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={() => {
            refetchInvoices();
            refetchMetrics();
          }}
        />
      )}
    </div>
  );
};
