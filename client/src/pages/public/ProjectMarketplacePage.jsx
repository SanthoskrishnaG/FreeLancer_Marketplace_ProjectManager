import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
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

    const debounce = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedCategory, selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Opportunities</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Explore AI-Scoped Projects
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Browse verified contracts with pre-defined milestones, funded escrow protection, and direct client communication.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, title, tech stack..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
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
            className="bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Levels</option>
            <option value="ENTRY">Entry Level</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl space-y-3">
              <Skeleton className="w-1/3 h-6" />
              <Skeleton className="w-full h-12" />
              <div className="flex gap-4">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects found"
          description="There are currently no projects matching your search criteria. Try modifying your filters."
        />
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card p-6 rounded-2xl border border-gray-800 hover:border-indigo-500/40 transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      <Link to={`/projects/${project.id}`}>{project.title}</Link>
                    </h3>
                    <Badge variant={project.status} />
                    {project.category && (
                      <span className="text-xs text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-md border border-gray-700">
                        {project.category.name}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Skills tags */}
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20"
                        >
                          {s.skill?.name || s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      ${Number(project.budget).toLocaleString()} Fixed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      {project.experienceLevel} Level
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      {project._count?.proposals || 0} Proposals
                    </span>
                    {project.milestones && (
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        {project.milestones.length} AI Milestones
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 gap-3">
                  <div className="text-xs text-gray-400">
                    Posted by <span className="text-gray-200 font-medium">{project.client?.name || 'Verified Client'}</span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
