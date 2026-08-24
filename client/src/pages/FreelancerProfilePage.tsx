import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFreelancerByIdApi } from '../api/profile.api.js';
import {
  Star,
  MapPin,
  Languages,
  Briefcase,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';

export const FreelancerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: freelancer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['freelancer', id],
    queryFn: () => getFreelancerByIdApi(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading professional profile...</p>
      </div>
    );
  }

  if (isError || !freelancer || !freelancer.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Freelancer not found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested freelancer profile does not exist or has been deactivated.
        </p>
        <Link
          to="/freelancers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  const user = freelancer.user;
  const portfolioItems = (freelancer.portfolio as any[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Header Profile Hero */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-extrabold text-3xl flex items-center justify-center shadow-xl shadow-brand-500/20 shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                `${user.firstName[0]}${user.lastName[0]}`
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                {freelancer.isAvailable && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Available for Work
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  {freelancer.experienceLevel}
                </span>
              </div>

              <p className="text-sm font-semibold text-brand-400">
                {freelancer.title || 'Senior Software Engineer'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {Number(freelancer.rating || 5.0).toFixed(1)} ({freelancer.reviewCount || 0}{' '}
                  reviews)
                </span>
                {(freelancer.country || user.location) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {freelancer.country || user.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {freelancer.experienceYears || 5}+ Years Experience
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center sm:text-right shrink-0">
            <p className="text-xs text-slate-400">Hourly Rate</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              ${Number(freelancer.hourlyRate || 75).toFixed(0)}
              <span className="text-xs font-normal text-slate-400">/hr</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Bio, Skills & Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Bio & Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white">About the Specialist</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {freelancer.bio || 'No detailed biography provided yet.'}
            </p>
          </div>

          {/* Portfolio Items */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-400" /> Verified Portfolio & Work Proofs
            </h2>

            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolioItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
                      )}
                    </div>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold pt-2"
                      >
                        Visit Project <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400">
                Portfolio items are being curated by this freelancer.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Skills & Languages */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" /> Verified Skills
            </h3>

            <div className="space-y-2">
              {freelancer.skills?.map(({ id, skill, proficiency }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                >
                  <span className="font-semibold text-white">{skill.name}</span>
                  {proficiency && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-brand-400 font-medium">
                      {proficiency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Languages className="w-4 h-4 text-brand-400" /> Languages Spoken
            </h3>

            <div className="flex flex-wrap gap-2">
              {freelancer.languages?.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
