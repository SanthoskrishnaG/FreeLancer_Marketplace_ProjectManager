import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFreelancersApi, getMetaSkillsAndCategoriesApi } from '../api/profile.api.js';
import { FreelancerCard } from '../components/FreelancerCard.js';
import { Search, Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export const FreelancersDirectoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: metaData } = useQuery({
    queryKey: ['metaSkillsAndCategories'],
    queryFn: getMetaSkillsAndCategoriesApi,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['freelancers', search, skill, experienceLevel, availableOnly, page],
    queryFn: () =>
      getFreelancersApi({
        search: search || undefined,
        skill: skill || undefined,
        experienceLevel: experienceLevel || undefined,
        availableOnly: availableOnly || undefined,
        page,
        limit: 9,
      }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hire Top Freelance Talent
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified engineers, UI/UX designers, and technical product architects
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, title, bio..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Skill Select */}
        <div>
          <select
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Skills</option>
            {metaData?.skills.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <select
            value={experienceLevel}
            onChange={(e) => {
              setExperienceLevel(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Experience Levels</option>
            <option value="ENTRY">Entry Level</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert Specialist</option>
          </select>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center px-3 bg-slate-950 rounded-xl border border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer w-full">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => {
                setAvailableOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-800"
            />
            <span>Available for Hire Now</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading talent roster...</p>
        </div>
      ) : data?.freelancers.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No freelancers found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filters or keyword query.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.freelancers.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Page <span className="font-semibold text-white">{page}</span> of{' '}
                <span className="font-semibold text-white">{data.pagination.totalPages}</span>
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
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
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
  );
};
