import React from 'react';

export const ChartCard = ({ title, subtitle, action = null, children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default ChartCard;
