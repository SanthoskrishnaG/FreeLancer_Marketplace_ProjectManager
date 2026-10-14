import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { projectApi } from '../../api/projectApi.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Plus, Users, Eye, Trash2, ArrowRight, Layers } from 'lucide-react';

export const ClientProjectsPage = () => {
  const { isFreelancer } = useAuth();
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
          <Link
            to={`/projects/${row.id}`}
            className="font-semibold text-slate-900 dark:text-[#F8FAFC] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {row.title}
          </Link>
          <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
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
        <span className="font-bold text-slate-900 dark:text-emerald-400">
          ₹{Number(row.budget).toLocaleString('en-IN')}
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
      header: isFreelancer ? 'Milestones Planned' : 'Proposals Received',
      sortable: true,
      render: (row) => isFreelancer ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
          <Layers className="w-3.5 h-3.5" />
          <span>{row._count?.milestones ?? row.milestones?.length ?? 0} Milestones</span>
        </div>
      ) : (
        <Link
          to={`/client/projects/${row.id}/proposals`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-medium transition-colors"
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
        <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/projects/${row.id}`}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {(row.status === 'DRAFT' || row.status === 'OPEN' || row.status === 'PUBLISHED') && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-blue-500/15">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            {isFreelancer ? (
              <>My Project Ideas & <span className="gradient-cyber-text">Scopes</span></>
            ) : (
              <>My <span className="gradient-cyber-text">Projects</span></>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            {isFreelancer
              ? 'Review your proposed project scopes, milestone breakdowns, and technical deliverables.'
              : 'Manage your created requirements, view received proposals, and track execution.'}
          </p>
        </div>
        <Link
          to={isFreelancer ? '/freelancer/projects/create' : '/client/projects/create'}
          className="btn-electric px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFreelancer ? 'Add Project Idea' : 'Post New Project'}</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        searchPlaceholder="Filter projects by title..."
        filterKey="status"
        filterOptions={[
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
      />
    </div>
  );
};

export default ClientProjectsPage;
