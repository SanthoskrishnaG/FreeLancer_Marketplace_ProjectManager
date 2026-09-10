import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceByIdApi, downloadInvoicePdfApi } from '../api/invoice.api.js';
import { PaymentCheckoutModal } from '../components/PaymentCheckoutModal.js';
import { useAuth } from '../context/AuthContext.js';
import {
  ArrowLeft,
  Download,
  CreditCard,
  Building2,
  User as UserIcon,
  FileCheck2,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const {
    data: invoice,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceByIdApi(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-3" />
        <p className="text-xs text-slate-400">Loading invoice document...</p>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Invoice Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          This invoice does not exist or you do not have permission to access it.
        </p>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdfApi(invoice.id, invoice.invoiceNumber);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isClient = user?.role === 'CLIENT';
  const isSettled = invoice.status === 'PAID';

  const clientName =
    invoice.client?.companyName ||
    `${invoice.client?.user?.firstName || ''} ${invoice.client?.user?.lastName || ''}`;
  const freelancerName = `${invoice.freelancerProfile?.user?.firstName || ''} ${invoice.freelancerProfile?.user?.lastName || ''}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </button>

          {isClient && !isSettled && (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20"
            >
              <CreditCard className="w-4 h-4" /> Pay Now (${Number(invoice.total).toFixed(2)})
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document Canvas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
        {/* Status Stamp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] text-brand-400 font-extrabold uppercase tracking-widest block">
              Official Tax Invoice
            </span>
            <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
              #{invoice.invoiceNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Associated Contract:{' '}
              <Link
                to={`/contracts/${invoice.contractId}`}
                className="text-brand-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                View Contract Spec <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                isSettled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : invoice.status === 'OVERDUE'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
              }`}
            >
              {invoice.status}
            </span>
            <p className="text-[11px] text-slate-400">
              Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400">
              Payment Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Parties Grid (Client & Freelancer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Billed To (Client)
            </p>
            <p className="text-sm font-bold text-white">{clientName}</p>
            <p className="text-xs text-slate-400">{invoice.client?.user?.email}</p>
            {invoice.client?.user?.location && (
              <p className="text-xs text-slate-500">{invoice.client.user.location}</p>
            )}
          </div>

          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Issued By (Freelancer)
            </p>
            <p className="text-sm font-bold text-white">{freelancerName}</p>
            <p className="text-xs text-slate-400">{invoice.freelancerProfile?.title}</p>
            <p className="text-xs text-slate-500">{invoice.freelancerProfile?.user?.email}</p>
          </div>
        </div>

        {/* Deliverables / Items Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand-400" /> Milestone Deliverables Schedule
          </h3>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-950 p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <div className="col-span-1">#</div>
              <div className="col-span-8">Deliverable Item Description</div>
              <div className="col-span-3 text-right">Amount (USD)</div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 p-3.5 text-xs">
                    <div className="col-span-1 text-slate-500">{index + 1}</div>
                    <div className="col-span-8 text-slate-200 font-medium">{item.description}</div>
                    <div className="col-span-3 text-right font-bold text-white">
                      ${Number(item.amount).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-12 p-3.5 text-xs">
                  <div className="col-span-1 text-slate-500">1</div>
                  <div className="col-span-8 text-slate-200 font-medium">
                    {invoice.project?.title || 'Contract Scope Deliverables'}
                  </div>
                  <div className="col-span-3 text-right font-bold text-white">
                    ${Number(invoice.subtotal).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-medium">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 pb-2">
              <span className="text-slate-400">Tax / Platform Processing</span>
              <span className="text-white font-medium">${Number(invoice.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-300 font-bold">Total Amount</span>
              <span className="text-xl font-extrabold text-brand-400">
                ${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Settled Payment Confirmation */}
        {isSettled && invoice.payments && invoice.payments.length > 0 && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Payment Settled</p>
                <p className="text-[11px] text-slate-400">
                  Transaction Ref: {invoice.payments[0].transactionId} • Gateway: {invoice.payments[0].provider}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Settled'}
            </span>
          </div>
        )}
      </div>

      {/* Payment Checkout Modal */}
      {isPayModalOpen && (
        <PaymentCheckoutModal
          invoice={invoice}
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          onPaymentSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};
