import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { ChartCard } from '../../components/common/ChartCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DashboardSkeleton } from '../../components/common/Skeleton.jsx';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileCheck2,
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  FileText,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CYBER_COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await adminApi.getOverview();
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { stats = {}, charts = {}, recentUsers = [], recentProjects = [] } = data || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GLOBAL PLATFORM GOVERNANCE & TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Platform Operations & Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time escrow health, contract volume, dispute arbitration, and user moderation.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchOverview();
          }}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-blue-500/20 shadow-sm transition-all self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 text-[#3B82F6] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Platform GMV"
          value={`₹${Number(stats.totalGMV || 0).toLocaleString('en-IN')}`}
          subtitle="Cumulative transaction volume"
          icon={IndianRupee}
          color="emerald"
        />
        <MetricCard
          title="Platform Fees"
          value={`₹${Number(stats.platformRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Commission revenue (10%)"
          icon={TrendingUp}
          color="indigo"
        />
        <MetricCard
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`${stats.totalClients || 0} clients, ${stats.totalFreelancers || 0} freelancers`}
          icon={Users}
          color="sky"
        />
        <MetricCard
          title="Open Disputes"
          value={stats.openDisputes || 0}
          subtitle="Requiring arbitration"
          icon={AlertTriangle}
          color={stats.openDisputes > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Projects</span>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] font-mono mt-0.5">
              {stats.activeProjects || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#3B82F6] dark:text-[#60A5FA]">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Contracts</span>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] font-mono mt-0.5">
              {stats.activeContracts || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Proposals</span>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] font-mono mt-0.5">
              {stats.totalProposals || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Projects Listed</span>
            <div className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] font-mono mt-0.5">
              {stats.totalProjects || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-[#8B5CF6] dark:text-[#A78BFA]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GMV Trends (Area Chart) */}
        <ChartCard
          title="Platform GMV & Revenue Velocity"
          subtitle="Monthly gross merchandise volume and net 10% platform fees"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.financialTrends || []}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111726',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                <Area type="monotone" dataKey="gmv" name="Gross Merchandise Volume (₹)" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gmvGrad)" />
                <Area type="monotone" dataKey="revenue" name="Platform Net Revenue (₹)" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Project Statuses (Pie Chart) */}
        <ChartCard
          title="Marketplace Status Breakdown"
          subtitle="Live distribution of client listings"
        >
          <div className="h-72 w-full flex items-center justify-center">
            {charts.projectsByStatus && charts.projectsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.projectsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {charts.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CYBER_COLORS[index % CYBER_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111726',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#F8FAFC',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No project status data</div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Governance Feeds: Recent Users & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3B82F6]" />
              <span>Latest Platform Users</span>
            </h3>
            <Link
              to="/admin/users"
              className="text-xs text-[#3B82F6] dark:text-[#60A5FA] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{u.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={u.role} />
                  <Badge variant={u.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#8B5CF6]" />
              <span>Latest Market Projects</span>
            </h3>
            <Link
              to="/admin/projects"
              className="text-xs text-[#8B5CF6] dark:text-[#A78BFA] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Moderation</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentProjects.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">{p.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Client: {p.client?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
                    ₹{Number(p.budget).toLocaleString('en-IN')}
                  </span>
                  <Badge variant={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
