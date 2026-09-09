import React from 'react';

export const ChartCard = ({ title, subtitle, action = null, children, className = '' }) => {
  return (
    <div className={`glass-card p-6 rounded-2xl border border-gray-800/80 shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};
