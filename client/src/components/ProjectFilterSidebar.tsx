import React from 'react';
import { Category, Skill } from '../types/index.js';
import { Filter, RotateCcw, Search } from 'lucide-react';

interface ProjectFiltersProps {
  categories: Category[];
  skills: Skill[];
  filters: {
    search: string;
    category: string;
    skill: string;
    budgetType: string;
    minBudget: string;
    maxBudget: string;
    experienceLevel: string;
    sortBy: string;
  };
  onFilterChange: (newFilters: any) => void;
  onReset: () => void;
}

export const ProjectFilterSidebar: React.FC<ProjectFiltersProps> = ({
  categories,
  skills,
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6 backdrop-blur-xl">
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-400" /> Filters
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="e.g. React, SaaS, Mobile"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Skill Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Required Skill</label>
        <select
          value={filters.skill}
          onChange={(e) => handleChange('skill', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Skills</option>
          {skills.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Experience Level
        </label>
        <div className="space-y-1.5">
          {[
            { label: 'All Levels', value: '' },
            { label: 'Entry Level', value: 'ENTRY' },
            { label: 'Intermediate', value: 'INTERMEDIATE' },
            { label: 'Expert Specialist', value: 'EXPERT' },
          ].map((lvl) => (
            <label
              key={lvl.value}
              className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
            >
              <input
                type="radio"
                name="experienceLevel"
                checked={filters.experienceLevel === lvl.value}
                onChange={() => handleChange('experienceLevel', lvl.value)}
                className="text-brand-500 focus:ring-brand-500 bg-slate-950 border-slate-800"
              />
              <span>{lvl.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Budget Type</label>
        <select
          value={filters.budgetType}
          onChange={(e) => handleChange('budgetType', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">Any Type</option>
          <option value="FIXED">Fixed Price</option>
          <option value="HOURLY">Hourly Rate</option>
        </select>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Budget Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minBudget}
            onChange={(e) => handleChange('minBudget', e.target.value)}
            placeholder="Min"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <input
            type="number"
            value={filters.maxBudget}
            onChange={(e) => handleChange('maxBudget', e.target.value)}
            placeholder="Max"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
