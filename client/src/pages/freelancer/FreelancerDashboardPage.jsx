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
  Clock,
  FileText,
  Star,
  CheckCircle2,
  Upload,
  ArrowRight,
  RefreshCw,
  Send,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const FreelancerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Submit modal state
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>FREELANCER WORKSPACE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Freelancer <span className="gradient-cyber-text">Mission Control</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Track active milestones, deliverables in review, and payment disbursements.
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
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/freelancer/projects/create"
            className="btn-electric px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Project Idea</span>
          </Link>
        </div>
      </div>

      {/* 4 Practical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Total Earnings"
          value={`₹${Number(stats.totalEarnings || 0).toLocaleString('en-IN')}`}
          subtitle="Net payouts received"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Active Contracts"
          value={stats.activeContracts || 0}
          subtitle={`${stats.completedProjects || 0} completed`}
          icon={Briefcase}
          color="indigo"
        />
        <MetricCard
          title="Active Milestones"
          value={currentMilestones.length || 0}
          subtitle="Deliverables in progress"
          icon={CheckCircle2}
          color="sky"
        />
        <MetricCard
          title="Proposals Submitted"
          value={stats.totalProposals || 0}
          subtitle={`${stats.acceptedProposals || 0} accepted`}
          icon={FileText}
          color="neutral"
        />
      </div>

      {/* Current Milestones In Progress Table */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-slate-200/80 dark:border-blue-500/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Active Milestone Deliverables</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Tasks currently underway requiring submission</p>
          </div>
          <Link
            to="/freelancer/milestones"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <span>View all milestones</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {currentMilestones.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CheckCircle2}
              title="No active deliverables due"
              description="You have no milestones currently in progress. Apply to new projects on the marketplace."
              action={
                <Link
                  to="/projects"
                  className="btn-electric px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm inline-block"
                >
                  Browse Open Projects
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0D1220] text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200/80 dark:border-blue-500/15">
                <tr>
                  <th className="py-3 px-4 sm:px-5">Milestone Title</th>
                  <th className="py-3 px-4">Contract / Project</th>
                  <th className="py-3 px-4">Allocated Escrow</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10">
                {currentMilestones.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-blue-950/20 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {m.title}
                      {m.dueDate && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {m.contract?.project?.title || m.contract?.title || m.projectTitle || 'Project Contract'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-emerald-400">
                      ₹{Number(m.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={m.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {m.status !== 'APPROVED' ? (
                        <button
                          onClick={() => {
                            setActiveMilestone(m);
                            setSubmitModalOpen(true);
                          }}
                          className="btn-electric px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Work</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Earnings Chart */}
      <ChartCard
        title="Monthly Earnings"
        subtitle="Historical cleared payouts received by month"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyEarnings || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Earned']}
                contentStyle={{
                  backgroundColor: '#111726',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              />
              <Bar dataKey="earnings" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Submit Deliverable Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Milestone Deliverable"
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Submit completed work for:{' '}
            <span className="text-slate-900 dark:text-white font-semibold">{activeMilestone?.title}</span> (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{Number(activeMilestone?.amount || 0).toLocaleString('en-IN')}</span>).
            The client will review the submission before approving escrow release.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Submission Walkthrough & Notes
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail the completed deliverables, instructions for testing, changes made..."
              className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Deliverable URL (GitHub repo, preview link, or cloud asset)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/org/repo or https://preview.domain.com"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-electric px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Deliverable</span>
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
