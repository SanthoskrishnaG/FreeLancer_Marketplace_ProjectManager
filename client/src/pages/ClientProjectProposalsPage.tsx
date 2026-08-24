import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectByIdApi } from '../api/project.api.js';
import {
  getProjectProposalsApi,
  shortlistProposalApi,
  rejectProposalApi,
  acceptProposalApi,
} from '../api/proposal.api.js';
import { Proposal, ProposalStatus } from '../types/index.js';
import {
  Star,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowLeft,
  ArrowUpDown,
  Loader2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { ProposalDetailsModal } from '../components/ProposalDetailsModal.js';

export const ClientProjectProposalsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'bid_low' | 'bid_high' | 'rating'>('newest');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectByIdApi(id!),
    enabled: !!id,
  });

  const { data: proposalsData, isLoading: isProposalsLoading } = useQuery({
    queryKey: ['projectProposals', id, activeTab, sortBy],
    queryFn: () =>
      getProjectProposalsApi(id!, {
        status: activeTab === 'ALL' ? undefined : (activeTab as ProposalStatus),
        sortBy,
      }),
    enabled: !!id,
  });

  const shortlistMutation = useMutation({
    mutationFn: (proposalId: string) => shortlistProposalApi(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectProposals', id] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (proposalId: string) => rejectProposalApi(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectProposals', id] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => acceptProposalApi(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectProposals', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
  });

  if (isProjectLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-lg font-bold text-white">Project not found</h2>
      </div>
    );
  }

  const tabs = [
    { label: 'All Proposals', value: 'ALL' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Pending Review', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project Specification
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  project.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}
              >
                {project.status}
              </span>
              <span className="text-xs text-slate-400">
                Budget: ${Number(project.budget).toLocaleString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Proposal Comparison: {project.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compare candidate skill matches, portfolio samples, ratings, and bid pricing
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center sm:text-right shrink-0">
            <p className="text-[11px] text-slate-400">Total Applicants</p>
            <p className="text-2xl font-extrabold text-brand-400 mt-0.5">
              {proposalsData?.pagination.total || 0} Proposals
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
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

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rating</option>
            <option value="bid_low">Lowest Proposed Price</option>
            <option value="bid_high">Highest Proposed Price</option>
          </select>
        </div>
      </div>

      {/* Proposals Comparison List */}
      {isProposalsLoading ? (
        <div className="py-24 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading candidate proposals...</p>
        </div>
      ) : proposalsData?.proposals.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No proposals in this view</h3>
            <p className="text-xs text-slate-400 mt-1">
              Check other tabs or wait for freelancers to apply.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {proposalsData?.proposals.map((proposal) => {
            const freelancer = proposal.freelancerProfile;
            const fUser = freelancer?.user;
            const portfolio = (freelancer?.portfolio as any[]) || [];

            const priceDiff = Number(proposal.bidAmount) - Number(project.budget);
            const priceDiffPercent = Math.round((priceDiff / Number(project.budget)) * 100);

            return (
              <div
                key={proposal.id}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl hover:border-slate-700 transition-all space-y-6"
              >
                {/* Top Row: Candidate Header + Pricing Comparison */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md">
                      {fUser?.avatarUrl ? (
                        <img
                          src={fUser.avatarUrl}
                          alt={fUser.firstName}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        `${fUser?.firstName?.[0] || 'F'}${fUser?.lastName?.[0] || 'L'}`
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/freelancers/${freelancer?.id}`}
                          className="text-base font-bold text-white hover:text-brand-400 transition-colors"
                        >
                          {fUser?.firstName} {fUser?.lastName}
                        </Link>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            proposal.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : proposal.status === 'SHORTLISTED'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : proposal.status === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-brand-400 mt-0.5">
                        {freelancer?.title || 'Full Stack Engineer'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {Number(freelancer?.rating || 5.0).toFixed(1)} (
                          {freelancer?.reviewCount || 0})
                        </span>
                        <span className="text-slate-300 font-medium">
                          ${Number(freelancer?.hourlyRate || 75).toFixed(0)}/hr
                        </span>
                        <span className="text-emerald-400 font-medium">
                          ${Number(freelancer?.totalEarned || 0).toLocaleString()} earned
                        </span>
                        {freelancer?.country && (
                          <span className="text-slate-400">{freelancer.country}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bid Pricing Compared to Project Budget */}
                  <div className="flex items-center gap-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
                    <div>
                      <p className="text-[11px] text-slate-400">Proposed Bid</p>
                      <p className="text-xl font-extrabold text-white">
                        ${Number(proposal.bidAmount).toLocaleString()}
                      </p>
                    </div>

                    <div className="border-l border-slate-800 pl-4">
                      <p className="text-[11px] text-slate-400">Duration</p>
                      <p className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {proposal.estimatedDuration || '2 weeks'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {priceDiff === 0
                          ? 'Exact budget match'
                          : priceDiff > 0
                            ? `+${priceDiffPercent}% above budget`
                            : `${priceDiffPercent}% below budget`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Cover Letter Excerpt & Skills */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Proposal Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  {/* Skills Match */}
                  {freelancer?.skills && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-brand-400" /> Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {freelancer.skills.map(({ id, skill, proficiency }) => (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-medium"
                          >
                            {skill.name} {proficiency && `(${proficiency})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Quick Links */}
                  {portfolio.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <span className="text-slate-400 font-semibold">Portfolio Proofs:</span>
                      {portfolio.slice(0, 3).map((item, pIdx) => (
                        <a
                          key={pIdx}
                          href={item.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
                        >
                          {item.title} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setSelectedProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Full Proposal & Milestones
                  </button>

                  <div className="flex items-center gap-2">
                    {proposal.status === 'PENDING' && (
                      <button
                        onClick={() => shortlistMutation.mutate(proposal.id)}
                        disabled={shortlistMutation.isPending}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors"
                      >
                        Shortlist Candidate
                      </button>
                    )}

                    {proposal.status !== 'REJECTED' && proposal.status !== 'ACCEPTED' && (
                      <button
                        onClick={() => rejectMutation.mutate(proposal.id)}
                        disabled={rejectMutation.isPending}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}

                    {proposal.status !== 'ACCEPTED' && (
                      <button
                        onClick={() => acceptMutation.mutate(proposal.id)}
                        disabled={acceptMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept Proposal & Start Contract
                      </button>
                    )}

                    {proposal.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Contract Initiated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedProposal && (
        <ProposalDetailsModal
          proposal={selectedProposal}
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onShortlist={(id) => {
            shortlistMutation.mutate(id);
            setSelectedProposal(null);
          }}
          onReject={(id) => {
            rejectMutation.mutate(id);
            setSelectedProposal(null);
          }}
          onAccept={(id) => {
            acceptMutation.mutate(id);
            setSelectedProposal(null);
          }}
        />
      )}
    </div>
  );
};
