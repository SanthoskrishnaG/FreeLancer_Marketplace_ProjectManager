import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Star, MessageSquareQuote, Sparkles } from 'lucide-react';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/admin/analytics');
        setReviews([]);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const columns = [
    {
      key: 'reviewer',
      header: 'Reviewer',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
          {row.reviewer?.name || 'Client'}
        </span>
      ),
    },
    {
      key: 'targetUser',
      header: 'Reviewed Talent',
      render: (row) => (
        <span className="text-slate-700 dark:text-slate-300">
          {row.targetUser?.name || 'Freelancer'}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Score Rating',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-amber-500 font-semibold font-mono">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{row.rating} / 5</span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Audit Feedback',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 italic">
          "{row.comment}"
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Submitted Date',
      render: (row) => (
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          {new Date(row.createdAt || Date.now()).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>REPUTATION & SENTIMENT OVERSIGHT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Client & Freelancer Reviews Audit
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit customer feedback, delivery quality scores, and satisfaction ratings across verified completions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        searchPlaceholder="Filter reviews by client or talent..."
      />
    </div>
  );
};

export default AdminReviewsPage;
