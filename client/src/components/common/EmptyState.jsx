import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No data found',
  description = 'There are no records matching your criteria yet.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border-2 border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
