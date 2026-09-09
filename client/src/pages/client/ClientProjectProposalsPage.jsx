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
  XCircle,
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
    if (!window.confirm('Accept this proposal? A contract will be automatically generated.')) return;
    setAcceptingId(proposalId);
    try {
      const res = await proposalApi.acceptProposal(proposalId);
      alert('Proposal accepted! Contract generated successfully.');
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
      <div className="space-y-6">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/client/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Projects
      </Link>

      <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Proposals for:</span>
          <h1 className="text-xl font-bold text-white mt-0.5">{project?.title}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Budget: <span className="text-emerald-400 font-semibold">${Number(project?.budget).toLocaleString()}</span> • Received:{' '}
            <span className="text-white font-semibold">{proposals.length} proposal(s)</span>
          </p>
        </div>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No proposals received yet"
          description="Freelancers are discovering your project. Check back shortly."
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => {
            const freelancer = prop.freelancer || {};
            const profile = freelancer.freelancerProfile || {};
            const isPending = prop.status === 'PENDING';

            return (
              <div
                key={prop.id}
                className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={freelancer.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${freelancer.name}`}
                      alt={freelancer.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{freelancer.name}</h3>
                        <Badge variant={prop.status} />
                      </div>
                      <p className="text-xs text-gray-400">{profile.title || 'Freelancer'}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {Number(profile.rating || 5.0).toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{profile.completedProjectsCount || 0} completed jobs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-400">Bid Amount</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      ${Number(prop.bidAmount).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      in ~{prop.estimatedDurationDays || 30} days
                    </span>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Cover Letter & Approach:
                  </h4>
                  <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {prop.coverLetter}
                  </p>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleRejectProposal(prop.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptProposal(prop.id)}
                      disabled={acceptingId === prop.id}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                    >
                      {acceptingId === prop.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4" />
                          <span>Accept & Create Contract</span>
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
