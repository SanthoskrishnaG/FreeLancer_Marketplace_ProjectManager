import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyContractsApi } from '../api/contract.api.js';
import { ContractStatus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  FileCheck2,
  DollarSign,
  ChevronRight,
  Loader2,
  Building2,
  User as UserIcon,
  Layers,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['myContracts', activeTab, page],
    queryFn: () =>
      getMyContractsApi({
        status: activeTab === 'ALL' ? undefined : (activeTab as ContractStatus),
        page,
        limit: 10,
      }),
  });

  const isClient = user?.role === 'CLIENT';

  const tabs = [
    { label: 'All Contracts', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isClient ? 'Client Contracts & Milestone Escrow' : 'My Freelance Contracts'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active deliverables, milestone execution progress, and contract specifications
          </p>
        </div>

        <Link
          to="/messages"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4 text-brand-400" /> Contract Messages
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/60">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading contracts...</p>
        </div>
      ) : data?.contracts.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No contracts found in this tab</h3>
            <p className="text-xs text-slate-400 mt-1">
              Contracts are created automatically when proposal bids are accepted.
            </p>
          </div>
          <Link
            to={isClient ? '/projects/create' : '/projects'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
          >
            {isClient ? 'Create Project' : 'Browse Marketplace'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.contracts.map((contract) => {
            const clientUser = contract.client?.user;
            const freelancerUser = contract.freelancerProfile?.user;
            const otherPartyName = isClient
              ? `${freelancerUser?.firstName || 'Freelancer'} ${freelancerUser?.lastName || ''}`
              : contract.client?.companyName ||
                `${clientUser?.firstName || 'Client'} ${clientUser?.lastName || ''}`;

            return (
              <div
                key={contract.id}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        contract.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : contract.status === 'COMPLETED'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {contract.status}
                    </span>

                    <span className="text-xs text-slate-400">
                      Initiated {new Date(contract.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/contracts/${contract.id}`}
                    className="block text-lg font-bold text-white hover:text-brand-400 transition-colors truncate"
                  >
                    {contract.project?.title || 'Contract Agreement'}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      {isClient ? (
                        <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      <span className="text-slate-300 font-semibold">{otherPartyName}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      {contract.completedMilestones || 0} / {contract.totalMilestones || 0}{' '}
                      milestones
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 max-w-md pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Deliverable Progress</span>
                      <span className="font-bold text-brand-400">
                        {contract.progressPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-brand-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${contract.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Amount and Action */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-slate-400">Contract Total</p>
                    <p className="text-xl font-extrabold text-white flex items-center lg:justify-end">
                      <DollarSign className="w-4 h-4 -mr-1 text-brand-400" />
                      {Number(contract.totalAmount).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    to={`/contracts/${contract.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-md shadow-brand-500/20"
                  >
                    View Workspace <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Page <span className="font-semibold text-white">{page}</span> of{' '}
                <span className="font-semibold text-white">{data.pagination.totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 transition-colors text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 transition-colors text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
