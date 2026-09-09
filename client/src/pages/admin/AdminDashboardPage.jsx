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
  DollarSign,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  FileText,
  Activity,
  ArrowRight,
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

const STATUS_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#38bdf8', '#f43f5e'];

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Operations & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Full platform metrics, escrow health, moderation queues, and real-time transaction oversight.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchOverview();
          }}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors self-start sm:self-auto"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 10 Enterprise Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Platform GMV"
          value={`$${Number(stats.totalGMV || 0).toLocaleString()}`}
          subtitle="Total transaction volume"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Platform Fees"
          value={`$${Number(stats.platformRevenue || 0).toLocaleString()}`}
          subtitle="Platform revenue (10%)"
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
          title="Active Contracts"
          value={stats.activeContracts || 0}
          subtitle={`${stats.totalContracts || 0} total created`}
          icon={FileCheck2}
          color="purple"
        />
        <MetricCard
          title="Open Disputes"
          value={stats.openDisputes || 0}
          subtitle="Requires arbitration"
          icon={AlertTriangle}
          color={stats.openDisputes > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Active Projects</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.activeProjects || 0}</div>
          </div>
          <Briefcase className="w-6 h-6 text-indigo-400" />
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Submitted Proposals</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.totalProposals || 0}</div>
          </div>
          <FileText className="w-6 h-6 text-sky-400" />
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Unverified Freelancers</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.unverifiedFreelancers || 0}</div>
          </div>
          <ShieldCheck className="w-6 h-6 text-amber-400" />
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Projects</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.totalProjects || 0}</div>
          </div>
          <Activity className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Recharts Analytics Charts */}
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
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Area type="monotone" dataKey="gmv" name="GMV ($)" stroke="#10b981" fill="url(#gmvGrad)" />
                <Area type="monotone" dataKey="revenue" name="Platform Revenue ($)" stroke="#6366f1" fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Project Statuses (Pie Chart) */}
        <ChartCard
          title="Projects by Status"
          subtitle="Distribution of marketplace listings"
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
                    paddingAngle={3}
                  >
                    {charts.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
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
              <div className="text-xs text-gray-500">No project status data</div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Quick Governance Tables: Recent Users & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="glass-card rounded-2xl border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Latest Platform Users</span>
            </h3>
            <Link to="/admin/users" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
              <span>Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-800">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{u.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{u.email}</div>
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
        <div className="glass-card rounded-2xl border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Latest Market Projects</span>
            </h3>
            <Link to="/admin/projects" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              <span>Moderation</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-800">
            {recentProjects.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{p.title}</div>
                  <div className="text-[11px] text-gray-400 truncate">Client: {p.client?.name}</div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs font-bold text-emerald-400">${Number(p.budget).toLocaleString()}</span>
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
