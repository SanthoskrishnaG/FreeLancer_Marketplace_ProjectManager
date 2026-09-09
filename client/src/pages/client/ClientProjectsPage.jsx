import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FolderPlus, Users, Eye, Trash2 } from 'lucide-react';

export const ClientProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getClientProjects();
      if (res.data) setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load client projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectApi.deleteProject(id);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (row) => (
        <div>
          <Link to={`/projects/${row.id}`} className="font-semibold text-white hover:text-indigo-400">
            {row.title}
          </Link>
          <div className="text-xs text-gray-400 mt-0.5">
            {row.category?.name || 'General'}
          </div>
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
      sortable: true,
      render: (row) => (
        <Link
          to={`/client/projects/${row.id}/proposals`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{row._count?.proposals || 0} Proposals</span>
        </Link>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created On',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${row.id}`}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {row.status === 'OPEN' && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-gray-800 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Projects</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage and review your published projects</p>
        </div>
        <Link
          to="/client/projects/create"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create AI Project</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        searchPlaceholder="Filter projects..."
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
