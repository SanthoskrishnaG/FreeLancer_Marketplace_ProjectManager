import React from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck.js';

export const HealthBadge: React.FC = () => {
  const { data, isLoading, error, isHealthy, refetch } = useHealthCheck();

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs transition-all shadow-inner">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isLoading ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          ) : isHealthy ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          ) : (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLoading ? 'bg-amber-500' : isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          ></span>
        </span>
        <span className="text-slate-400 font-medium">Backend API:</span>
        {isLoading ? (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 animate-spin" /> Checking...
          </span>
        ) : isHealthy ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {data?.message || 'Online'}
          </span>
        ) : (
          <span className="text-rose-400 font-semibold flex items-center gap-1" title={error || ''}>
            <AlertCircle className="w-3 h-3" /> Offline
          </span>
        )}
      </div>

      <button
        onClick={() => refetch()}
        disabled={isLoading}
        title="Check Backend Health"
        className="text-slate-500 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-800 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
