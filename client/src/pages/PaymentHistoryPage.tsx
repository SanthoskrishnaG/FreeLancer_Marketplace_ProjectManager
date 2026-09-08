import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPaymentHistoryApi } from '../api/payment.api.js';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments-history', page],
    queryFn: () => getPaymentHistoryApi({ page, limit: 10 }),
  });

  const payments = data?.payments || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Transactions & Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payment Transaction History
          </h1>
          <p className="text-xs text-slate-400">
            Immutable settlement receipts, provider references, and gateway logs.
          </p>
        </div>

        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-400" /> Settled Payments Ledger
          </h3>
          <span className="text-xs text-slate-400">{pagination?.total || 0} Total Records</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
            <p className="text-xs text-slate-400">Fetching transaction logs...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-300 font-semibold">No payment records found</p>
            <p className="text-xs text-slate-500">
              Transactions will appear here once invoices are paid via the checkout engine.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {payments.map((p) => (
              <div
                key={p.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white">
                        {p.transactionId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {p.provider}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate">
                      {p.contract?.project?.title || 'Contract Deliverable Services'}
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                      {p.invoice && (
                        <>
                          <span>•</span>
                          <Link
                            to={`/invoices/${p.invoiceId}`}
                            className="text-brand-400 hover:underline inline-flex items-center gap-1"
                          >
                            Invoice #{p.invoice.invoiceNumber}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <p className="text-base font-extrabold text-emerald-400">
                    +${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[10px] text-slate-400 font-semibold">{p.currency}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center md:justify-end gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Settled
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
