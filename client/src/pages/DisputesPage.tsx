import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDisputesApi } from '../api/dispute.api.js';
import { DisputeStatus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  Loader2,
  Building2,
  Scale,
} from 'lucide-react';

export const DisputesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<DisputeStatus | 'ALL'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['disputes', selectedStatus],
    queryFn: () =>
      getDisputesApi({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      }),
  });

  const disputes = data?.disputes || [];
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Scale className="w-3.5 h-3.5 inline mr-1" /> Dispute Resolution Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Contract Claims & Dispute Management
          </h1>
          <p className="text-xs text-slate-400">
            {isAdmin
              ? 'Administrative dispute arbitration workspace: inspect evidence, mediate, and render binding decisions.'
              : 'Fair dispute arbitration for contract milestones, escrow protection, and resolution.'}
          </p>
        </div>

        <Link
          to="/contracts"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
        >
          View Contracts
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as const).map((status) => (
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

      {/* Disputes List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading dispute records...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No active dispute claims</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All your contract collaborations are in good standing without any arbitration claims.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            const isResolved = dispute.status === 'RESOLVED';
            const isRejected = dispute.status === 'REJECTED';
            const isUnderReview = dispute.status === 'UNDER_REVIEW';

            return (
              <div
                key={dispute.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isRejected
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : isUnderReview
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isRejected
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : isUnderReview
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {dispute.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Initiated by {dispute.initiator?.firstName} {dispute.initiator?.lastName} ({dispute.initiator?.role})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {dispute.reason}
                    </h3>

                    <p className="text-xs text-slate-300">
                      Contract: {dispute.contract?.project?.title || 'Deliverables Scope'}
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Opened on {new Date(dispute.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {dispute._count?.messages || 0} messages in thread
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <Link
                    to={`/disputes/${dispute.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20"
                  >
                    Open Workspace <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
