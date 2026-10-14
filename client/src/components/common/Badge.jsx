import React from 'react';

const badgeStyles = {
  // Statuses
  OPEN: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.12)]',
  ACTIVE: 'bg-[#3B82F6]/10 text-blue-600 dark:text-[#93C5FD] border-[#3B82F6]/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]',
  IN_PROGRESS: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.12)]',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.12)]',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  UNDER_REVIEW: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  SUBMITTED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  REVISION_REQUESTED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
  APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  CANCELLED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  DISPUTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  RESOLVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  SUSPENDED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  BANNED: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',

  // Roles
  CLIENT: 'bg-[#3B82F6]/10 text-blue-600 dark:text-[#93C5FD] border-[#3B82F6]/25',
  FREELANCER: 'bg-[#8B5CF6]/10 text-purple-600 dark:text-[#C4B5FD] border-[#8B5CF6]/25',
  ADMIN: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',

  // Default
  DEFAULT: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/20',
};

export const Badge = ({ children, variant, className = '' }) => {
  const style = badgeStyles[variant] || badgeStyles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-xs transition-colors ${style} ${className}`}
    >
      {children || variant}
    </span>
  );
};

export default Badge;
