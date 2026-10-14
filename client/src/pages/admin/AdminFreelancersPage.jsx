import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CheckCircle2, XCircle, ShieldCheck, Star, Award, Sparkles } from 'lucide-react';

export const AdminFreelancersPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFreelancers();
      if (res.data?.profiles) setProfiles(res.data.profiles);
    } catch (err) {
      console.error('Failed to load freelancer profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleVerification = async (profileId, currentVerified) => {
    try {
      await adminApi.verifyFreelancer(profileId, !currentVerified);
      fetchProfiles();
    } catch (err) {
      alert(err.message || 'Verification update failed');
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'Freelancer Engineer',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.user?.name}`}
            alt={row.user?.name}
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-blue-500/30"
          />
          <div>
            <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.user?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{row.title || 'Full-Stack Developer'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Hourly Rate',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
          ₹{row.hourlyRate || 800}/hr
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Reputation / Deliveries',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold font-mono">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{Number(row.rating || 5.0).toFixed(1)}</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            ({row.completedProjectsCount || 0} jobs)
          </span>
        </div>
      ),
    },
    {
      key: 'isVerified',
      header: 'Verification Tier',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            row.isVerified
              ? 'bg-blue-500/10 text-[#3B82F6] dark:text-[#60A5FA] border-blue-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {row.isVerified ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Pro</span>
            </>
          ) : (
            <span>Unverified</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => handleToggleVerification(row.id, row.isVerified)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
            row.isVerified
              ? 'bg-white dark:bg-[#111726] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
              : 'btn-electric text-white'
          }`}
        >
          {row.isVerified ? (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>Revoke</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Profile</span>
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>TALENT VERIFICATION & CLEARANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Freelancer Talent Moderation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review developer portfolio submissions, verify engineering credentials, and grant verified status badges.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={profiles}
        loading={loading}
        searchPlaceholder="Search freelancer profiles..."
      />
    </div>
  );
};

export default AdminFreelancersPage;
