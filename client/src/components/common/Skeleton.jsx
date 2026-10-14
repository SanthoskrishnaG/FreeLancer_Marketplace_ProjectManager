import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-md';
  const variants = {
    circle: 'rounded-full',
    text: 'h-4 rounded',
    rect: 'rounded-lg',
  };

  return <div className={`${base} ${variants[variant] || ''} ${className}`} />;
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-slate-200 dark:border-[#3B82F6]/15 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-8 h-8" variant="circle" />
            </div>
            <Skeleton className="w-20 h-7" />
            <Skeleton className="w-32 h-3" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-slate-200 dark:border-[#3B82F6]/15 space-y-4">
          <Skeleton className="w-36 h-5" />
          <Skeleton className="w-full h-64" />
        </div>
        <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-slate-200 dark:border-[#3B82F6]/15 space-y-4">
          <Skeleton className="w-36 h-5" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-slate-200 dark:border-[#3B82F6]/15 space-y-4">
        <Skeleton className="w-48 h-5" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
