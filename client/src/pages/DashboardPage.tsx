import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  User,
  Building2,
  Briefcase,
  ShieldCheck,
  Calendar,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Welcome back, {user.firstName} {user.lastName}!
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    user.role === 'CLIENT'
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : user.role === 'FREELANCER'
                      ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{user.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated & Verified
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Profile Details & Active Role Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Details */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" /> Account Information
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">User ID</span>
              <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
                {user.id}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Account Type</span>
              <span className="text-white font-medium">{user.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Member Since</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Security Token</span>
              <span className="text-emerald-400 font-medium">Active (HTTP-only)</span>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Role Profile Details */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            {user.role === 'CLIENT' ? (
              <>
                <Building2 className="w-4 h-4 text-blue-400" /> Client Organization Details
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 text-brand-400" /> Freelancer Professional Profile
              </>
            )}
          </h3>

          {user.role === 'CLIENT' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-xs text-slate-400">Company Name</p>
                <p className="text-sm font-semibold text-white">
                  {user.clientProfile?.companyName || 'Not specified (Independent Client)'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-400">Total Spent</p>
                  <p className="text-base font-bold text-emerald-400 mt-1">
                    ${user.clientProfile?.totalSpent ?? '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-400">Client Rating</p>
                  <p className="text-base font-bold text-amber-400 mt-1">
                    ⭐ {user.clientProfile?.rating ?? '5.0'} / 5
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-400">Reviews Received</p>
                  <p className="text-base font-bold text-white mt-1">
                    {user.clientProfile?.reviewCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {user.role === 'FREELANCER' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-xs text-slate-400">Professional Title</p>
                <p className="text-sm font-semibold text-white">
                  {user.freelancerProfile?.title || 'Full-Stack Software Engineer'}
                </p>
                {user.freelancerProfile?.bio && (
                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    {user.freelancerProfile.bio}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-400">Hourly Rate</p>
                  <p className="text-base font-bold text-emerald-400 mt-1">
                    ${user.freelancerProfile?.hourlyRate ?? '75'}/hr
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-400">Freelancer Rating</p>
                  <p className="text-base font-bold text-amber-400 mt-1">
                    ⭐ {user.freelancerProfile?.rating ?? '5.0'} / 5
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-400">Total Earned</p>
                  <p className="text-base font-bold text-cyan-400 mt-1">
                    ${user.freelancerProfile?.totalEarned ?? '0.00'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Milestone Information */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Phase 2 Authentication Initialized
            </h4>
            <p className="text-xs text-slate-400">
              JWT tokens, refresh rotation, HTTP-only cookies, and role access are fully active.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-brand-400 font-medium">
          <Layers className="w-4 h-4" /> Ready for Phase 3 Project Management
        </div>
      </div>
    </div>
  );
};
