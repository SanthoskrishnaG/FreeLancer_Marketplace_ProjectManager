import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi.js';
import { milestoneApi } from '../../api/milestoneApi.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { ChartCard } from '../../components/common/ChartCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DashboardSkeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  Briefcase,
  Clock,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  FolderPlus,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#4F46E5', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const ClientDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Approval / Revision modal state
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardApi.getClientDashboard();
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load client dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to approve this deliverable and release escrow funds?')) return;
    setActionLoading(true);
    try {
      await milestoneApi.approveMilestone(milestoneId);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    setActionLoading(true);
    try {
      await milestoneApi.requestRevision(activeMilestone.id, {
        feedback: revisionNotes,
        requestedChanges: [revisionNotes],
      });
      setRevisionModalOpen(false);
      setRevisionNotes('');
      setActiveMilestone(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Revision request failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { stats = {}, charts = {}, pendingMilestones = [], recentProjects = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time project oversight, automated milestone verifications, and financial reporting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/client/projects/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create AI Project</span>
          </Link>
        </div>
      </div>

      {/* 5 Key Operational Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Active Projects"
          value={stats.activeProjects || 0}
          subtitle={`${stats.totalProjects || 0} total projects`}
          icon={Briefcase}
          color="indigo"
        />
        <MetricCard
          title="Total Spending"
          value={`$${Number(stats.totalSpending || 0).toLocaleString()}`}
          subtitle="Funded & released"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Active Contracts"
          value={stats.activeContracts || 0}
          subtitle="In development"
          icon={FileCheck2}
          color="sky"
        />
        <MetricCard
          title="Pending Approvals"
          value={stats.pendingMilestoneApprovals || 0}
          subtitle="Requires your review"
          icon={CheckCircle2}
          color="amber"
        />
        <MetricCard
          title="Open Disputes"
          value={stats.openDisputes || 0}
          subtitle="Arbitration queue"
          icon={AlertTriangle}
          color={stats.openDisputes > 0 ? 'rose' : 'indigo'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Over Time (Area Chart) */}
        <ChartCard
          title="Cumulative Spending Over Time"
          subtitle="Historical monthly payments and milestone payouts"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.spendingOverTime || []}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Milestone Completion Breakdown (Pie Chart) */}
        <ChartCard
          title="Milestone Status"
          subtitle="Work items distribution"
        >
          <div className="h-72 w-full flex items-center justify-center">
            {charts.milestoneCompletion && charts.milestoneCompletion.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.milestoneCompletion}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {charts.milestoneCompletion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0F172A',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No milestones yet" description="Milestones will reflect here once projects are active." />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Action Needed: Pending Milestone Approvals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Pending Milestone Approvals</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {pendingMilestones.length} item{pendingMilestones.length !== 1 ? 's' : ''} awaiting action
          </span>
        </div>

        {pendingMilestones.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            ✨ Great job! All milestone submissions are up-to-date and reviewed.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMilestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ${Number(m.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Contract: <span className="text-slate-800 font-medium">{m.contract?.title}</span> • Freelancer:{' '}
                    <span className="text-slate-800 font-medium">{m.contract?.freelancer?.name}</span>
                  </p>
                  {m.submissions?.[0]?.notes && (
                    <p className="text-xs text-indigo-600 italic pt-1">
                      Note: "{m.submissions[0].notes}"
                    </p>
                  )}
                  {m.submissions?.[0]?.fileUrl && (
                    <a
                      href={m.submissions[0].fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 underline block pt-0.5 font-medium"
                    >
                      View Submitted Deliverable File
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveMilestone(m);
                      setRevisionModalOpen(true);
                    }}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-semibold transition-colors"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleApproveMilestone(m.id)}
                    disabled={actionLoading}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Release</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Projects Table Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Projects Overview</h3>
          </div>
          <Link to="/client/projects" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects created yet"
            description="Post your first project using our AI-assisted scoping generator."
            action={
              <Link
                to="/client/projects/create"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white shadow-xs"
              >
                Create Project
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentProjects.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                    <Link to={`/projects/${p.id}`}>{p.title}</Link>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">${Number(p.budget).toLocaleString()}</span>
                    <span>•</span>
                    <span>{p._count?.proposals || 0} proposals</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.status} />
                  <Link
                    to={`/client/projects/${p.id}/proposals`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold p-1"
                    title="View Proposals"
                  >
                    Proposals
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Revision Modal */}
      <Modal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Deliverable Revision"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <p className="text-xs text-slate-500">
            Specify clearly what changes or improvements are required for milestone:{' '}
            <span className="text-slate-900 font-bold">{activeMilestone?.title}</span>.
          </p>
          <textarea
            required
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. Please update the API response formatting according to spec section 3.2..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRevisionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
            >
              Send Revision Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientDashboardPage;
