import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyProjectsApi,
  deleteDraftProjectApi,
  updateProjectStatusApi,
} from '../api/project.api.js';
import { Briefcase, Plus, Edit, Trash2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { AIMilestoneGeneratorModal } from '../components/AIMilestoneGeneratorModal.js';
import { Project } from '../types/index.js';

export const MyProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedAIProject, setSelectedAIProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['myProjects', activeTab],
    queryFn: () => getMyProjectsApi(activeTab === 'ALL' ? undefined : activeTab),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDraftProjectApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED';
    }) => updateProjectStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
  });

  const tabs = [
    { label: 'All Projects', value: 'ALL' },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Client Project Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your project lifecycles, milestones, drafts, and active postings
          </p>
        </div>

        <Link
          to="/projects/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-all shadow-md shadow-brand-500/10 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Post New Project
        </Link>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/60">
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

      {/* Content */}
      {isLoading ? (
        <div className="py-24 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your project roster...</p>
        </div>
      ) : projects?.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No projects found in this tab</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a new draft or publish an opportunity to the marketplace.
            </p>
          </div>
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Project Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 backdrop-blur-xl hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
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
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {project.category.name}
                    </span>
                  )}
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="block text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2"
                >
                  {project.title}
                </Link>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    Budget:{' '}
                    <strong className="text-brand-400">
                      ${Number(project.budget).toLocaleString()}
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    Proposals:{' '}
                    <strong className="text-white">{project._count?.proposals || 0}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/projects/${project.id}/edit`}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
                    title="Edit Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setSelectedAIProject(project)}
                    className="p-2 rounded-xl text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors"
                    title="AI Milestone Generator"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {project.status === 'DRAFT' && (
                    <button
                      onClick={() => deleteMutation.mutate(project.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {project.status === 'DRAFT' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: project.id, status: 'PUBLISHED' })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      Publish
                    </button>
                  )}

                  {project.status === 'PUBLISHED' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: project.id, status: 'CANCELLED' })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Milestone Modal */}
      {selectedAIProject && (
        <AIMilestoneGeneratorModal
          projectId={selectedAIProject.id}
          projectTitle={selectedAIProject.title}
          projectBudget={Number(selectedAIProject.budget)}
          existingRequirements={selectedAIProject.requirements}
          isOpen={!!selectedAIProject}
          onClose={() => setSelectedAIProject(null)}
          onMilestonesSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['myProjects'] });
          }}
        />
      )}
    </div>
  );
};
