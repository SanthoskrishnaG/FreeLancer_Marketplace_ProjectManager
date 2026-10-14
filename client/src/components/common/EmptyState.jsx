import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No data found',
  description = 'There are no records matching your criteria yet.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-[#111726]/60 border-2 border-dashed border-slate-200 dark:border-[#3B82F6]/20">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#3B82F6]/25 flex items-center justify-center text-slate-400 dark:text-[#60A5FA] mb-4 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
