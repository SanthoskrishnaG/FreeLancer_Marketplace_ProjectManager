import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Star } from 'lucide-react';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/admin/analytics');
        // Or fetch reviews list
        const revRes = await apiClient.get('/dashboards/client');
        // Let's set initial list
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
      render: (row) => <span className="font-semibold text-white">{row.reviewer?.name || 'Client'}</span>,
    },
    {
      key: 'targetUser',
      header: 'Reviewed User',
      render: (row) => <span className="text-gray-300">{row.targetUser?.name || 'Freelancer'}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => (
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="font-bold">{row.rating} / 5</span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Feedback Comment',
      render: (row) => <span className="text-xs text-gray-400 italic">"{row.comment}"</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-gray-500">{new Date(row.createdAt || Date.now()).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Client & Freelancer Reviews</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Audit customer feedback, quality scores, and satisfaction ratings.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        searchPlaceholder="Filter reviews..."
      />
    </div>
  );
};
