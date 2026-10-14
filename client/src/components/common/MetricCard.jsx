import React from 'react';

const colorThemes = {
  indigo: {
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/25',
    text: 'text-[#3B82F6] dark:text-[#60A5FA]',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  sky: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]',
  },
  purple: {
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/25',
    text: 'text-[#8B5CF6] dark:text-[#A78BFA]',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  },
  neutral: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    glow: '',
  },
};

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend = null,
  trendLabel = null,
  onClick = null,
}) => {
  const theme = colorThemes[color] || colorThemes.neutral;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#3B82F6]/15 transition-all duration-200 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
        onClick
          ? 'cursor-pointer hover:border-[#3B82F6]/40 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]'
          : 'hover:border-slate-300 dark:hover:border-[#3B82F6]/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] truncate mb-1 uppercase tracking-wider">
            {title}
          </p>
          <div className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight font-display">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-200 ${theme.bg} ${theme.border} ${theme.text} ${theme.glow}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend !== null) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
          {trend !== null && (
            <span
              className={`font-bold px-1.5 py-0.5 rounded-md ${
                trend >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          {trendLabel && <span>{trendLabel}</span>}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
