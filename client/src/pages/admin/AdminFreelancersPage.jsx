import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CheckCircle2, XCircle, ShieldCheck, Star } from 'lucide-react';

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
      header: 'Freelancer',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.user?.name}`}
            alt={row.user?.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-700"
          />
          <div>
            <div className="font-semibold text-white">{row.user?.name}</div>
            <div className="text-xs text-gray-400">{row.title || 'Developer'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Hourly Rate',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-400">${row.hourlyRate || 45}/hr</span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating / Jobs',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-amber-400">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{Number(row.rating || 5.0).toFixed(1)}</span>
          <span className="text-gray-500">({row.completedProjectsCount || 0})</span>
        </div>
      ),
    },
    {
      key: 'isVerified',
      header: 'Verification Status',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            row.isVerified
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              : 'bg-gray-800 text-gray-400 border-gray-700'
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
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            row.isVerified
              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Freelancer Verification Queue</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Review talent qualifications, background credentials, and award the blue verification badge.
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
