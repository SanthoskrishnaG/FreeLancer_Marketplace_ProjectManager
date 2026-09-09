import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search,
  Users,
  Star,
  CheckCircle2,
  DollarSign,
  Briefcase,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const FreelancersDirectoryPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      try {
        const res = await authApi.getFreelancers({ search: search || undefined });
        if (res.data) setFreelancers(res.data.freelancers || []);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchFreelancers, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Top Verified Engineering & AI Talent</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Find Pre-Vetted Freelancers
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Collaborate with high-performance developers, designers, and AI specialists. Verified identities and validated project histories.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-gray-800">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search freelancers by name, skill (e.g. React, Python, Docker)..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Freelancers Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex gap-3">
                <Skeleton className="w-12 h-12" variant="circle" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-full h-12" />
            </div>
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No freelancers found"
          description="We couldn't find any profiles matching your search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((f) => {
            const profile = f.freelancerProfile || {};
            return (
              <div
                key={f.id}
                className="glass-card p-6 rounded-2xl border border-gray-800 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={f.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.name}`}
                        alt={f.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                            {f.name}
                          </h3>
                          {profile.isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">
                          {profile.title || 'Software Specialist'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      ${profile.hourlyRate || 45}/hr
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                    {profile.bio || 'Experienced developer dedicated to delivering clean code, robust architecture, and prompt milestone communication.'}
                  </p>

                  {/* Skills tags */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profile.skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20"
                        >
                          {s.skill?.name || s.name}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{profile.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-gray-800/80 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{Number(profile.rating || 5.0).toFixed(1)}</span>
                    <span className="text-gray-500">({profile.completedProjectsCount || 0} jobs)</span>
                  </div>

                  <Link
                    to={`/freelancers/${f.id}`}
                    className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
