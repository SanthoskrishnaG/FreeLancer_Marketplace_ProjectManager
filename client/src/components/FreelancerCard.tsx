import React from 'react';
import { Link } from 'react-router-dom';
import { FreelancerProfile } from '../types/index.js';
import { Star, MapPin, DollarSign, ArrowRight } from 'lucide-react';

interface FreelancerCardProps {
  freelancer: FreelancerProfile;
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({ freelancer }) => {
  const user = freelancer.user;
  if (!user) return null;

  return (
    <div className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-brand-500/40 rounded-2xl p-6 transition-all duration-200 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:shadow-brand-500/5 group">
      <div>
        {/* Top User Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              `${user.firstName[0]}${user.lastName[0]}`
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/freelancers/${freelancer.id}`}
                className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate"
              >
                {user.firstName} {user.lastName}
              </Link>
              {freelancer.isAvailable && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-brand-400 truncate mt-0.5">
              {freelancer.title || 'Full-Stack Developer'}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {Number(freelancer.rating || 5.0).toFixed(1)} ({freelancer.reviewCount || 0})
              </span>
              {(freelancer.country || user.location) && (
                <span className="flex items-center gap-1 truncate text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {freelancer.country || user.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {freelancer.bio ||
            'Experienced specialist delivering high-performance solutions for top clients.'}
        </p>

        {/* Skills Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {freelancer.skills?.slice(0, 4).map(({ skill }) => (
            <span
              key={skill.id}
              className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium"
            >
              {skill.name}
            </span>
          ))}
          {freelancer.skills && freelancer.skills.length > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-500 text-[11px]">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Rate & Action */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center text-sm font-bold text-white">
          <DollarSign className="w-4 h-4 text-emerald-400 -mr-1" />
          <span>{Number(freelancer.hourlyRate || 75).toFixed(0)}</span>
          <span className="text-xs font-normal text-slate-400">/hr</span>
        </div>

        <Link
          to={`/freelancers/${freelancer.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-colors"
        >
          View Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
