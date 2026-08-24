import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProposalsApi, withdrawProposalApi } from '../api/proposal.api.js';
import { Proposal, ProposalStatus } from '../types/index.js';
import {
  Send,
  DollarSign,
  Clock,
  Building2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { ProposalDetailsModal } from '../components/ProposalDetailsModal.js';

export const MyProposalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myProposals', activeTab, page],
    queryFn: () =>
      getMyProposalsApi({
        status: activeTab === 'ALL' ? undefined : (activeTab as ProposalStatus),
        page,
        limit: 10,
      }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => withdrawProposalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProposals'] });
      setSelectedProposal(null);
    },
  });

  const tabs = [
    { label: 'All Submissions', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Withdrawn', value: 'WITHDRAWN' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Freelance Proposals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track submitted bids, shortlisted applications, and active contracts
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-all shadow-md shadow-brand-500/10 active:scale-95 shrink-0"
        >
          <Compass className="w-4 h-4" /> Browse Marketplace
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

      {/* Content */}
      {isLoading ? (
        <div className="py-24 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your proposal history...</p>
        </div>
      ) : data?.proposals.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No proposals in this category</h3>
            <p className="text-xs text-slate-400 mt-1">
              Explore the marketplace and submit bids on exciting client projects.
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
          >
            Find Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      proposal.status === 'ACCEPTED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : proposal.status === 'SHORTLISTED'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : proposal.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : proposal.status === 'WITHDRAWN'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {proposal.status}
                  </span>

                  {proposal.project?.category && (
                    <span className="text-[11px] text-slate-400">
                      {proposal.project.category.name}
                    </span>
                  )}
                </div>

                <Link
                  to={`/projects/${proposal.projectId}`}
                  className="block text-base font-bold text-white hover:text-brand-400 transition-colors truncate"
                >
                  {proposal.project?.title || 'Project Specification'}
                </Link>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {proposal.coverLetter}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  {proposal.project?.client?.companyName && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {proposal.project.client.companyName}
                    </span>
                  )}
                  <span>Submitted on {new Date(proposal.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Price, Timeline & Action */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/80 shrink-0">
                <div className="text-left md:text-right">
                  <p className="text-sm font-extrabold text-brand-400 flex items-center md:justify-end">
                    <DollarSign className="w-4 h-4 -mr-1" />
                    {Number(proposal.bidAmount).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {proposal.estimatedDuration || '2 weeks'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>

                  {(proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED') && (
                    <button
                      onClick={() => withdrawMutation.mutate(proposal.id)}
                      disabled={withdrawMutation.isPending}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

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

      {/* Modal */}
      {selectedProposal && (
        <ProposalDetailsModal
          proposal={selectedProposal}
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onWithdraw={(id) => withdrawMutation.mutate(id)}
        />
      )}
    </div>
  );
};
