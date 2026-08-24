import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectByIdApi,
  updateProjectStatusApi,
  toggleProjectBookmarkApi,
} from '../api/project.api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  DollarSign,
  Calendar,
  Building2,
  Bookmark,
  Sparkles,
  Edit,
  CheckCircle2,
  Users,
  Layers,
  ArrowLeft,
  Loader2,
  Clock,
  ListChecks,
} from 'lucide-react';
import { AIMilestoneGeneratorModal } from '../components/AIMilestoneGeneratorModal.js';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectByIdApi(id!),
    enabled: !!id,
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleProjectBookmarkApi(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceProjects'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED') =>
      updateProjectStatusApi(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-3" />
        <p className="text-xs text-slate-400">Loading project specification...</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Project not found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested project might have been removed or is no longer available.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && project.client?.user?.id === user.id;

  const formattedBudget =
    project.budgetType === 'HOURLY'
      ? `$${project.minBudget || project.budget} - $${project.maxBudget || project.budget}/hr`
      : `$${Number(project.budget).toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Main Title & Action Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  project.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : project.status === 'DRAFT'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {project.status}
              </span>

              {project.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Layers className="w-3.5 h-3.5" /> {project.category.name}
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {project.budgetType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {project.title}
            </h1>

            <p className="text-xs text-slate-400 flex items-center gap-4">
              <span>Posted on {new Date(project.createdAt).toLocaleDateString()}</span>
              {project.deadline && (
                <span>• Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              )}
            </p>
          </div>

          {/* Action Panel */}
          <div className="flex flex-wrap items-center gap-3">
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-brand-400 to-emerald-400 hover:from-brand-300 hover:to-emerald-300 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" /> AI Generate Milestones
                </button>

                <Link
                  to={`/projects/${project.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit Project
                </Link>

                {project.status === 'DRAFT' && (
                  <button
                    onClick={() => statusMutation.mutate('PUBLISHED')}
                    disabled={statusMutation.isPending}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                  >
                    Publish to Marketplace
                  </button>
                )}

                {project.status === 'PUBLISHED' && (
                  <button
                    onClick={() => statusMutation.mutate('CANCELLED')}
                    disabled={statusMutation.isPending}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                  >
                    Cancel Project
                  </button>
                )}
              </>
            ) : (
              <>
                {isAuthenticated && (
                  <button
                    onClick={() => bookmarkMutation.mutate()}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      project.isBookmarked
                        ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                        : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${project.isBookmarked ? 'fill-brand-400' : ''}`}
                    />
                    {project.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                )}

                <button
                  disabled
                  title="Proposal submission will be implemented in Phase 4"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400/60 cursor-not-allowed opacity-80"
                >
                  Submit Proposal (Phase 4)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Spec Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-brand-400" /> Budget
            </p>
            <p className="text-base font-bold text-brand-400 mt-1">{formattedBudget}</p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Experience Level
            </p>
            <p className="text-base font-bold text-white mt-1">{project.experienceLevel}</p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Proposals Received
            </p>
            <p className="text-base font-bold text-white mt-1">
              {project._count?.proposals || project.proposalCount || 0}
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Project Milestones
            </p>
            <p className="text-base font-bold text-white mt-1">
              {project.milestones?.length || 0} Phases
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Client Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Description, Requirements & Milestones */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">Project Overview & Description</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </div>

            {project.requirements && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Technical Requirements & Scope
                </h3>
                <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {project.requirements}
                </div>
              </div>
            )}

            {/* Required Skills */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skills?.map(({ skill }) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-brand-400"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Project Milestones List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-brand-400" /> Structured Project Milestones
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Phased deliverables and escrow budget release schedule
                </p>
              </div>

              {isOwner && (
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Generator
                </button>
              )}
            </div>

            {project.milestones && project.milestones.length > 0 ? (
              <div className="space-y-4">
                {project.milestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{m.title}</h4>
                          {m.estimatedDuration && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" /> {m.estimatedDuration}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-extrabold text-emerald-400">
                          ${Number(m.amount).toLocaleString()}
                        </p>
                        {m.budgetPercentage && (
                          <p className="text-[11px] text-slate-400">
                            {m.budgetPercentage}% of budget
                          </p>
                        )}
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-xs text-slate-300 leading-relaxed pl-10">
                        {m.description}
                      </p>
                    )}

                    {/* Deliverables & Criteria */}
                    <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-2">
                      {m.deliverables && m.deliverables.length > 0 && (
                        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                          <span className="font-semibold text-slate-300 block mb-1">
                            Deliverables:
                          </span>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            {m.deliverables.map((del, dIdx) => (
                              <li key={dIdx} className="truncate">
                                {del}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.acceptanceCriteria && m.acceptanceCriteria.length > 0 && (
                        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                          <span className="font-semibold text-slate-300 block mb-1">
                            Acceptance Criteria:
                          </span>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            {m.acceptanceCriteria.map((crit, cIdx) => (
                              <li key={cIdx} className="truncate">
                                {crit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
                <p className="text-xs text-slate-400">
                  No structured milestones defined for this project yet.
                </p>
                {isOwner && (
                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Milestones with AI
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Client Profile Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" /> About the Client
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-extrabold text-base flex items-center justify-center">
                {project.client?.companyName?.[0] || project.client?.user?.firstName?.[0] || 'C'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {project.client?.companyName ||
                    `${project.client?.user?.firstName} ${project.client?.user?.lastName}`}
                </h4>
                <p className="text-xs text-slate-400">
                  {project.client?.user?.location || 'Global Client'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-800/80">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Client Rating</span>
                <span className="text-amber-400 font-semibold">
                  ⭐ {Number(project.client?.rating || 5.0).toFixed(1)} / 5
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total Spent</span>
                <span className="text-emerald-400 font-semibold">
                  ${Number(project.client?.totalSpent || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Identity Verification</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Milestone Modal */}
      <AIMilestoneGeneratorModal
        projectId={project.id}
        projectTitle={project.title}
        projectBudget={Number(project.budget)}
        existingRequirements={project.requirements}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onMilestonesSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['project', id] });
        }}
      />
    </div>
  );
};
