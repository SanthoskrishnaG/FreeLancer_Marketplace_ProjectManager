import React from 'react';

const badgeStyles = {
  // Statuses
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ACTIVE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  REVISION_REQUESTED: 'bg-purple-50 text-purple-700 border-purple-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  DISPUTED: 'bg-rose-50 text-rose-700 border-rose-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  BANNED: 'bg-red-50 text-red-700 border-red-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  // Roles
  CLIENT: 'bg-sky-50 text-sky-700 border-sky-200',
  FREELANCER: 'bg-violet-50 text-violet-700 border-violet-200',
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
  // Default
  DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const Badge = ({ children, variant, className = '' }) => {
  const style = badgeStyles[variant] || badgeStyles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      {children || variant}
    </span>
  );
};

export default Badge;
