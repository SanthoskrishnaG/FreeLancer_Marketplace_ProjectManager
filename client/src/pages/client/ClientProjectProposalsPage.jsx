import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { proposalApi } from '../../api/proposalApi.js';
import { projectApi } from '../../api/projectApi.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  DollarSign,
  Clock,
  Star,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  FileCheck2,
} from 'lucide-react';

export const ClientProjectProposalsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchProposals = async () => {
    try {
      const [projRes, propRes] = await Promise.all([
        projectApi.getProjectById(projectId),
        proposalApi.getProjectProposals(projectId),
      ]);
      if (projRes.data) setProject(projRes.data);
      if (propRes.data) setProposals(propRes.data);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [projectId]);

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm('Accept this proposal? An active contract will be generated in PostgreSQL.')) return;
    setAcceptingId(proposalId);
    try {
      await proposalApi.acceptProposal(proposalId);
      navigate('/client/contracts');
    } catch (err) {
      alert(err.message || 'Failed to accept proposal');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await proposalApi.rejectProposal(proposalId);
      fetchProposals();
    } catch (err) {
      alert(err.message || 'Failed to reject proposal');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/client/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Projects</span>
      </Link>

      {/* Project Header Summary */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Candidate Proposals</span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-0.5">{project?.title}</h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Budget: <span className="text-slate-800 dark:text-emerald-400 font-bold">₹{Number(project?.budget).toLocaleString('en-IN')}</span> • Received:{' '}
            <span className="text-slate-800 dark:text-white font-semibold">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No proposals received yet"
          description="Candidates are currently browsing the marketplace. New proposals will appear here as they are submitted."
        />
      ) : (
        <div className="space-y-3.5">
          {proposals.map((prop) => {
            const freelancer = prop.freelancer || {};
            const profile = freelancer.freelancerProfile || {};
            const isPending = prop.status === 'PENDING';

            return (
              <div
                key={prop.id}
                className="cyber-card bg-white dark:bg-[#111726]/85 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-blue-500/15 hover:dark:border-blue-500/30 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={freelancer.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${freelancer.name}`}
                      alt={freelancer.name}
                      className="w-12 h-12 rounded-xl object-cover border border-blue-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">{freelancer.name}</h2>
                        <Badge variant={prop.status} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8]">{profile.title || 'Specialist'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          {Number(profile.rating || 5.0).toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{profile.completedProjectsCount || 0} completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-0.5 bg-slate-50 dark:bg-[#0D1220] px-3.5 py-2 rounded-xl border border-slate-200/70 dark:border-blue-500/20">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bid Amount</span>
                    <span className="text-base font-bold text-slate-900 dark:text-emerald-400">
                      ₹{Number(prop.bidAmount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Est: {prop.estimatedDuration || `${prop.estimatedDurationDays || 14} days`}
                    </span>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="bg-slate-50 dark:bg-[#0D1220]/70 p-4 rounded-xl border border-slate-200/70 dark:border-blue-500/15">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-blue-400 mb-1">
                    Candidate Proposal:
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {prop.coverLetter}
                  </p>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-blue-500/10">
                    <button
                      onClick={() => handleRejectProposal(prop.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-blue-500/20 hover:bg-slate-50 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptProposal(prop.id)}
                      disabled={acceptingId === prop.id}
                      className="btn-electric px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                    >
                      {acceptingId === prop.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Accept & Start Contract</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProjectProposalsPage;
