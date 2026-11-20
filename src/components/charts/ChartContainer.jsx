import React from 'react';

export const ChartContainer = ({
  title,
  subtitle,
  children,
  filters,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-light-border bg-light-card p-5 sm:p-6 shadow-sm transition-colors duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-light-text tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-light-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {actions}
        </div>
      </div>

      <div className="w-full min-w-0 overflow-hidden">{children}</div>
    </div>
  );
};

export default ChartContainer;
