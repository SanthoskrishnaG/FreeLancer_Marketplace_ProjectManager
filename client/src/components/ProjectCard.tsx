import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types/index.js';
import {
  Calendar,
  DollarSign,
  Bookmark,
  Building2,
  Clock,
  CheckCircle2,
  Users,
  Layers,
} from 'lucide-react';
import { toggleProjectBookmarkApi } from '../api/project.api.js';
import { useAuth } from '../context/AuthContext.js';

interface ProjectCardProps {
  project: Project;
  onBookmarkToggle?: (projectId: string, isBookmarked: boolean) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onBookmarkToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(!!project.isBookmarked);
  const [isToggling, setIsToggling] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || isToggling) return;

    setIsToggling(true);
    try {
      const res = await toggleProjectBookmarkApi(project.id);
      setIsBookmarked(res.isBookmarked);
      if (onBookmarkToggle) {
        onBookmarkToggle(project.id, res.isBookmarked);
      }
    } catch {
      // Ignored
    } finally {
      setIsToggling(false);
    }
  };

  const formattedBudget =
    project.budgetType === 'HOURLY'
      ? `$${project.minBudget || project.budget} - $${project.maxBudget || project.budget}/hr`
      : `$${Number(project.budget).toLocaleString()}`;

  const daysLeft = project.deadline
    ? Math.max(
        0,
        Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return (
    <div className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-brand-500/40 rounded-2xl p-6 transition-all duration-200 backdrop-blur-xl group flex flex-col justify-between relative shadow-lg hover:shadow-brand-500/5">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {project.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Layers className="w-3 h-3" /> {project.category.name}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                project.experienceLevel === 'EXPERT'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : project.experienceLevel === 'INTERMEDIATE'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {project.experienceLevel}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300">
              {project.budgetType}
            </span>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleBookmarkClick}
              disabled={isToggling}
              className={`p-2 rounded-xl transition-all ${
                isBookmarked
                  ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                  : 'text-slate-500 hover:text-slate-200 bg-slate-950/80 hover:bg-slate-800 border border-slate-800'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Project'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-brand-400' : ''}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/projects/${project.id}`}
          className="block group-hover:text-brand-400 transition-colors"
        >
          <h3 className="text-lg font-bold text-white tracking-tight leading-snug line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {/* Skills Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.skills?.slice(0, 5).map(({ skill }) => (
            <span
              key={skill.id}
              className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium"
            >
              {skill.name}
            </span>
          ))}
          {project.skills && project.skills.length > 5 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-500 text-[11px]">
              +{project.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Budget */}
        <div className="flex items-center gap-1.5 text-brand-400 font-bold text-base">
          <DollarSign className="w-4 h-4 -mr-1" />
          <span>{formattedBudget}</span>
        </div>

        {/* Client & Proposals Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {project.client?.companyName ? (
            <span
              className="flex items-center gap-1 truncate max-w-[120px]"
              title={project.client.companyName}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {project.client.companyName}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Client
            </span>
          )}

          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            {project._count?.proposals || project.proposalCount || 0} Proposals
          </span>

          {daysLeft !== null && (
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              {daysLeft === 0 ? 'Due Today' : `${daysLeft}d left`}
            </span>
          )}

          {!project.deadline && (
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
