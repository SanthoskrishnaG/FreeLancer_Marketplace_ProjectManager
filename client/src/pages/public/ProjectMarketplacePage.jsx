import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search,
  Briefcase,
  Users,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const ProjectMarketplacePage = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const catRes = await projectApi.getCategories();
        if (catRes.data) setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = {
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          experienceLevel: selectedLevel || undefined,
        };
        const res = await projectApi.getProjects(params);
        if (res.data) setProjects(res.data.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjects, 250);
    return () => clearTimeout(debounce);
  }, [search, selectedCategory, selectedLevel]);

  const hasActiveFilters = Boolean(search || selectedCategory || selectedLevel);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLevel('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>ESCROW PROTECTED CONTRACTS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Explore Projects & <span className="gradient-cyber-text">Contracts</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Explore open opportunities with automated escrow milestones, verified clients, and instant collaboration.
        </p>
      </div>

      {/* Cyber Search & Filters Bar */}
      <div className="cyber-card p-3.5 rounded-xl border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-[#111726]/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, stack, or keywords..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/20 rounded-lg text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#0D1220] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/20 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/20 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="">All Levels</option>
            <option value="ENTRY">Entry Level</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-900/30 transition-colors"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="cyber-card p-5 rounded-xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#111726]/80 space-y-3">
              <Skeleton className="w-1/3 h-5" />
              <Skeleton className="w-full h-10" />
              <div className="flex gap-3">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-20 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No matching projects found"
          description={
            hasActiveFilters
              ? 'No open opportunities matched your current search filters. Try clearing or broadening them.'
              : 'There are currently no open projects published on the marketplace.'
          }
          action={
            hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-blue-500/30 text-xs font-medium text-slate-700 dark:text-blue-300 hover:bg-slate-50 dark:hover:bg-blue-950/40"
              >
                Clear Search Filters
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium px-1 flex items-center justify-between">
            <span>Showing <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{projects.length}</span> active opportunity{projects.length !== 1 ? 's' : ''}</span>
          </div>

          {projects.map((project) => (
            <div
              key={project.id}
              className="cyber-card p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-blue-500/15 bg-white dark:bg-[#111726]/85 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Link to={`/projects/${project.id}`}>{project.title}</Link>
                    </h2>
                    <Badge variant={project.status} />
                    {project.category && (
                      <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/30">
                        {project.category.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Skills tags */}
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {project.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/20 px-2 py-0.5 rounded"
                        >
                          {s.skill?.name || s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <span className="font-bold text-slate-900 dark:text-emerald-400">
                      ₹{Number(project.budget).toLocaleString('en-IN')} <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">Fixed</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      {project.experienceLevel || 'Intermediate'} Level
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {project._count?.proposals || 0} Proposals
                    </span>
                    {project.milestones && project.milestones.length > 0 && (
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                        <Layers className="w-3.5 h-3.5" />
                        {project.milestones.length} Milestone Phases
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-blue-500/10">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Client: <span className="text-slate-800 dark:text-white font-medium">{project.client?.name || 'Verified Client'}</span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn-electric px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMarketplacePage;
