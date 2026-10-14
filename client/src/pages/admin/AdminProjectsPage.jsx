import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProjects();
      if (res.data?.projects) setProjects(res.data.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOverrideStatus = async (projectId, status) => {
    try {
      await adminApi.updateProjectStatus(projectId, status);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Status override failed');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Marketplace Listing',
      sortable: true,
      render: (row) => (
        <div>
          <Link
            to={`/projects/${row.id}`}
            className="font-semibold text-slate-900 dark:text-[#F8FAFC] hover:text-[#3B82F6] dark:hover:text-[#60A5FA] flex items-center gap-1.5 transition-colors"
          >
            <span>{row.title}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client: <span className="text-slate-700 dark:text-slate-300 font-medium">{row.client?.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Allocated Budget',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
          ₹{Number(row.budget).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Listing Status',
      sortable: true,
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: 'proposals',
      header: 'Bid Volume',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          {row._count?.proposals || 0} bids
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Moderation Action',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'OPEN' ? (
            <button
              onClick={() => handleOverrideStatus(row.id, 'CLOSED')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-all shadow-xs"
            >
              Force Close
            </button>
          ) : (
            <button
              onClick={() => handleOverrideStatus(row.id, 'OPEN')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 transition-all shadow-xs"
            >
              Reopen
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>PROJECT MODERATION & GOVERNANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Marketplace Project Moderation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inspect client job postings, ensure technical accuracy, and apply administrative enforcement when needed.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        searchPlaceholder="Search projects by title..."
        filterKey="status"
        filterOptions={[
          { label: 'Open', value: 'OPEN' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Closed', value: 'CLOSED' },
        ]}
      />
    </div>
  );
};

export default AdminProjectsPage;
