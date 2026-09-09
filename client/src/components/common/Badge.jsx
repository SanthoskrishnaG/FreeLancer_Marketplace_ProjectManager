import React from 'react';

const badgeStyles = {
  // Statuses
  OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ACTIVE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  IN_PROGRESS: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UNDER_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SUBMITTED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  REVISION_REQUESTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  DISPUTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUSPENDED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  BANNED: 'bg-red-500/20 text-red-400 border-red-500/30',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  // Roles
  CLIENT: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  FREELANCER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  // Default
  DEFAULT: 'bg-gray-800 text-gray-300 border-gray-700',
};

export const Badge = ({ children, variant, className = '' }) => {
  const style = badgeStyles[variant] || badgeStyles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {children || variant}
    </span>
  );
};
