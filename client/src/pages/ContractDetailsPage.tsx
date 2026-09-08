import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getContractByIdApi } from '../api/contract.api.js';
import { generateInvoiceApi, getInvoicesApi } from '../api/invoice.api.js';
import { getContractReviewsApi } from '../api/review.api.js';
import { MilestoneTimeline } from '../components/MilestoneTimeline.js';
import { ReviewModal } from '../components/ReviewModal.js';
import { RaiseDisputeModal } from '../components/RaiseDisputeModal.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Building2,
  User as UserIcon,
  MessageSquare,
  ArrowLeft,
  FileCheck2,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Layers,
  FileText,
  Scale,
  Star,
  AlertTriangle,
} from 'lucide-react';

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const {
    data: contract,
    isLoading,
    isError,
    refetch: refetchContract,
  } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => getContractByIdApi(id!),
    enabled: !!id,
  });

  const { data: contractInvoices, refetch: refetchInvoices } = useQuery({
    queryKey: ['contract-invoices', id],
    queryFn: () => getInvoicesApi({ contractId: id! }),
    enabled: !!id,
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['contract-reviews', id],
    queryFn: () => getContractReviewsApi(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-3" />
        <p className="text-xs text-slate-400">Loading contract workspace...</p>
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Contract not found</h2>
        <p className="text-xs text-slate-400 mb-6">
          You may not have authorization to view this contract workspace.
        </p>
        <Link
          to="/contracts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Contracts
        </Link>
      </div>
    );
  }

  const clientUser = contract.client?.user;
  const freelancerUser = contract.freelancerProfile?.user;
  const isClient = user?.role === 'CLIENT';

  const recipientName = isClient
    ? `${freelancerUser?.firstName} ${freelancerUser?.lastName}`
    : `${clientUser?.firstName} ${clientUser?.lastName}`;

  const hasReviewed = reviews?.some((r) => r.authorId === user?.id);
  const invoicesList = contractInvoices?.invoices || [];

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      const invoice = await generateInvoiceApi({
        contractId: contract.id,
      });
      refetchInvoices();
      navigate(`/invoices/${invoice.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/contracts')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Contracts Hub
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDisputeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
          >
            <Scale className="w-3.5 h-3.5" /> Raise Dispute
          </button>
        </div>
      </div>

      {/* Disputed Alert Banner if applicable */}
      {contract.status === 'DISPUTED' && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-300">Contract Under Arbitration</p>
              <p className="text-[11px] text-slate-400">
                A dispute has been raised on this contract. An administrator is mediating the claim.
              </p>
            </div>
          </div>
          <Link
            to="/disputes"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-400 transition-colors"
          >
            View Dispute Case
          </Link>
        </div>
      )}

      {/* Contract Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  contract.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : contract.status === 'COMPLETED'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : contract.status === 'DISPUTED'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {contract.status}
              </span>

              {contract.project?.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Layers className="w-3.5 h-3.5" /> {contract.project.category.name}
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Escrow Protected
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {contract.project?.title || 'Contract Workspace'}
            </h1>

            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
              <span>Initiated on {new Date(contract.startDate).toLocaleDateString()}</span>
              {contract.endDate && (
                <span>• Concluded on {new Date(contract.endDate).toLocaleDateString()}</span>
              )}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20"
            >
              <MessageSquare className="w-4 h-4" /> Project Chat
            </Link>

            {invoicesList.length > 0 ? (
              <Link
                to={`/invoices/${invoicesList[0].id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <FileText className="w-4 h-4 text-brand-400" /> View Invoice ({invoicesList[0].status})
              </Link>
            ) : (
              <button
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 disabled:opacity-50"
              >
                {isGeneratingInvoice ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                ) : (
                  <FileText className="w-4 h-4 text-brand-400" />
                )}
                Generate Invoice
              </button>
            )}

            {contract.status === 'COMPLETED' && !hasReviewed && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Star className="w-4 h-4 fill-slate-950" /> Leave Review
              </button>
            )}

            {contract.projectId && (
              <Link
                to={`/projects/${contract.projectId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Project Spec <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Quick Contract Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400">Total Contract Value</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              ${Number(contract.totalAmount).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">Total Milestones</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {contract.totalMilestones || contract.milestones?.length || 0} Phases
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">Completed Phases</p>
            <p className="text-lg font-extrabold text-brand-400 mt-0.5">
              {contract.completedMilestones || 0} Phases
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">Overall Progress</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
              {contract.progressPercentage || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Deliverables & Parties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Milestone Deliverables Schedule & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-brand-400" /> Milestone Deliverables Schedule
            </h2>

            <MilestoneTimeline contract={contract} milestones={contract.milestones || []} />
          </div>

          {/* Contract Reviews Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Performance Reviews & Ratings
              </h3>
              {contract.status === 'COMPLETED' && !hasReviewed && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  + Add Your Review
                </button>
              )}
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                          {rev.author?.firstName?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {rev.author?.firstName} {rev.author?.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {rev.author?.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500">
                {contract.status === 'COMPLETED'
                  ? 'No reviews submitted yet for this contract.'
                  : 'Reviews will become unlockable once all contract phases are concluded and marked COMPLETED.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parties & Terms */}
        <div className="space-y-6">
          {/* Client & Freelancer Cards */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Contract Parties
            </h3>

            {/* Client Party */}
            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                {clientUser?.avatarUrl ? (
                  <img
                    src={clientUser.avatarUrl}
                    alt={clientUser.firstName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  Client Party
                </p>
                <p className="text-xs font-bold text-white truncate">
                  {contract.client?.companyName ||
                    `${clientUser?.firstName} ${clientUser?.lastName}`}
                </p>
                {clientUser?.location && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{clientUser.location}</p>
                )}
              </div>
            </div>

            {/* Freelancer Party */}
            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                {freelancerUser?.avatarUrl ? (
                  <img
                    src={freelancerUser.avatarUrl}
                    alt={freelancerUser.firstName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                  Freelance Engineer
                </p>
                <Link
                  to={`/freelancers/${contract.freelancerProfile?.id}`}
                  className="text-xs font-bold text-white hover:text-brand-400 transition-colors truncate block"
                >
                  {freelancerUser?.firstName} {freelancerUser?.lastName}
                </Link>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {contract.freelancerProfile?.title || 'Engineer'}
                </p>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Terms & Legal Scope
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {contract.terms ||
                'Standard freelancer milestone agreement. Funds released upon milestone deliverables approval.'}
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          contractId={contract.id}
          contractTitle={contract.project?.title || 'Contract Deliverables'}
          recipientName={recipientName}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={() => {
            refetchReviews();
            refetchContract();
          }}
        />
      )}

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <RaiseDisputeModal
          contractId={contract.id}
          contractTitle={contract.project?.title || 'Contract Workspace'}
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onDisputeCreated={() => {
            refetchContract();
          }}
        />
      )}
    </div>
  );
};
