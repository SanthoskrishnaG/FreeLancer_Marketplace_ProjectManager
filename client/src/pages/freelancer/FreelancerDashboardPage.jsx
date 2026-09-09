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
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  Upload,
  RefreshCw,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
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

export const FreelancerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Submit deliverable modal
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardApi.getFreelancerDashboard();
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load freelancer dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('notes', notes);
      if (fileUrl) formData.append('fileUrl', fileUrl);

      await milestoneApi.submitMilestoneWork(activeMilestone.id, formData);
      alert('Deliverables submitted successfully for client review!');
      setSubmitModalOpen(false);
      setNotes('');
      setFileUrl('');
      setActiveMilestone(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { stats = {}, charts = {}, currentMilestones = [], recentContracts = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Freelancer Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track earnings, submitted proposals, milestone deadlines, and active client contracts.
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
            to="/projects"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Find New Projects</span>
          </Link>
        </div>
      </div>

      {/* 5 Statistical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Total Earnings"
          value={`$${Number(stats.totalEarnings || 0).toLocaleString()}`}
          subtitle={`+$${Number(stats.pendingEscrowEarnings || 0).toLocaleString()} in escrow`}
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Active Projects"
          value={stats.activeProjects || 0}
          subtitle={`${stats.completedProjects || 0} completed`}
          icon={Briefcase}
          color="purple"
        />
        <MetricCard
          title="Client Rating"
          value={`${Number(stats.rating || 5.0).toFixed(1)} / 5.0`}
          subtitle="Customer satisfaction"
          icon={Star}
          color="amber"
        />
        <MetricCard
          title="Working Hours"
          value={`${Number(stats.workingHours || 0).toFixed(1)} hrs`}
          subtitle="Tracked on contracts"
          icon={Clock}
          color="sky"
        />
        <MetricCard
          title="Proposals Sent"
          value={stats.totalProposals || 0}
          subtitle={`${stats.acceptedProposals || 0} accepted`}
          icon={FileText}
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings */}
        <ChartCard
          title="Monthly Earnings Breakdown"
          subtitle="Net payouts received per month"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyEarnings || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
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
                <Bar dataKey="earnings" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Working Hours Over Time */}
        <ChartCard
          title="Logged Working Hours"
          subtitle="Weekly billable hours logged via stopwatch"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.workingHoursTrends || []}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="h" />
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
                <Area type="monotone" dataKey="hours" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#hoursGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Current Milestones In Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Current Active Milestones</h3>
          </div>
          <Link to="/freelancer/milestones" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
            View All Milestones
          </Link>
        </div>

        {currentMilestones.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No active milestones in progress. Explore open opportunities on the marketplace!
          </div>
        ) : (
          <div className="space-y-3">
            {currentMilestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    <Badge variant={m.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Contract: <span className="text-slate-800 font-medium">{m.contract?.title}</span> • Client:{' '}
                    <span className="text-slate-800 font-medium">{m.contract?.client?.name}</span>
                  </p>
                  {m.acceptanceCriteria && (
                    <p className="text-[11px] text-slate-400">Criteria: {m.acceptanceCriteria}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-emerald-600">
                    ${Number(m.amount).toLocaleString()}
                  </span>
                  {m.status !== 'APPROVED' && (
                    <button
                      onClick={() => {
                        setActiveMilestone(m);
                        setSubmitModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Deliverable</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Deliverable Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Milestone Deliverable"
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <p className="text-xs text-slate-500">
            Submitting work for:{' '}
            <span className="text-slate-900 font-bold">{activeMilestone?.title}</span> ($
            {Number(activeMilestone?.amount || 0).toLocaleString()}). The client will be notified to review and release payment.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Notes & Walkthrough
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail the completed features, deployment URLs, testing instructions, or repo branch..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deliverable URL (GitHub / Demo Link / Drive)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/org/repo or demo link"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FreelancerDashboardPage;
