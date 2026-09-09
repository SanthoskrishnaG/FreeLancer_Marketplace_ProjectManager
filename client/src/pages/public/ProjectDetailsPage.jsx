import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { proposalApi } from '../../api/proposalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import {
  DollarSign,
  Calendar,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Send,
  AlertCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFreelancer } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Proposal form state
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDurationDays, setEstimatedDurationDays] = useState('30');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await projectApi.getProjectById(id);
        if (res.data) {
          setProject(res.data);
          setBidAmount(String(res.data.budget || ''));
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await proposalApi.submitProposal({
        projectId: id,
        coverLetter,
        bidAmount: Number(bidAmount),
        estimatedDurationDays: Number(estimatedDurationDays),
      });
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        navigate('/freelancer/proposals');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-3/4 h-10" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-gray-400">
        <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
        <p className="text-sm mb-6">The requested project does not exist or has been removed.</p>
        <Link to="/projects" className="text-indigo-400 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Main Header */}
      <div className="glass-card p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={project.status} />
              {project.category && (
                <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">
                  {project.category.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-gray-400">
              Posted on {new Date(project.createdAt).toLocaleDateString()} by{' '}
              <span className="text-gray-200 font-semibold">{project.client?.name}</span>
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-gray-700/60 flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center bg-gray-900/60">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Fixed Budget</span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-1">
              ${Number(project.budget).toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-400 mt-1">Escrow Protected</span>

            {isFreelancer && project.status === 'OPEN' && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Proposal</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Description */}
        <div className="border-t border-gray-800/80 pt-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Project Description</h3>
          <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Required Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className="border-t border-gray-800/80 pt-6 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {s.skill?.name || s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Structured Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="glass-card p-8 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">AI-Structured Milestones Schedule</h2>
          </div>
          <div className="space-y-4">
            {project.milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800/80 space-y-2.5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">${Number(m.amount).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 pl-10 leading-relaxed">{m.description}</p>
                {m.acceptanceCriteria && (
                  <div className="pl-10 text-[11px] text-gray-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Criteria: {m.acceptanceCriteria}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposal Submission Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Your Proposal">
        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Proposal Submitted Successfully!</h3>
            <p className="text-xs text-gray-400">Redirecting to your proposals portfolio...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitProposal} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Your Bid Amount ($)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Estimated Duration (Days)</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  value={estimatedDurationDays}
                  onChange={(e) => setEstimatedDurationDays(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Cover Letter & Technical Approach</label>
              <textarea
                required
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you're the best candidate, relevant past projects, and your technical execution plan..."
                className="w-full p-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
