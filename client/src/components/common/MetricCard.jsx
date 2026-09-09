import React from 'react';

const colorThemes = {
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    hoverBorder: 'hover:border-emerald-300',
  },
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    text: 'text-sky-600',
    hoverBorder: 'hover:border-sky-300',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    hoverBorder: 'hover:border-amber-300',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-600',
    hoverBorder: 'hover:border-rose-300',
  },
  purple: {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    text: 'text-violet-600',
    hoverBorder: 'hover:border-violet-300',
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
  const theme = colorThemes[color] || colorThemes.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all duration-200 relative overflow-hidden group ${
        theme.hoverBorder
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'hover:shadow-sm'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme.bg} ${theme.border} ${theme.text} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend !== null) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend !== null && (
            <span
              className={`font-semibold flex items-center ${
                trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
