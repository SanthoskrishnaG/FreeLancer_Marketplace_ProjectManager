import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, ShieldAlert } from 'lucide-react';

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
      header: 'Project',
      sortable: true,
      render: (row) => (
        <div>
          <Link to={`/projects/${row.id}`} className="font-semibold text-white hover:text-indigo-400">
            {row.title}
          </Link>
          <div className="text-xs text-gray-400">Client: {row.client?.name}</div>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-400">
          ${Number(row.budget).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <Badge variant={row.status} />,
    },
    {
      key: 'proposals',
      header: 'Proposals',
      render: (row) => <span>{row._count?.proposals || 0}</span>,
    },
    {
      key: 'actions',
      header: 'Moderation Action',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'OPEN' ? (
            <button
              onClick={() => handleOverrideStatus(row.id, 'CLOSED')}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-rose-900/40 text-xs text-rose-300 border border-rose-500/20"
            >
              Force Close
            </button>
          ) : (
            <button
              onClick={() => handleOverrideStatus(row.id, 'OPEN')}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-emerald-900/40 text-xs text-emerald-300 border border-emerald-500/20"
            >
              Reopen
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Project Moderation</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Inspect public job posts, detect terms violations, and apply administrative overrides.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        searchPlaceholder="Search projects..."
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
