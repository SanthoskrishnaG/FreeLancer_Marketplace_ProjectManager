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
  FileCheck2,
  DollarSign,
  Plus,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertCircle,
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
  Legend,
} from 'recharts';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

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
    if (!window.confirm('Are you sure you want to approve this milestone? This will release the allocated funds.')) return;
    setActionLoading(true);
    try {
      await milestoneApi.approveMilestone(milestoneId);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Milestone approval failed');
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
        revisionNotes,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>CLIENT WORKSPACE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Client <span className="gradient-cyber-text">Mission Control</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Overview of active projects, milestone approvals, and contract expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-blue-400 border border-slate-200 dark:border-blue-500/25 transition-colors shadow-xs"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/client/projects/create"
            className="btn-electric px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Project</span>
          </Link>
        </div>
      </div>

      {/* 4 Practical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Active Projects"
          value={stats.activeProjects || 0}
          subtitle={`${stats.totalProjects || 0} total created`}
          icon={Briefcase}
          color="neutral"
        />
        <MetricCard
          title="Active Contracts"
          value={stats.activeContracts || 0}
          subtitle="Currently in progress"
          icon={FileCheck2}
          color="indigo"
        />
        <MetricCard
          title="Total Spending"
          value={`₹${Number(stats.totalSpending || 0).toLocaleString('en-IN')}`}
          subtitle="Settled & released"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingMilestones.length || stats.pendingMilestones || 0}
          subtitle={pendingMilestones.length > 0 ? 'Requires your review' : 'All up to date'}
          icon={CheckCircle2}
          color={pendingMilestones.length > 0 ? 'amber' : 'neutral'}
        />
      </div>

      {/* Action Queue: Pending Milestone Approvals */}
      {pendingMilestones.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <h2 className="text-xs font-semibold text-slate-900 dark:text-amber-300 uppercase tracking-wide">
                Milestones Awaiting Approval ({pendingMilestones.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Action Required</span>
          </div>

          <div className="space-y-2.5">
            {pendingMilestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-amber-200/60 dark:border-amber-500/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{m.title}</h3>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                      ₹{Number(m.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contract: <span className="text-slate-700 dark:text-slate-200 font-medium">{m.contract?.title || m.projectTitle}</span>
                    {m.contract?.freelancer?.name && (
                      <> • Freelancer: <span className="text-slate-700 dark:text-slate-200 font-medium">{m.contract.freelancer.name}</span></>
                    )}
                  </p>
                  {m.submissions?.[0]?.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0D1220] p-2.5 rounded-lg border border-slate-100 dark:border-blue-500/10 mt-1.5 italic">
                      "{m.submissions[0].notes}"
                    </p>
                  )}
                  {m.submissions?.[0]?.fileUrl && (
                    <a
                      href={m.submissions[0].fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 pt-1"
                    >
                      <span>Inspect Deliverable Attachment</span>
                      <ExternalLink className="w-3 h-3" />
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
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-blue-500/25 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-blue-950/40 text-xs font-medium transition-colors"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleApproveMilestone(m.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Release</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Overview Table */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-slate-200/80 dark:border-blue-500/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Active assignments, proposals, and delivery status</p>
          </div>
          <Link
            to="/client/projects"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Briefcase}
              title="No projects published yet"
              description="Post a project requirement to start receiving structured proposals from specialists."
              action={
                <Link
                  to="/client/projects/create"
                  className="btn-electric px-3.5 py-2 rounded-lg text-xs font-semibold text-white shadow-sm inline-block"
                >
                  Post First Project
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0D1220] text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200/80 dark:border-blue-500/15">
                <tr>
                  <th className="py-3 px-4 sm:px-5">Project Title</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Proposals</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10">
                {recentProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-blue-950/20 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5">
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-medium text-slate-900 dark:text-[#F8FAFC] hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                      >
                        {p.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {p.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-emerald-400">
                      ₹{Number(p.budget).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <Link
                        to={`/client/projects/${p.id}/proposals`}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                      >
                        <span>{p._count?.proposals || 0} proposals</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/client/projects/${p.id}/proposals`}
                          className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-blue-500/30 text-slate-700 dark:text-blue-300 hover:bg-slate-50 dark:hover:bg-blue-950/40 text-xs font-medium"
                        >
                          Proposals
                        </Link>
                        <Link
                          to={`/projects/${p.id}`}
                          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Analytics & Delivery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard
          title="Expenditures Over Time"
          subtitle="Monthly payouts and milestone settlements"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.spendingOverTime || []}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spending']}
                  contentStyle={{
                    backgroundColor: '#111726',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Milestone Delivery Status"
          subtitle="Completion breakdown across all active contracts"
        >
          <div className="h-64 w-full flex items-center justify-center">
            {charts.milestoneCompletion && charts.milestoneCompletion.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.milestoneCompletion}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {charts.milestoneCompletion.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111726',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                No milestone activity logged yet.
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Request Revision Modal */}
      <Modal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Deliverable Revision"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Explain to the freelancer what revisions or adjustments are required for:{' '}
            <span className="text-slate-900 dark:text-white font-semibold">{activeMilestone?.title}</span>.
          </p>
          <textarea
            required
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. Please update the API endpoint error response handling as discussed in the spec..."
            className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setRevisionModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-electric px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientDashboardPage;
