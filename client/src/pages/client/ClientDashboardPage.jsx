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

const PIE_COLORS = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'];

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
      await milestoneApi.requestRevision(activeMilestone.id, revisionNotes);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Client Workspace
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time project oversight, automated milestone verifications, and financial reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/client/projects/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create AI Project</span>
          </Link>
        </div>
      </div>

      {/* 9 Key Operational Statistics Cards */}
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
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#6366f1"
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
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No milestones yet" description="Milestones will reflect here once projects are active." />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Action Needed: Pending Milestone Approvals */}
      <div className="glass-card rounded-2xl border border-gray-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Pending Milestone Approvals</h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {pendingMilestones.length} item{pendingMilestones.length !== 1 ? 's' : ''} awaiting action
          </span>
        </div>

        {pendingMilestones.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-gray-900/30 rounded-xl border border-gray-800/60">
            ✨ Great job! All milestone submissions are up-to-date and reviewed.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMilestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ${Number(m.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Contract: <span className="text-gray-300 font-medium">{m.contract?.title}</span> • Freelancer:{' '}
                    <span className="text-gray-300 font-medium">{m.contract?.freelancer?.name}</span>
                  </p>
                  {m.submissions?.[0]?.notes && (
                    <p className="text-xs text-indigo-300 italic pt-1">
                      Note: "{m.submissions[0].notes}"
                    </p>
                  )}
                  {m.submissions?.[0]?.fileUrl && (
                    <a
                      href={m.submissions[0].fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 underline block pt-0.5"
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
                    className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-medium transition-colors"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleApproveMilestone(m.id)}
                    disabled={actionLoading}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
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
      <div className="glass-card rounded-2xl border border-gray-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recent Projects Overview</h3>
          </div>
          <Link to="/client/projects" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
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
                className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white"
              >
                Create Project
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-800">
            {recentProjects.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                    <Link to={`/projects/${p.id}`}>{p.title}</Link>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>${Number(p.budget).toLocaleString()}</span>
                    <span>•</span>
                    <span>{p._count?.proposals || 0} proposals</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.status} />
                  <Link
                    to={`/client/projects/${p.id}/proposals`}
                    className="text-xs text-gray-400 hover:text-white p-1"
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
          <p className="text-xs text-gray-400">
            Specify clearly what changes or improvements are required for milestone:{' '}
            <span className="text-white font-semibold">{activeMilestone?.title}</span>.
          </p>
          <textarea
            required
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. Please update the API response formatting according to spec section 3.2..."
            className="w-full p-3 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRevisionModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30"
            >
              Send Revision Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
