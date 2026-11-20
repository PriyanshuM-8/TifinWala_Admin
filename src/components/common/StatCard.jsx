import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-primary',
  iconBg = 'bg-brand-primary/10',
  trend, // { type: 'up' | 'down' | 'neutral', text: string }
  badge, // string or ReactNode
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-light-border bg-light-card p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-brand-primary/40' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-light-muted truncate">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-light-text truncate">
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconBg} ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || badge) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-light-border/60 pt-3 text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 font-medium">
              {trend.type === 'up' && (
                <span className="flex items-center gap-0.5 text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {trend.text}
                </span>
              )}
              {trend.type === 'down' && (
                <span className="flex items-center gap-0.5 text-rose-600">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {trend.text}
                </span>
              )}
              {trend.type === 'neutral' && (
                <span className="flex items-center gap-0.5 text-gray-500">
                  <Minus className="h-3.5 w-3.5" />
                  {trend.text}
                </span>
              )}
            </div>
          ) : subtitle ? (
            <span className="text-light-muted truncate">{subtitle}</span>
          ) : (
            <span />
          )}

          {badge && (
            <span className="inline-flex items-center rounded-full bg-light-secondary px-2.5 py-0.5 text-[10px] font-semibold text-light-muted">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
