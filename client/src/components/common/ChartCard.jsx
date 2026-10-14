import React from 'react';

export const ChartCard = ({ title, subtitle, action = null, children, className = '' }) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#3B82F6]/15 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default ChartCard;
