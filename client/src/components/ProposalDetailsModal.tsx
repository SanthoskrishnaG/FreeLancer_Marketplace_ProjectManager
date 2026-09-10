import React from 'react';
import { Proposal } from '../types/index.js';
import {
  X,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface ProposalDetailsModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: (id: string) => void;
  onReject?: (id: string) => void;
  onAccept?: (id: string) => void;
  onWithdraw?: (id: string) => void;
}

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onShortlist,
  onReject,
  onAccept,
  onWithdraw,
}) => {
  const { user } = useAuth();

  if (!isOpen || !proposal) return null;

  const freelancer = proposal.freelancerProfile;
  const fUser = freelancer?.user;
  const isClient = user?.role === 'CLIENT' || user?.role === 'ADMIN';
  const isAuthor =
    user &&
    freelancer &&
    (freelancer.user?.id === user.id || freelancer.id === user.freelancerProfile?.id);

  const portfolioItems = (freelancer?.portfolio as any[]) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
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
                <h3 className="text-lg font-bold text-white">
                  {fUser?.firstName} {fUser?.lastName}
                </h3>
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
                {freelancer?.title || 'Senior Software Specialist'}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {Number(freelancer?.rating || 5.0).toFixed(1)} ({freelancer?.reviewCount || 0}{' '}
                  reviews)
                </span>
                {(freelancer?.country || fUser?.location) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {freelancer?.country || fUser?.location}
                  </span>
                )}
                <span>Submitted {new Date(proposal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-400" /> Proposed Bid
              </p>
              <p className="text-base font-bold text-brand-400 mt-0.5">
                ${Number(proposal.bidAmount).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Estimated Timeline
              </p>
              <p className="text-base font-bold text-white mt-0.5">
                {proposal.estimatedDuration || '2 weeks'}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Hourly Rate
              </p>
              <p className="text-base font-bold text-white mt-0.5">
                ${Number(freelancer?.hourlyRate || 75).toFixed(0)}/hr
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cover Letter & Proposal Pitch
            </h4>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {proposal.coverLetter}
            </div>
          </div>

          {/* Milestone Pricing Breakdown */}
          {proposal.milestonePricing && proposal.milestonePricing.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Proposed Milestone Pricing
              </h4>
              <div className="space-y-2">
                {proposal.milestonePricing.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white">{m.title}</span>
                      {m.duration && (
                        <span className="text-[10px] text-slate-400 ml-1">({m.duration})</span>
                      )}
                    </div>
                    <span className="font-extrabold text-emerald-400">
                      ${Number(m.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Freelancer Verified Skills */}
          {freelancer?.skills && freelancer.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-400" /> Specialist Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {freelancer.skills.map(({ id, skill, proficiency }) => (
                  <span
                    key={id}
                    className="px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium"
                  >
                    {skill.name}{' '}
                    {proficiency && (
                      <span className="text-brand-400 text-[10px] ml-1">({proficiency})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Links */}
          {portfolioItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-400" /> Portfolio Showcase
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portfolioItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{item.title}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1"
                        >
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isAuthor &&
              (proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED') &&
              onWithdraw && (
                <button
                  onClick={() => onWithdraw(proposal.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  Withdraw Proposal
                </button>
              )}

            {isClient && proposal.status === 'PENDING' && onShortlist && (
              <button
                onClick={() => onShortlist(proposal.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors"
              >
                Shortlist
              </button>
            )}

            {isClient &&
              proposal.status !== 'REJECTED' &&
              proposal.status !== 'ACCEPTED' &&
              onReject && (
                <button
                  onClick={() => onReject(proposal.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              )}

            {isClient && proposal.status !== 'ACCEPTED' && onAccept && (
              <button
                onClick={() => onAccept(proposal.id)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-all shadow-md shadow-brand-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Proposal & Start Contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
