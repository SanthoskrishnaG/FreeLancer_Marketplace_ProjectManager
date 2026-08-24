import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectsApi } from '../api/project.api.js';
import { getMetaSkillsAndCategoriesApi } from '../api/profile.api.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { ProjectFilterSidebar } from '../components/ProjectFilterSidebar.js';
import { Briefcase, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectMarketplacePage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    skill: '',
    budgetType: '',
    minBudget: '',
    maxBudget: '',
    experienceLevel: '',
    sortBy: 'newest',
  });

  const [page, setPage] = useState(1);

  // Fetch categories and skills for filters
  const { data: metaData } = useQuery({
    queryKey: ['metaSkillsAndCategories'],
    queryFn: getMetaSkillsAndCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch marketplace projects
  const {
    data: projectsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['marketplaceProjects', filters, page],
    queryFn: () =>
      getProjectsApi({
        ...filters,
        page,
        limit: 9,
      }),
  });

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      skill: '',
      budgetType: '',
      minBudget: '',
      maxBudget: '',
      experienceLevel: '',
      sortBy: 'newest',
    });
    setPage(1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Opportunities
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Project Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover active projects from top clients and start bidding
          </p>
        </div>

        {/* Sort Dropdown & Post CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="deadline">Upcoming Deadline</option>
            </select>
          </div>

          <Link
            to="/projects/create"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-all shadow-md shadow-brand-500/10 active:scale-95 shrink-0"
          >
            Post a Project
          </Link>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProjectFilterSidebar
            categories={metaData?.categories || []}
            skills={metaData?.skills || []}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Projects Grid */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="py-24 text-center space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800/60">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading marketplace opportunities...</p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center space-y-3 bg-rose-500/5 rounded-3xl border border-rose-500/20 p-8">
              <p className="text-sm font-semibold text-rose-400">Failed to load projects</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : projectsData?.projects.length === 0 ? (
            <div className="py-24 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No projects found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search criteria or clear active filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Project Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsData?.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination Controls */}
              {projectsData && projectsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
                  <span>
                    Showing Page <span className="font-semibold text-white">{page}</span> of{' '}
                    <span className="font-semibold text-white">
                      {projectsData.pagination.totalPages}
                    </span>{' '}
                    ({projectsData.pagination.total} total projects)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 transition-colors text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(projectsData.pagination.totalPages, p + 1))
                      }
                      disabled={page === projectsData.pagination.totalPages}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 transition-colors text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
