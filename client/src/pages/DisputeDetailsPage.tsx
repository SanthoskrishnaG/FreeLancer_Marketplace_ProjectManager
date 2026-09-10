import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDisputeByIdApi,
  addDisputeMessageApi,
  updateDisputeStatusApi,
  resolveDisputeApi,
  rejectDisputeApi,
  getDisputeAuditLogsApi,
} from '../api/dispute.api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Building2,
  User as UserIcon,
  ExternalLink,
  Loader2,
  FileCheck,
  Scale,
  History,
  X,
} from 'lucide-react';

export const DisputeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const [isResolvingModal, setIsResolvingModal] = useState(false);
  const [isRejectingModal, setIsRejectingModal] = useState(false);
  const [isAuditLogsModal, setIsAuditLogsModal] = useState(false);

  // Admin form inputs
  const [adminDecision, setAdminDecision] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: dispute,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dispute', id],
    queryFn: () => getDisputeByIdApi(id!),
    enabled: !!id,
    refetchInterval: 4000, // Light polling for active dispute chat
  });

  const { data: auditLogs, refetch: refetchAuditLogs } = useQuery({
    queryKey: ['dispute-audit-logs', id],
    queryFn: () => getDisputeAuditLogsApi(id!),
    enabled: !!id && user?.role === 'ADMIN' && isAuditLogsModal,
  });

  const messageMutation = useMutation({
    mutationFn: (msg: string) => addDisputeMessageApi(id!, { message: msg }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-3" />
        <p className="text-xs text-slate-400">Loading dispute case workspace...</p>
      </div>
    );
  }

  if (isError || !dispute) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Dispute Case Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          You may not have authorization to view this dispute arbitration workspace.
        </p>
        <Link
          to="/disputes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Disputes
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const isResolved = dispute.status === 'RESOLVED';
  const isRejected = dispute.status === 'REJECTED';
  const isClosed = isResolved || isRejected;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || messageMutation.isPending) return;
    messageMutation.mutate(messageText.trim());
  };

  const handleSetUnderReview = async () => {
    setActionLoading(true);
    try {
      await updateDisputeStatusApi(dispute.id, {
        status: 'UNDER_REVIEW',
        notes: 'Admin has initiated active case review',
      });
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await resolveDisputeApi(dispute.id, {
        adminDecision,
        resolutionNotes,
      });
      setIsResolvingModal(false);
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await rejectDisputeApi(dispute.id, {
        resolutionNotes: rejectNotes,
      });
      setIsRejectingModal(false);
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
    } catch (err) {
      console.error('Failed to reject dispute:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const clientUser = dispute.contract?.client?.user;
  const freelancerUser = dispute.contract?.freelancerProfile?.user;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/disputes')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Disputes Hub
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              setIsAuditLogsModal(true);
              refetchAuditLogs();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4 text-purple-400" /> Administrative Audit Trail
          </button>
        )}
      </div>

      {/* Status Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                  isResolved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isRejected
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : dispute.status === 'UNDER_REVIEW'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {dispute.status}
              </span>

              <span className="text-xs text-slate-400">
                Initiated on {new Date(dispute.createdAt).toLocaleString()} by{' '}
                <span className="text-white font-semibold">
                  {dispute.initiator?.firstName} {dispute.initiator?.lastName} ({dispute.initiator?.role})
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {dispute.reason}
            </h1>

            <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
              {dispute.description}
            </p>
          </div>

          {/* Admin Decision Badge if Resolved/Rejected */}
          {isClosed && (
            <div
              className={`p-5 rounded-2xl border shrink-0 max-w-sm space-y-2 ${
                isResolved
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                {isResolved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Binding Resolution Rendered
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-slate-400" /> Dispute Claim Dismissed
                  </>
                )}
              </p>
              {dispute.adminDecision && (
                <p className="text-sm font-extrabold text-white">{dispute.adminDecision}</p>
              )}
              {dispute.resolutionNotes && (
                <p className="text-xs text-slate-300 leading-relaxed">{dispute.resolutionNotes}</p>
              )}
            </div>
          )}
        </div>

        {/* Evidence Section */}
        {dispute.evidence && Array.isArray(dispute.evidence) && dispute.evidence.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Submitted Evidence & Supporting Links
            </h4>
            <div className="flex flex-wrap gap-2">
              {dispute.evidence.map((item: string, idx: number) => (
                <a
                  key={idx}
                  href={item}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 text-brand-400 hover:text-brand-300 hover:border-brand-500/30 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Evidence Item #{idx + 1}{' '}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Admin Controls Panel */}
        {isAdmin && !isClosed && (
          <div className="pt-6 border-t border-slate-800/80 bg-purple-500/5 p-5 rounded-2xl border border-purple-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Administrative Decision Controls
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Arbitrate claims, communicate with parties, and enforce binding determinations.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {dispute.status === 'OPEN' && (
                  <button
                    onClick={handleSetUnderReview}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    Mark Under Review
                  </button>
                )}

                <button
                  onClick={() => setIsResolvingModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  Resolve Dispute
                </button>

                <button
                  onClick={() => setIsRejectingModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                >
                  Reject Claim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Messaging & Contract Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Message Thread */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-[600px]">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-400" /> Arbitration Case Thread
            </h3>
            <span className="text-xs text-slate-400">
              {dispute.messages?.length || 0} messages recorded
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {dispute.messages && dispute.messages.length > 0 ? (
              dispute.messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isMsgAdmin = msg.sender?.role === 'ADMIN';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-200">
                        {msg.sender?.firstName} {msg.sender?.lastName}
                      </span>
                      {isMsgAdmin && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-[9px]">
                          ADMIN
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed ${
                        isMsgAdmin
                          ? 'bg-purple-500/10 border border-purple-500/20 text-purple-200'
                          : isMe
                            ? 'bg-brand-500 text-slate-950 font-medium'
                            : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs">
                No messages yet. Post evidence or questions in this thread.
              </div>
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type message or statement for arbitrator..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || messageMutation.isPending}
              className="p-2.5 rounded-xl bg-brand-400 hover:bg-brand-300 text-slate-950 font-bold disabled:opacity-50 transition-colors"
            >
              {messageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Contract Parties Scope */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Disputed Contract Spec
            </h3>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-white leading-snug">
                {dispute.contract?.project?.title}
              </p>
              <Link
                to={`/contracts/${dispute.contractId}`}
                className="text-[11px] text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                Inspect Contract Workspace <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Parties */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-purple-400 font-bold uppercase">Client</p>
                  <p className="font-bold text-white">
                    {clientUser?.firstName} {clientUser?.lastName}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-400 font-bold uppercase">Freelancer</p>
                  <p className="font-bold text-white">
                    {freelancerUser?.firstName} {freelancerUser?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Resolve Modal */}
      {isResolvingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" /> Resolve Dispute Case
              </h3>
              <button onClick={() => setIsResolvingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Binding Admin Decision Summary
                </label>
                <input
                  type="text"
                  value={adminDecision}
                  onChange={(e) => setAdminDecision(e.target.value)}
                  placeholder="e.g., Release 50% escrow to freelancer, 50% refund to client"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Comprehensive Resolution Notes & Justification
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document the analysis of evidence, deliverables completed, and reason for determination..."
                  rows={4}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResolvingModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !adminDecision || !resolutionNotes}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {actionLoading ? 'Executing...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reject Modal */}
      {isRejectingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" /> Dismiss / Reject Claim
              </h3>
              <button onClick={() => setIsRejectingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Rejection Reason & Grounding
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Explain why the claim lacked sufficient evidence or did not breach contract deliverables..."
                  rows={4}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectingModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectNotes}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Executing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Audit Trail Modal */}
      {isAuditLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" /> Administrative Decision Audit Trail
              </h3>
              <button onClick={() => setIsAuditLogsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                        Action: {log.action}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl overflow-x-auto">
                      {log.details}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                      <span>Administrator: {log.user?.firstName} {log.user?.lastName}</span>
                      {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No administrative audit records logged yet for this dispute.
                </div>
              )}
            </div>

            <button
              onClick={() => setIsAuditLogsModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Close Audit Trail
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
